using AutoMapper;
using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Common;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
using System.Net.Http.Headers;
using System.Text.Json;

namespace LakePulse.Services.Toolbox
{
    public class ToolboxService : IToolboxService
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly string _shopifyStore;
        private readonly string _shopifyAdminAccessToken;
        private readonly string _postgresConnection;
        private readonly string _redshiftConnection;
        private readonly ICommonService _commonService;

        public ToolboxService(IConfiguration configuration,
            ApplicationDbContext context,
            IMapper mapper,
            ICommonService commonService)
        {
            _configuration = configuration;
            _shopifyStore = _configuration["Shopify:ToolboxStore"];
            _shopifyAdminAccessToken = _configuration["Shopify:ToolboxAdminAPIAccessToken"];
            _postgresConnection = _configuration["ConnectionStrings:PostgresConnection"];
            _redshiftConnection = _configuration["ConnectionStrings:RedshiftConnection"];
            _context = context;
            _mapper = mapper;
            _commonService = commonService;
        }


        /// <summary>  
        /// Synchronizes the user's Shopify orders with the system using the provided email address and lakePulseId.  
        /// Fetches orders from Shopify, updates existing records, and inserts new ones into the database.  
        /// </summary>  
        /// <param name="email">The email address of the user whose Shopify orders are to be synchronized.</param>  
        /// <param name="lakePulseId">The unique identifier of the lake associated with the orders.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        public async Task SyncUserShopifyOrdersAsync(string email, int lakePulseId)
        {
            try
            {
                using HttpClient _httpClient = new();
                _httpClient.BaseAddress = new Uri($"https://{_shopifyStore}.myshopify.com/admin/api/2023-10/");
                _httpClient.DefaultRequestHeaders.Add("X-Shopify-Access-Token", _shopifyAdminAccessToken);
                _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                HttpResponseMessage ordersResponse = await _httpClient.GetAsync($"orders.json?email={email}&status=any");

                if (!ordersResponse.IsSuccessStatusCode)
                    throw new Exception("Order fetch failed");

                string ordersJson = await ordersResponse.Content.ReadAsStringAsync();
                JsonDocument ordersDoc = JsonDocument.Parse(ordersJson);
                List<JsonElement> orders = ordersDoc.RootElement.GetProperty("orders").EnumerateArray().ToList();
                List<ToolboxPurchases> toolboxPurchases = new List<ToolboxPurchases>();

                foreach (var order in orders)
                {
                    string? createdAt = order.GetProperty("created_at").GetString();
                    JsonElement lineItems = order.GetProperty("line_items");
                    foreach (var item in lineItems.EnumerateArray())
                    {
                        toolboxPurchases.Add(new ToolboxPurchases
                        {
                            purchase_datetime = DateTime.SpecifyKind(DateTime.Parse(createdAt), DateTimeKind.Utc),
                            user_email = email,
                            item_label = item.GetProperty("title").GetString(),
                            item_sku = item.GetProperty("sku").GetString(),
                            vendor_trans_id = item.GetProperty("id").ToString(),
                            price = decimal.Parse(item.GetProperty("price").GetString()),
                            last_data_collected = DateTime.UtcNow,
                            lakepulse_id = lakePulseId,
                        });
                    }
                }

                if (!toolboxPurchases.Any())
                    return;

                List<ToolboxPurchases> existingProductOrders = await _context.toolbox_purchases
                    .Where(o => o.user_email == email)
                    .ToListAsync();

                List<string?> vendorTransIds = existingProductOrders.Select(po => po.vendor_trans_id).ToList();

                List<ToolboxPurchases> ordersToInsert = toolboxPurchases
                    .Where(o => !vendorTransIds.Contains(o.vendor_trans_id))
                    .ToList();

                // Update the existing record with the latest Shopify record details.  
                foreach (var existingPurchase in existingProductOrders)
                {
                    var newPurchase = toolboxPurchases
                        .FirstOrDefault(x => x.vendor_trans_id == existingPurchase.vendor_trans_id);

                    if (newPurchase != null)
                    {
                        existingPurchase.item_sku = newPurchase.item_sku;
                        existingPurchase.item_label = newPurchase.item_label;
                        existingPurchase.purchase_datetime = newPurchase.purchase_datetime;
                        existingPurchase.price = newPurchase.price;
                        existingPurchase.last_data_collected = DateTime.UtcNow;
                    }
                }

                // If record does not exist, add toolbox purchase record.  
                if (ordersToInsert.Any())
                {
                    await _context.toolbox_purchases.AddRangeAsync(ordersToInsert);
                }
                await _context.SaveChangesAsync();
            }
            catch (HttpRequestException httpEx)
            {
                throw new Exception(StringConstant.errorHTTPRequest, httpEx);
            }
            catch (JsonException jsonEx)
            {
                throw new Exception(StringConstant.errorJSONResponse, jsonEx);
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception(StringConstant.errorUpdatingDatabase, dbEx);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Retrieves a list of Shopify orders for a specific user based on their email address.   
        /// </summary>  
        /// <param name="email">The email address of the user whose orders are to be retrieved.</param>  
        /// <returns>A list of ToolboxOrderDto objects representing the user's Shopify orders.</returns>  
        /// <exception cref="AutoMapperMappingException">Thrown when there is an error mapping the data.</exception>  
        /// <exception cref="Exception">Thrown for any unexpected errors.</exception>
        public async Task<List<ToolboxOrderDto>> GetUserShopifyOrdersAsync(string email)
        {
            try
            {
                List<ToolboxPurchases> orders = await _context.toolbox_purchases
                    .Where(o => o.user_email == email)
                    .ToListAsync();
                return _mapper.Map<List<ToolboxOrderDto>>(orders);
            }
            catch (AutoMapperMappingException ex)
            {
                throw new Exception(StringConstant.errorMappingData, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        ///<summary>  
        /// Retrieves the registered product labels for toolbox devices based on the provided SKU ID.  
        /// </summary>  
        /// <param name="skuId">The SKU ID of the toolbox device to retrieve labels for.</param>  
        /// <returns>A task that represents the asynchronous operation, containing the ToolboxDeviceTypes object if available.</returns>  
        /// <exception cref="NpgsqlException">Thrown when there is a database connection error.</exception>  
        /// <exception cref="Exception">Thrown for any unexpected errors.</exception>  
        public async Task<ToolboxDeviceTypes?> GetRegisterProductLables(string skuId)
        {
            try
            {
                using IDbConnection db = new NpgsqlConnection(_postgresConnection);
                string sql = $"SELECT * FROM toolbox_device_types where item_sku = @SkuId";
                return await db.QueryFirstOrDefaultAsync<ToolboxDeviceTypes>(sql, new { SkuId = skuId.ToString() });
            }
            catch (NpgsqlException npgsqlEx)
            {
                throw new Exception(StringConstant.errorDatabaseConnection, npgsqlEx);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Retrieves a list of measurement locations for a specified lake.  
        /// </summary>  
        /// <param name="lakeId">The unique identifier of the lake whose measurement locations are to be retrieved.</param>  
        /// <returns>A task that represents the asynchronous operation, containing a list of MeasurementLocationsDto objects.</returns>  
        public async Task<List<MeasurementLocationsDto>> GetLakeMeasurementLocationsAsync(string lakeId)
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_redshiftConnection))
                {
                    await connection.OpenAsync();
                    string lakeLocationsQuery = $"SELECT * FROM main.measurement_locations ml where ml.lakepulse_id = {lakeId}";
                    IEnumerable<dynamic> lakaLocationsResult = await connection.QueryAsync(lakeLocationsQuery);
                    List<MeasurementLocationsDto> measurementLocationsDtos = lakaLocationsResult.Select(item =>
                        new MeasurementLocationsDto
                        {
                            LakePulseId = item.lakepulse_id,
                            LocationIdentifier = item.location_identifier,
                            LocationLatitude = item.location_latitude,
                            LocationLongitude = item.location_longitude,
                            LocationName = item.location_name,
                            LocationState = item.location_state,
                        }).ToList();
                    return measurementLocationsDtos;
                }
            }
            catch (NpgsqlException npgsqlEx)
            {
                throw new Exception(StringConstant.errorDatabaseConnection, npgsqlEx);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Adds a new measurement location for a specified lake.  
        /// Checks if the location already exists for the given lake and inserts it if it does not.  
        /// </summary>  
        /// <param name="measurementLocation">The measurement location details to be added.</param>  
        /// <exception cref="Exception">Thrown when the location already exists or there is a database connection error.</exception>  
        public async Task AddLakeMeasurementLocationsAsync(MeasurementLocationsDto measurementLocation)
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_redshiftConnection))
                {
                    await connection.OpenAsync();
                    string lakeLocationsQuery = $"SELECT count(*) as count FROM main.measurement_locations ml where ml.lakepulse_id = @LakeId and ml.location_name = @LocationName";
                    var parameters = new
                    {
                        LakeId = measurementLocation.LakePulseId,
                        LocationName = measurementLocation.LocationName
                    };
                    IEnumerable<dynamic> lakaLocationsResult = await connection.QueryAsync(lakeLocationsQuery, parameters);
                    int count = (int)(lakaLocationsResult.Select(x => x.count).FirstOrDefault());
                    if (count > 0)
                    {
                        throw new Exception(StringConstant.locationExist);
                    }

                    string insertQuery = @"INSERT INTO main.measurement_locations (lakepulse_id, location_identifier, location_latitude, location_longitude, location_name, location_state) VALUES (@LakePulseId, @LocationIdentifier, @LocationLatitude, @LocationLongitude, @LocationName, @LocationState )";
                    await connection.ExecuteAsync(insertQuery, measurementLocation);
                }
            }
            catch (NpgsqlException npgsqlEx)
            {
                throw new Exception(StringConstant.errorDatabaseConnection, npgsqlEx);
            }
        }

        /// <summary>  
        /// Registers a toolbox product for a user.  
        /// Updates the product's status to "Registered" and sets the registration details.  
        /// </summary>  
        /// <param name="toolboxProductRequestDto">The details of the toolbox product to be registered.</param>  
        /// <exception cref="Exception">Thrown when the product is not found in the database.</exception>  
        /// <exception cref="NpgsqlException">Thrown when there is a database connection error.</exception>  
        public async Task RegisterToolboxProductAsync(RegisterToolboxProductRequestDto toolboxProductRequestDto)
        {
            try
            {
                ToolboxPurchases? toolboxPurchase = await _context.toolbox_purchases
                    .FirstOrDefaultAsync(o => (o.vendor_trans_id == toolboxProductRequestDto.orderId) && (o.user_email == toolboxProductRequestDto.userEmail));
                if (toolboxPurchase == null)
                {
                    throw new Exception(StringConstant.productNotFound);
                }
                toolboxPurchase.status = "Registered";
                toolboxPurchase.registration_datetime = DateTime.UtcNow;
                toolboxPurchase.location_id = toolboxProductRequestDto.locationIdentifier;
                toolboxPurchase.lakepulse_id = toolboxProductRequestDto.lakePulseId;
                toolboxPurchase.vendor_device_id = toolboxProductRequestDto.kId;
                await _context.SaveChangesAsync();
            }
            catch (NpgsqlException npgsqlEx)
            {
                throw new Exception(StringConstant.errorDatabaseConnection, npgsqlEx);
            }
        }

        /// <summary>  
        /// Deregisters a toolbox product for a user.  
        /// Updates the product's status to "Inactive" if it is currently registered.  
        /// </summary>  
        /// <param name="orderId">The unique identifier of the order associated with the toolbox product to be deregistered.</param>  
        /// <param name="userEmail">The email address of the user associated with the toolbox product to be deregistered.</param>  
        /// <exception cref="Exception">Thrown when the product is not found or is not registered.</exception>  
        /// <exception cref="NpgsqlException">Thrown when there is a database connection error.</exception>  
        public async Task DeregisterToolboxProductAsync(string orderId, string userEmail)
        {
            try
            {
                ToolboxPurchases? toolboxPurchase = await _context.toolbox_purchases
                    .FirstOrDefaultAsync(o => (o.vendor_trans_id == orderId) && (o.user_email == userEmail));
                if (toolboxPurchase == null)
                {
                    throw new Exception(StringConstant.productNotFound);
                }
                if (toolboxPurchase.status != "Registered")
                {
                    throw new Exception(StringConstant.productNotRegistered);
                }
                toolboxPurchase.status = "Inactive";
                await _context.SaveChangesAsync();
            }
            catch (NpgsqlException npgsqlEx)
            {
                throw new Exception(StringConstant.errorDatabaseConnection, npgsqlEx);
            }
        }

        /// <summary>  
        /// Retrieves the most recent purchases for a specified lake.  
        /// Fetches up to 5 recent purchases associated with the given lakePulseId,  
        /// maps them to ToolboxRecentPurchasesDto, and enriches the data with user names.  
        /// </summary>  
        /// <param name="lakePulseId">The unique identifier of the lake for which recent purchases are to be retrieved.</param>  
        /// <returns>A task that represents the asynchronous operation, containing a list of ToolboxRecentPurchasesDto objects.</returns>  
        /// <exception cref="NpgsqlException">Thrown when there is a database connection error.</exception>  
        public async Task<List<ToolboxRecentPurchasesDto>> GetRecentPurchasesAsync(int lakePulseId)
        {
            try
            {
                List<ToolboxPurchases> orders = await _context.toolbox_purchases
                         .Where(o => o.lakepulse_id == lakePulseId && o.user_email!=null)
                         .OrderByDescending(o => o.purchase_datetime)
                         .Take(5)
                         .ToListAsync();
                List<ToolboxRecentPurchasesDto> recentOrder = _mapper.Map<List<ToolboxRecentPurchasesDto>>(orders);

                if (recentOrder != null && recentOrder.Any())
                {
                    foreach (ToolboxRecentPurchasesDto x in recentOrder)
                    {
                        x.UserName = await _commonService.GetUserNameByEmailAsync(x.UserEmail);
                    }
                }

                return recentOrder;
            }
            catch (NpgsqlException npgsqlEx)
            {
                throw new Exception(StringConstant.errorDatabaseConnection, npgsqlEx);
            }
        }
    }
}
