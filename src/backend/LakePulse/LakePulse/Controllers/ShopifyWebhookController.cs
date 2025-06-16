using LakePulse.Data;
using LakePulse.Models;
using LakePulse.Services.SuperAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace LakePulse.Controllers
{
    [Authorize]
    [Route("api/shopify-webhook")]
    [ApiController]
    public class ShopifyWebhookController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ISuperAdminService _superAdminService;
        private readonly ILogger<ShopifyWebhookController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly string _shopifyStore;
        private readonly string _shopifyStorefrontAccessToken;

        public ShopifyWebhookController(IConfiguration configuration,
            ISuperAdminService superAdminService,
            ILogger<ShopifyWebhookController> logger,
            ApplicationDbContext context)
        {
            _configuration = configuration;
            _superAdminService = superAdminService;
            _logger = logger;
            _context = context;
            _shopifyStore = _configuration["Shopify:Store"];
            _shopifyStorefrontAccessToken = _configuration["Shopify:StorefrontAPIAccessToken"];
        }

        /// <summary>
        /// Creates a Shopify cart for the given email and variant ID.
        /// </summary>
        /// <param name="email">The email of the buyer.</param>
        /// <param name="variantId">The ID of the product variant.</param>
        /// <returns>The checkout URL of the created cart.</returns>
        /// <exception cref="Exception">Thrown when the Shopify API returns an error or an unexpected response.</exception>
        [HttpGet("checkout")]
        public async Task<string> CreateShopifyCart(string email, string variantId)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("X-Shopify-Storefront-Access-Token", _shopifyStorefrontAccessToken);

            var query = new
            {
                query = @"
        mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
                cart {
                    id
                    checkoutUrl
                }
                userErrors {
                    field
                    message
                }
            }
        }",
                variables = new
                {
                    input = new
                    {
                        lines = new[]
                        {
                    new { merchandiseId = "gid://shopify/ProductVariant/"+variantId, quantity = 1 }
                },
                        buyerIdentity = new
                        {
                            email = email
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(query);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(
                $"https://{_shopifyStore}.myshopify.com/api/2023-10/graphql.json",
                content
            );

            var responseData = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception(StringConstant.shopifyStorefrontAPIError + $": {responseData}");
            }

            Console.WriteLine(StringConstant.shopifyResponse + $": {responseData}");

            using var doc = JsonDocument.Parse(responseData);
            if (!doc.RootElement.TryGetProperty("data", out var dataElement) ||
                !dataElement.TryGetProperty("cartCreate", out var cartElement) ||
                cartElement.ValueKind == JsonValueKind.Null)
            {
                throw new Exception(StringConstant.unexpectedShopifyResponse + $": {responseData}");
            }

            // Handle potential user errors
            if (cartElement.TryGetProperty("userErrors", out var errors) && errors.GetArrayLength() > 0)
            {
                var errorMessage = errors[0].GetProperty("message").GetString();
                throw new Exception(StringConstant.shopifyAPIError + $": {errorMessage}");
            }

            var checkoutUrl = cartElement.GetProperty("cart").GetProperty("checkoutUrl").GetString();
            return checkoutUrl ?? throw new Exception(StringConstant.failedToGetCheckoutURL);
        }

        /// <summary>
        /// Handles the payment success webhook from Shopify.
        /// Validates the HMAC signature, parses the request body, and stores the payment details in the database.
        /// </summary>
        /// <returns>An IActionResult indicating the result of the webhook processing.</returns>
        [AllowAnonymous]
        [HttpPost("payment-success")]
        public async Task<IActionResult> PaymentSuccessWebhook()
        {
            try
            {
                using StreamReader reader = new StreamReader(Request.Body);
                string requestBody = await reader.ReadToEndAsync();

                // Validate HMAC Signature
                if (!VerifyShopifySignature(Request.Headers["X-Shopify-Hmac-SHA256"], requestBody))
                {
                    _logger.LogWarning(StringConstant.invalidWebhookSignature);
                    return Unauthorized();
                }

                var jsonData = JObject.Parse(requestBody);
                string? orderId = jsonData["id"]?.ToString();
                string? totalPrice = jsonData["current_total_price"]?.ToString();
                string? currency = jsonData["currency"]?.ToString();
                string? customerEmail = jsonData["email"]?.ToString();

                JToken? lineItems = jsonData["line_items"]?.FirstOrDefault();
                if (lineItems == null)
                {
                    _logger.LogWarning(StringConstant.noProductsFound);
                    return BadRequest(StringConstant.noProductsFound);
                }

                string? productId = lineItems["product_id"]?.ToString();
                string? variantId = lineItems["variant_id"]?.ToString();
                string? productName = lineItems["name"]?.ToString();
                string? productPrice = lineItems["price"]?.ToString();

                if (customerEmail != null)
                {
                    string? subId = await _superAdminService.GetUserSubByEmailAsync(customerEmail);
                    UserLake? lakeDtails = await _context.UserLakes.FirstOrDefaultAsync(x => x.UserId == subId);

                    LakeSubscription lakeSubscription = new LakeSubscription
                    {
                        Id = Guid.NewGuid(),
                        UserId = subId,
                        LakeId = lakeDtails?.LakeId ?? "1",
                        OrderId = orderId,
                        TotalPrice = totalPrice,
                        Currency = currency,
                        CustomerEmail = customerEmail,
                        ProductId = productId,
                        VariantId = variantId,
                        ProductName = productName,
                        ProductPrice = productPrice,
                        SubscriptionEndDate = DateTime.UtcNow.AddMonths(12),
                        CreatedTime = DateTime.UtcNow,
                        CreatedBy = subId
                    };

                    _context.LakeSubscriptions.Add(lakeSubscription);
                    await _context.SaveChangesAsync();
                }

                // Store payment details in DB (Mocked for now)
                _logger.LogInformation(StringConstant.webhookReceivedSuccessfully + $": Order ID = {orderId}");

                return Ok(new { message = StringConstant.webhookReceivedSuccessfully });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(StringConstant.webhookProcessingFailed + $": {ex.Message}");
                return StatusCode(500, StringConstant.webhookProcessingFailed);
            }
        }

        /// <summary>
        /// Verifies the HMAC signature of the Shopify webhook request.
        /// </summary>
        /// <param name="receivedHmac">The HMAC signature received from Shopify.</param>
        /// <param name="requestBody">The body of the webhook request.</param>
        /// <returns>True if the signature is valid, otherwise false.</returns>
        private bool VerifyShopifySignature(string receivedHmac, string requestBody)
        {
            string shopifySecret = _configuration["Shopify:WebhookSecret"];
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(shopifySecret));
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(requestBody));
            var computedHmac = Convert.ToBase64String(computedHash);

            return receivedHmac == computedHmac;
        }
    }
}
