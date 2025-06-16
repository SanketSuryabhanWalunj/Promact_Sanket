using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Toolbox;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LakePulse.Controllers
{
    [Authorize(Roles = "Super Admin,Admin, User")]
    [Route("api/toolbox")]
    [ApiController]
    public class ToolboxController : ControllerBase
    {
        private readonly IToolboxService _toolboxService;
        public ToolboxController(IToolboxService toolboxService)
        {
            _toolboxService = toolboxService;
        }


        /// <summary>
        /// Synchronizes the user's Shopify orders with the specified LakePulse ID.  
        /// </summary>  
        /// <param name="email">The email address of the user whose Shopify orders are to be synchronized.</param>  
        /// <param name="lakePulseId">The unique identifier of the LakePulse entity to associate the orders with.</param>  
        /// <returns>An ActionResult indicating the result of the operation.</returns>  
        [HttpPost("sync-user-orders")]
        public async Task<ActionResult> SyncUserShopifyOrdersAsync(string email, int lakePulseId)
        {
            await _toolboxService.SyncUserShopifyOrdersAsync(email, lakePulseId);
            return Ok();
        }

        /// <summary>  
        /// Retrieves a list of Shopify orders associated with the specified user's email address.  
        /// </summary>  
        /// <param name="email">The email address of the user whose Shopify orders are to be retrieved.</param>  
        /// <returns>An ActionResult containing a list of ToolboxOrderDto objects representing the user's Shopify orders.</returns>
        [HttpGet("user-orders")]
        public async Task<ActionResult> GetUserShopifyOrdersAsync(string email)
        {
            List<ToolboxOrderDto> orders = await _toolboxService.GetUserShopifyOrdersAsync(email);
            return Ok(orders);
        }

        ///<summary>  
        /// Retrieves the registered product labels for a given SKU ID.  
        /// </summary>  
        /// <param name="skuId">The SKU ID of the product whose labels are to be retrieved.</param>  
        /// <returns>An ActionResult containing a ToolboxDeviceTypes object representing the product labels, or null if not found.</returns>  
        [HttpGet("labels")]
        public async Task<ActionResult> GetRegisterProductLablesAsync(string skuId)
        {
            ToolboxDeviceTypes? labels = await _toolboxService.GetRegisterProductLables(skuId);
            return Ok(labels);
        }

        /// <summary>  
        /// Retrieves a list of measurement locations for a specified lake.  
        /// </summary>  
        /// <param name="lakeId">The unique identifier of the lake whose measurement locations are to be retrieved.</param>  
        /// <returns>An ActionResult containing a list of MeasurementLocationsDto objects representing the lake's measurement locations.</returns>  
        [HttpGet("lake-measurement_locations")]
        public async Task<ActionResult> GetLakeMeasurementLocationsAsync(string lakeId)
        {
            List<MeasurementLocationsDto> lakeLocations = await _toolboxService.GetLakeMeasurementLocationsAsync(lakeId);
            return Ok(lakeLocations);
        }

        /// <summary>  
        /// Adds a new measurement location for a specified lake.  
        /// </summary>  
        /// <param name="measurementLocation">The details of the measurement location to be added.</param>  
        /// <returns>An ActionResult indicating the result of the operation.</returns>  
        [HttpPost("lake-measurement_location")]
        public async Task<ActionResult> AddLakeMeasurementLocationsAsync([FromBody] MeasurementLocationsDto measurementLocation)
        {
            await _toolboxService.AddLakeMeasurementLocationsAsync(measurementLocation);
            return Ok();
        }

        /// <summary>  
        /// Registers a toolbox product using the provided request details.  
        /// </summary>  
        /// <param name="toolboxProductRequestDto">The details of the toolbox product to be registered.</param>  
        /// <returns>An ActionResult indicating the result of the operation.</returns>  
        [HttpPost("register")]
        public async Task<ActionResult> RegisterProductAsync([FromBody] RegisterToolboxProductRequestDto toolboxProductRequestDto)
        {
            await _toolboxService.RegisterToolboxProductAsync(toolboxProductRequestDto);
            return Ok();
        }

        /// <summary>  
        /// Deregisters a toolbox product using the provided order ID and user email.  
        /// </summary>  
        /// <param name="orderId">The unique identifier of the order associated with the toolbox product to be deregistered.</param>  
        /// <param name="userEmail">The email address of the user associated with the toolbox product to be deregistered.</param>  
        /// <returns>An ActionResult indicating the result of the operation.</returns>  
        [HttpPut("deregister")]
        public async Task<ActionResult> DeregisterProductAsync(string orderId, string userEmail)
        {
            await _toolboxService.DeregisterToolboxProductAsync(orderId, userEmail);
            return Ok();
        }

        /// <summary>  
        /// Retrieves a list of recent purchases for a specified LakePulse ID.  
        /// </summary>  
        /// <param name="lakePulseId">The unique identifier of the LakePulse entity whose recent purchases are to be retrieved.</param 
        /// <returns>An ActionResult containing a list of ToolboxRecentPurchasesDto objects representing the recent purchases.</returns>  
        [HttpGet("recent-purchases")]
        public async Task<ActionResult> GetRecentPurchasesAsync(int lakePulseId)
        {
            List<ToolboxRecentPurchasesDto> purchases = await _toolboxService.GetRecentPurchasesAsync(lakePulseId);
            return Ok(purchases);
        }
    }
}
