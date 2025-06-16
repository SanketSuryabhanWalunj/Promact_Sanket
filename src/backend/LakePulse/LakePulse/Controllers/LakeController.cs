using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Services.Lake;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
   // [Authorize]
    [Route("api/lake")]
    [ApiController]
    public class LakeController : ControllerBase
    {
        private readonly ILakeService _lakeService;

        public LakeController(ILakeService lakeService)
        {
            _lakeService = lakeService;
        }


        ///<summary>
        /// Searches for lakes by name and state with pagination.
        /// </summary>
        /// <param name="searchLakeRequestDto">The DTO containing the search parameters.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the search results.</returns>
        [HttpGet("search-state")]
        public async Task<SearchLakeResponseDto> GetLakeByNameAndStateAsync([FromQuery] SearchLakeRequestDto searchLakeRequestDto)
        {
            SearchLakeResponseDto lakeDetails = await _lakeService.SearchLakeByNameAndStateAsync(searchLakeRequestDto);
            return lakeDetails;
        }

        /// <summary>  
        /// Retrieves the latitude and longitude details of all lakes.  
        /// If the data is not available in the cache, it fetches the data from the database, caches it, and returns the result.  
        /// </summary>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the latitude and longitude details of all lakes.</returns> 
        [HttpGet("all-lakes-lat-long")]
        public async Task<ActionResult> GetAllLakesLatLongsAsync()
        {
            LakeLatLongDetailsDto lakeDetails = await _lakeService.GetAllLakeLatLongAsync();
            return Ok(lakeDetails);
        }

        /// <summary>
        /// Method is to get the state name from state table.
        /// </summary>
        /// <returns>Task list of key value pair of lake name and its shortcut.</returns>
        [HttpGet("states-list")]
        public async Task<ActionResult> GetStatesListAsync()
        {
            List<KeyValuePair<string, string>> stateList = await _lakeService.GetAllStatesAsync();
            return Ok(stateList);
        }

        /// <summary>
        /// Method is to get all details of a lake by its ID.
        /// </summary>
        /// <param name="lakeId">ID of the lake.</param>
        /// <returns>Lake details in LakeDetailsDto.</returns>      
        [HttpGet("lake-all-details-by-id")]
        public async Task<ActionResult> GetLakeAllDetailsById(int lakeId)
        {
            LakeDetailsDto lakeDetails = await _lakeService.GetLakeAllDetailsByIdAsync(lakeId);
            return Ok(lakeDetails);
        }

        /// <summary>  
        /// Retrieves lake details by their IDs with optional filtering, sorting, and pagination.  
        /// </summary>  
        /// <param name="lakeIds">The list of lake IDs.</param>  
        /// <param name="filter">The filter to apply to the query.</param>  
        /// <param name="sort">The sort order to apply to the query.</param>  
        /// <param name="pageNumber">The page number for pagination.</param>  
        /// <param name="pageSize">The number of items per page.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the list of lake details.</returns>

        [HttpPost("lake-details-by-ids")]
        public async Task<ActionResult> GetLakeDetailsByIdsAsync([FromBody][Required] List<int> lakeIds, string? filter, string? sort, int pageNumber, int pageSize)
        {
            if (lakeIds.Count == 0)
            {
                return BadRequest(StringConstant.lakesRequired);
            }
            List<SearchLakeDto> lakeDetails = await _lakeService.GetLakeDetailsByIdsAsync(lakeIds, filter, sort, pageNumber, pageSize);
            return Ok(lakeDetails);
        }

        /// <summary>
        /// Method is to get the measurement results of a lake with pagination, filtering, and sorting.
        /// </summary>
        /// <param name="measurementResultsDto">The DTO containing lake ID, pagination, filters, and sorting information.</param>
        /// <returns>Lake measurement results in LakeMeasurementResultDto.</returns>
        [HttpPost("lake-measurement-results")]
        public async Task<ActionResult> GetLakeMeasurementResultsAsync(MeasurementResultsDto measurementResultsDto)
        {
            LakeMeasurementResultDto measurementResults = await _lakeService.GetLakeMeasurementResultsAsync(measurementResultsDto.lakeId, measurementResultsDto.pageNumber, measurementResultsDto.pageSize, measurementResultsDto.filters, measurementResultsDto.sortColumns);
            return Ok(measurementResults);
        }


    }
}
