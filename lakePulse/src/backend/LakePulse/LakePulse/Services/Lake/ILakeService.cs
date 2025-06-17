using LakePulse.DTOs;

namespace LakePulse.Services.Lake
{
    public interface ILakeService
    {

        /// <summary>
        /// Searches for lakes by name and state.
        /// </summary>
        /// <param name="searchLakeRequestDto">The search request containing the name and state of the lake.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the search results.</returns>
        Task<SearchLakeResponseDto> SearchLakeByNameAndStateAsync(SearchLakeRequestDto searchLakeRequestDto);

        /// <summary>  
        /// Retrieves the latitude and longitude details of all lakes.  
        /// If the data is not available in the cache, it fetches the data from the database, caches it, and returns the result.  
        /// </summary>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the latitude and longitude details of all lakes.</returns> 
        Task<LakeLatLongDetailsDto> GetAllLakeLatLongAsync();

        /// <summary>  
        /// Retrieves lake details by their IDs with optional filtering and sorting.  
        /// </summary>  
        /// <param name="lakeIds">The list of lake IDs.</param>  
        /// <param name="filter">The filter to apply to the query.</param>  
        /// <param name="sort">The sort order to apply to the query.</param>  
        /// <param name="pageNumber">The page number for pagination.</param>  
        /// <param name="pageSize">The number of items per page.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the list of lake details.</returns>

        Task<List<SearchLakeDto>> GetLakeDetailsByIdsAsync(List<int> lakeIds, string? filter, string? sort, int pageNumber, int pageSize);

        /// <summary>
        /// Gets all states.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains the list of states.</returns>
        Task<List<KeyValuePair<string, string>>> GetAllStatesAsync();

        /// <summary>
        /// Gets all details of a lake by its ID.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the lake details.</returns>
        Task<LakeDetailsDto> GetLakeAllDetailsByIdAsync(int lakeId);

        /// <summary>
        /// Gets the measurement results of a lake with pagination, filtering, and sorting.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="filters">The filters to apply to the query.</param>
        /// <param name="sortColumns">The columns to sort by and their sort directions.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the measurement results.</returns>
        Task<LakeMeasurementResultDto> GetLakeMeasurementResultsAsync(int lakeId, int pageNumber, int pageSize, List<KeyValueDto<string>>? filters, List<KeyValueDto<string>>? sortColumns);
    }
}
