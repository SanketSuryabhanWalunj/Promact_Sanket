
using LakePulse.DTOs;
using LakePulse.Models;

namespace LakePulse.Services.Toolbox
{
    public interface IToolboxService
    {

        ///<summary>  
        /// Synchronizes the user's Shopify orders with the specified LakePulse ID.  
        /// </summary>  
        /// <param name="email">The email address of the user whose Shopify orders are to be synchronized.</param>  
        /// <param name="lakePulseId">The unique identifier of the LakePulse entity to associate the orders with.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        Task SyncUserShopifyOrdersAsync(string email, int lakePulseId);

        /// <summary>  
        /// Retrieves a list of Shopify orders associated with the specified user's email address.  
        /// </summary>  
        /// <param name="email">The email address of the user whose Shopify orders are to be retrieved.</param>  
        /// <returns>A task that represents the asynchronous operation, containing a list of ToolboxOrderDto objects.</returns>  
        Task<List<ToolboxOrderDto>> GetUserShopifyOrdersAsync(string email);


        ///<summary>  
        /// Retrieves the registered product labels for a given SKU ID.  
        /// </summary>  
        /// <param name="skuId">The SKU ID of the product whose labels are to be retrieved.</param>  
        /// <returns>A task that represents the asynchronous operation, containing a ToolboxDeviceTypes object if found, otherwise null.</returns>  
        Task<ToolboxDeviceTypes?> GetRegisterProductLables(string skuId);

        /// <summary>  
        /// Retrieves a list of measurement locations for a specified lake.  
        /// </summary>  
        /// <param name="lakeId">The unique identifier of the lake whose measurement locations are to be retrieved.</param>  
        /// <returns>A task that represents the asynchronous operation, containing a list of MeasurementLocationsDto objects.</returns>
        Task<List<MeasurementLocationsDto>> GetLakeMeasurementLocationsAsync(string lakeId);

        /// <summary>  
        /// Adds a new measurement location for a specified lake.  
        /// </summary>  
        /// <param name="measurementLocation">The details of the measurement location to be added.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        Task AddLakeMeasurementLocationsAsync(MeasurementLocationsDto measurementLocation);

        /// <summary>  
        /// Registers a toolbox product using the provided request details.  
        /// </summary>  
        /// <param name="toolboxProductRequestDto">The details of the toolbox product to be registered.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        Task RegisterToolboxProductAsync(RegisterToolboxProductRequestDto toolboxProductRequestDto);

        /// <summary>  
        /// Deregisters a toolbox product using the provided order ID and user email.  
        /// </summary>  
        /// <param name="orderId">The unique identifier of the order associated with the toolbox product to be deregistered.</param>  
        /// <param name="userEmail">The email address of the user associated with the toolbox product to be deregistered.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        Task DeregisterToolboxProductAsync(string orderId, string userEmail);

        /// <summary>  
        /// Retrieves a list of recent purchases for a specified LakePulse ID.  
        /// </summary>  
        /// <param name="lakePulseId">The unique identifier of the LakePulse entity whose recent purchases are to be retrieved.</param>
        /// <returns>A task that represents the asynchronous operation, containing a list of ToolboxRecentPurchasesDto objects.</returns>  
        Task<List<ToolboxRecentPurchasesDto>> GetRecentPurchasesAsync(int lakePulseId);
    }
}
