using LakePulse.Data;
using LakePulse.DTOs.DataPartner;
using LakePulse.Services.DataPartner;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace LakePulse.Controllers
{
    #region Controller Definition
    [Authorize(Roles = "Super Admin, Admin, User")]
    [Route("api/data-partner")]
    [ApiController]
    public class DataPartnerController : ControllerBase
    {
        private readonly IDataPartnerService _dataPartnerService;
        private readonly ILogger<DataPartnerController> _logger;

        public DataPartnerController(IDataPartnerService dataPartnerService, ILogger<DataPartnerController> logger)
        {
            _dataPartnerService = dataPartnerService;
            _logger = logger;
        }

        #region Public Methods
        /// <summary>
        /// Creates a new data partner record.
        /// </summary>
        /// <param name="requestDto">The data partner details to create.</param>
        /// <returns>An IActionResult containing the created data partner.</returns>
        /// <response code="200">Returns the created data partner.</response>
        /// <response code="400">If the request is invalid or a duplicate data partner exists.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="500">If there was an internal server error.</response>
        [HttpPost]
        public async Task<IActionResult> CreateDataPartnerAsync([FromBody] CreateDataPartnerRequestDto requestDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _dataPartnerService.CreateDataPartnerAsync(requestDto, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorCreatingDataPartner);
                return StatusCode(500, new { message = StringConstant.errorCreatingDataPartner });
            }
        }

        /// <summary>
        /// Gets all data partners for a specific LakePulse ID with pagination.
        /// </summary>
        /// <param name="lakePulseId">The LakePulse ID to filter by.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>An IActionResult containing the paginated list of data partners.</returns>
        /// <response code="200">Returns the paginated list of data partners.</response>
        /// <response code="400">If the pagination parameters are invalid.</response>
        /// <response code="500">If there was an internal server error.</response>
        [HttpGet("by-lake/{lakePulseId}")]
        public async Task<IActionResult> GetDataPartnersByLakePulseIdAsync(
            [Required] int lakePulseId,
            [Required] int pageNumber = 1,
            [Required] int pageSize = 10)
        {
            try
            {
                if (pageNumber < 1)
                {
                    return BadRequest(new { message = StringConstant.invalidPageNumber });
                }

                if (pageSize < 1)
                {
                    return BadRequest(new { message = StringConstant.invalidPageSize });
                }

                var result = await _dataPartnerService.GetDataPartnersByLakePulseIdAsync(lakePulseId, pageNumber, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorRetrievingDataPartners);
                return StatusCode(500, new { message = StringConstant.errorRetrievingDataPartners });
            }
        }

        /// <summary>
        /// Deletes a data partner record by its ID.
        /// </summary>
        /// <param name="id">The ID of the data partner to delete.</param>
        /// <returns>An IActionResult indicating the result of the operation.</returns>
        /// <response code="200">If the data partner was successfully deleted.</response>
        /// <response code="404">If the data partner was not found.</response>
        /// <response code="500">If there was an internal server error.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDataPartnerAsync([Required] Guid id)
        {
            try
            {
                var result = await _dataPartnerService.DeleteDataPartnerAsync(id);
                if (result == StringConstant.dataPartnerNotFound)
                {
                    return NotFound(new { message = result });
                }
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorDeletingDataPartner);
                return StatusCode(500, new { message = StringConstant.errorDeletingDataPartner });
            }
        }

        /// <summary>
        /// Updates an existing data partner record.
        /// </summary>
        /// <param name="requestDto">The updated data partner details.</param>
        /// <returns>An IActionResult containing the updated data partner.</returns>
        /// <response code="200">Returns the updated data partner.</response>
        /// <response code="400">If the request is invalid or a duplicate data partner exists.</response>
        /// <response code="401">If the user is not authenticated.</response>
        /// <response code="500">If there was an internal server error.</response>
        [HttpPut]
        public async Task<IActionResult> UpdateDataPartnerAsync([FromBody] UpdateDataPartnerRequestDto requestDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var result = await _dataPartnerService.UpdateDataPartnerAsync(requestDto, userId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorUpdatingDataPartner);
                return StatusCode(500, new { message = StringConstant.errorUpdatingDataPartner });
            }
        }
        #endregion
    }
    #endregion
} 