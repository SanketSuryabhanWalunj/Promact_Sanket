using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.Services.PunchRecords;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PunchRecordsController : ControllerBase
    {
        private readonly IPunchRecordService _punchRecordsService;

        public PunchRecordsController(IPunchRecordService punchRecordsService)
        {
            _punchRecordsService = punchRecordsService;
        }
        /// <summary>
        /// Creates a new punchIn and punchOut time and Punchrecord log.
        /// </summary>
        /// <param name="punchRecordsDto">The PunchRecord and punchlogtime details to be added.</param>
        /// <returns>Returns an IActionResult with the result of the punchrecord and punchlogtime creation process.</returns>
        [HttpPost("punchIn")]
        public async Task<IActionResult> PunchIn(PunchRecordsDto punchRecordsDto)
        {
            if (punchRecordsDto == null)
            {
                return BadRequest("Punch record data cannot be null.");
            }

            try
            {
                await _punchRecordsService.AddPunchIn(punchRecordsDto);
                return Ok(punchRecordsDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Checks punchInTime and punchOutTime in punchRecord Table
        /// </summary>
        /// <param name="getPunchRecordsDto">To get PunchRecord and punchlogtime details.</param>
        /// <returns>Returns an IActionResult with the result of the punchrecord and punchlogtime date and time.</returns>
        [HttpPost("getIsPunch")]
        public async Task<IActionResult> GetCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto)
        {
            GetPunchResponseDto getPunchResponseDto = new GetPunchResponseDto();

            if (getPunchRecordsDto == null)
            {
                return BadRequest("Punch record request data cannot be null.");
            }

            try
            {
                if (getPunchRecordsDto != null)
                {
                    getPunchResponseDto = await _punchRecordsService.GetCheckPunchtime(getPunchRecordsDto);
                }
                return Ok(getPunchResponseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Checks the details of missed punchIn and PunchOut time
        /// </summary>
        /// <param name="requestPunch">To get PunchRecord and punchlogtime details.</param>
        /// <returns>Returns an IActionResult with the result of the punchrecord.</returns>
        [HttpPost("getAllPunchDetails")]
        public async Task<IActionResult> GetAllPunchDetails(RequestPunchWeeklyDto requestPunchWeeklyDto)
        {
            if (requestPunchWeeklyDto == null)
            {
                return BadRequest("Request data cannot be null.");
            }

            try
            {
                GetListPunchRecordsDto getListPunchRecordsDto = await _punchRecordsService.GetAllPunchDetails(requestPunchWeeklyDto.StartDate, requestPunchWeeklyDto.EndDate);
                return Ok(getListPunchRecordsDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Insert the details of missed punchIn and PunchOut time
        /// </summary>
        /// <param name="requestPunchDto">To insert the missed punchIn and punchOut details when requested.</param>
        [HttpPost("requestPunch")]
        public async Task<IActionResult> RequestPunch(RequestPunchDto requestPunchDto)
        {
            if (requestPunchDto == null)
            {
                return BadRequest("Request data cannot be null.");
            }

            try
            {
                PunchRecord punchRecord = await _punchRecordsService.IsRequestPunchOut(requestPunchDto);

                if (punchRecord == null)
                {
                    return NotFound("No matching punch record found.");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Gets all intern request details.
        /// </summary>
        /// <returns>Returns an IActionResult with the result of the AllRequestsForPunchInAndOut.</returns>
        [HttpGet("requestPunchdetails")]
        public async Task<IActionResult> RequestPunchDetails()
        {
            try
            {
                List<PunchRecordRequestsDto> allRequestsForPunchInAndOut = await _punchRecordsService.GetInternsRequest();
                return Ok(allRequestsForPunchInAndOut);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Gets all intern request details for admin.
        /// </summary>
        /// <returns>Returns an IActionResult with the result of the GetAllInternRequestHistoryForAdmin.</returns>
        [HttpGet("requestPunchdetailsForAdmin")]
        public async Task<IActionResult> RequestPunchDetailsForAdmin()
        {

            try
            {
                List<AdminInternPunchRecordRequestDetailsDto> getAllInternRequestsForAdmin = await _punchRecordsService.GetAllInternRequestHistoryForAdmins();
                return Ok(getAllInternRequestsForAdmin);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Admin can approve or reject intern request punch.
        /// </summary>
        /// <param name="requestedApprovedOrNot">To insert admin status and comments</param>
        [HttpPost("punchRequestApprovedOrRejected")]
        public async Task<IActionResult> PunchRequestApprovedOrRejected(AdminInternApprovalRequestDto adminInternApprovalRequestDto)
        {
            if (adminInternApprovalRequestDto == null)
            {
                return BadRequest("Request data cannot be null.");
            }

            try
            {
                PunchRecord punch = await _punchRecordsService.PunchRequestApprovedOrRejected(adminInternApprovalRequestDto);

                if (punch == null)
                {
                    return NotFound("No matching punch record found or operation failed.");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Deletes a request application.
        /// </summary>
        /// <param name="id">The ID of the request application to be deleted.</param>
        /// <returns> Returns Ok with the result of the deletion if successful. </returns>
        [HttpPost("deleteRequest")]
        public async Task<ActionResult> DeleteRequest(DeleteRequestDto deleteRequest)
        {
            if (deleteRequest == null)
            {
                return BadRequest("Request data cannot be null.");
            }

            try
            {
                bool result = await _punchRecordsService.DeleteRequest(deleteRequest);

                if (result == null)
                {
                    return NotFound("The request could not be processed, or the item was not found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");

            }
        }
        /// <summary>
        /// Retrieves interns' request history for administrators with pagination and filtering options.
        /// </summary>
        /// <param name="filterword">The filter word to filter.</param>
        /// <param name="filterduration">The date value</param>
        /// <param name="filterstatus">filter on filter status.</param>
        /// <returns>
        /// Returns Ok with the paginated list of interns' leave history if successful.
        /// Returns BadRequest if no request records are found.
        /// </returns>
        [HttpGet("viewInternRequest-admin")]
        public async Task<ActionResult> GetInternsRequestHistory(string? filterword, DateTime? filterduration, string? filterstatus)
        {
            try
            {
                List<AdminInternRequestDetailsDto> attendance = await _punchRecordsService.GetAllInternRequestHistoryForAdminsUsingFilter(filterword, filterduration, filterstatus);

                if (attendance == null || !attendance.Any())
                {
                    return NotFound("No leave records found.");
                }

                ListAdminAttendanceRequestViewDto result = new ListAdminAttendanceRequestViewDto
                {
                    RequestApplication = attendance.ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Retrieves interns' request history for administrators
        /// </summary>
        /// <returns>
        /// Returns Ok with thelist of interns' request history if successful.
        /// Returns BadRequest if no leave records are found.
        /// </returns>
        [HttpGet("viewAllInternRequest-admin")]
        public async Task<ActionResult> GetAllInternsRequestHistory()
        {
            try
            {
                List<AdminInternPunchRecordRequestDetailsDto> result = await _punchRecordsService.GetAllInternRequestHistoryForAdmins();

                if (result == null || !result.Any())
                {
                    return NotFound("No request records found.");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
