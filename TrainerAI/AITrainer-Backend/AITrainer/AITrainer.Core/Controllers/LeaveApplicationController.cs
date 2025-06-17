
using AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks;
using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.Services.LeaveApplications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LeaveApplicationController : ControllerBase
    {
        private readonly ILeaveApplicationService _leaveApplicationServices;
        public LeaveApplicationController(ILeaveApplicationService leaveApplicationServices)
        {
            _leaveApplicationServices = leaveApplicationServices;
        }


        /// <summary>
        /// Applies for leave.
        /// </summary>
        /// <param name="request">Data containing leave application details.</param>
        /// <returns> Returns Ok with the result of the leave application. </returns>
        [HttpPost("applyLeave")]
        public async Task<IActionResult> ApplyLeave([FromForm] LeaveApplicationDto request)
        {
            LeaveApplication result = await _leaveApplicationServices.ApplyLeave(request);
            return Ok();
        }


        /// <summary>
        /// Views leave records of interns with pagination and filtering options.
        /// </summary>
        /// <param name="currentPage">The current page number of the paginated list.</param>
        /// <param name="defaultList">The default number of items per page.</param>
        /// <param name="filter">Optional. Filter criteria for leave records.</param>
        /// <returns>
        /// Returns Ok with the paginated list of interns' leave records if successful.
        /// Returns BadRequest if no leave records are found.
        /// </returns>
        [HttpGet("viewLeave-intern")]
        public async Task<ActionResult> ViewInternsLeave(int currentPage, int defualtList, string? filter)
        {
            try
            {
                List<ApplicationUser> approvedBy;
                List<LeaveApplicationsDto> attendance = await _leaveApplicationServices.GetInternsLeave(filter);


                int count = attendance.Count();

                int pageNumber = (int)Math.Ceiling((double)count / defualtList);

                int lastIndex = defualtList * currentPage;

                int firstIndex = lastIndex - defualtList;
                if (attendance == null)
                {
                    return BadRequest("No leave records found");
                }
                ListAttendance result = new ListAttendance
                {
                    LeaveApplication = attendance.Skip(firstIndex).Take(lastIndex - firstIndex).ToList(),
                    TotalPages = pageNumber,
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }


        /// <summary>
        /// Retrieves interns' leave history for administrators with pagination and filtering options.
        /// </summary>
        /// <param name="currentPage">The current page number of the paginated list.</param>
        /// <param name="defaultList">The default number of items per page.</param>
        /// <param name="filter">Optional. Filter criteria for leave records.</param>
        /// <returns>
        /// Returns Ok with the paginated list of interns' leave history if successful.
        /// Returns BadRequest if no leave records are found.
        /// </returns>
        [HttpGet("viewInternLeave-admin")]
        public async Task<ActionResult> GetInternsLeaveHistory(int currentPage, int defualtList, string? filterword, string? filtername, int? filterduration)
        {
            var attendance = await _leaveApplicationServices.GetInternsLeaveHistory(filterword, filtername, filterduration);

            var count = attendance.Count();
            var pageNumber = (int)Math.Ceiling((double)count / defualtList);
            var lastIndex = defualtList * currentPage;
            var firstIndex = lastIndex - defualtList;
            
            if (attendance == null)
            {
                return BadRequest("No leave records found");
            }

            var result = new ListAdminAttendanceView
            {
                LeaveApplication = attendance.Skip(firstIndex).Take(lastIndex - firstIndex).ToList(),
                TotalPages = pageNumber,
            };

            return Ok(result);
        }


        /// <summary>
        /// Responds to a leave application by approving or rejecting it.
        /// </summary>
        /// <param name="response">Data containing the response to the leave application.</param>
        /// <returns> Returns the leave application with the response. </returns>
        [HttpPut("approveLeave")]
        public async Task<LeaveApplication> RespondToLeaveApplication(LeaveResponseDto response)
        {
            LeaveApplication result = await _leaveApplicationServices.GiveResponse(response);
            return result;
        }


        /// <summary>
        /// Deletes a leave application.
        /// </summary>
        /// <param name="id">The ID of the leave application to be deleted.</param>
        /// <returns> Returns Ok with the result of the deletion if successful. </returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLeave(string id)
        {
            var result = await _leaveApplicationServices.DeleteLeave(id);
            return Ok(result);
        }


        /// <summary>
        /// Retrieves leave dates.
        /// </summary>
        /// <returns> Returns Ok with the leave dates if successful. </returns>
        [HttpGet("LeaveDates")]
        public async Task<ActionResult> GetLeaveDates()
        {
            var result = await _leaveApplicationServices.GetLeaveDates();
            return Ok(result);
        }
        /// <summary>
        /// Retrieves interns' leave history for administrators
        /// </summary>
        /// <returns>
        /// Returns Ok with thelist of interns' leave history if successful.
        /// Returns BadRequest if no leave records are found.
        /// </returns>
        [HttpGet("viewAllInternLeave-admin")]
        public async Task<ActionResult> GetAllInternsLeaveHistory()
        {
            List< AdminLeaveView> result = await _leaveApplicationServices.GetAllInternsLeaveHistory();
            if (result == null)
            {
                return BadRequest("No leave records found");
            }
            ListAdminAttendanceView results = new ListAdminAttendanceView
            {
                LeaveApplication = result.ToList()
            };
            return Ok(results);
        }
    }
}

