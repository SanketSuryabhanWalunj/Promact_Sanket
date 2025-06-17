using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.BugsAndFeedback;
using AITrainer.Services.BugsAndFeedback;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BugsFeedbackController:ControllerBase
    {
        private readonly IBugsFeedbacksService _service;
        private readonly IBugsFeedbacksRepository _repository;
       
        public BugsFeedbackController(IBugsFeedbacksService service,IBugsFeedbacksRepository repository)
        {
            _service = service;
           _repository = repository;
        }

        /// <summary>
        /// API for creating interns bugs or feedbacks.
        /// </summary>
        /// <param name="model">Input model containing data for creating the bugs feedback.</param>
        /// <returns>Returns IActionResult indicating the result of the operation.</returns>
        [HttpPost("Create")]
        public async Task<IActionResult> CreateInternsBugsFeedbacks([FromForm] BugsFeedbackInputModel model)
        {
            try
            {
              
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                BugsFeedback bugsFeedback = await _service.CreateInternBugsAsync(model);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while processing your request: {ex.Message}");
            }

        }

        /// <summary>
        /// API for fetching all the mentors of the current intern
        /// </summary>
        /// <returns>Returns IActionResult containing the list of mentors for interns.</returns>
        [HttpGet("InternMentors")]
        public async Task<IActionResult> GetMentorListOfIntern()
        {
            try
            {

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }


                return Ok(await _service.GetInternsMentorDetailsAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while processing your request: {ex.Message}");
            }
        }


        /// <summary>
        /// API for retrieving all bug reports submitted by interns.
        /// </summary>
        /// <returns>Returns IActionResult containing the list of bug reports with images.</returns>
        [HttpGet("getInternBugs")]
        public async Task<IActionResult> GetAllReportsIntern()
        {
            try
            {
                List<FeedbackWithImagesDTO> reports = await _service.GetBugsReportAsync();
                return Ok(reports);
            }

            catch (Exception ex)
            {

                return StatusCode(500, $"An error occurred while processing your request: {ex.Message}");
            }
        }


        /// <summary>
        /// API for for retrieving a bug report submitted by an intern by its ID.
        /// </summary>
        /// <param name="Id">The ID of the bug report to retrieve.</param>
        /// <returns>Returns IActionResult containing the bug report with images if found, or NotFound if not found.</returns>
        [HttpGet("getFeedbackById")]
        public async Task<IActionResult> GetInternBugById(string Id)
        {
            try
            {
                FeedbackWithImagesDTO feedback = await _service.GetInternFeedbackByIdAsync(Id);
                if (feedback == null)
                {
                    return NotFound(); 
                }
                return Ok(feedback);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while processing your request: {ex.Message}");
            }
        }

        /// <summary>
        /// API for  for retrieving an image by its attachment ID.
        /// </summary>
        /// <param name="attachmentId">The ID of the attachment containing the image.</param>
        /// <returns>Returns IActionResult containing the image file if found, or NotFound if not found.</returns>
        [HttpGet("getImage")]
        public async Task<IActionResult> GetImage(string attachmentId)
        {
            try
            {
                DocumentAttachment attachment = await _repository.GetImageAsync(attachmentId);
                if (attachment == null || attachment.FileData == null)
                {
                    return NotFound("Image not found.");
                }

                return File(attachment.FileData, "image/jpeg", attachment.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while processing your request: {ex.Message}");
            }
        }

        /// <summary>
        /// Endpoint to delete a feedback by its ID.
        /// </summary>
        /// <param name="feedbackId">The ID of the feedback to be deleted.</param>
        /// <returns>
        /// 200 OK if the feedback is deleted successfully.
        /// 500 Internal Server Error if an error occurs while processing the request.
        /// </returns>
        [HttpDelete("deleteInternFeedback")]
        public async Task<IActionResult> Delete(string feedbackId)
        {
            try
            {
                await _service.DeleteFeedbackAsync(feedbackId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting the feedback: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves the list of feedback for mentors.
        /// </summary>
        /// <returns>The list of feedback for mentors.</returns>
        [HttpGet("getFeedbackMentors")]
        public async Task<IActionResult> MentorFeedbackListView()
        {
            try
            {
                var result = await _service.GetAllBugsForMentorsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the feedback: {ex.Message}");
            }
        }

        /// <summary>
        /// Endpoint for adding a reply to interns feedback by mentors.
        /// </summary>
        /// <param name="feedbackReplyDto">The data transfer object containing information for the mentor reply.</param>
        /// <returns>Returns an IActionResult representing the HTTP response.</returns>
        [HttpPut("addMentorReply")]

        public async Task<IActionResult> MentorFeedbackReply(BugsMentorReplyInputDto feedbackReplyDto)
        {
            try
            {
                BugsFeedback result = await _service.AddMentorCommentAsync(feedbackReplyDto);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the feedback: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves details of all admins associated with mentor in the organization.
        /// </summary>
        /// <returns>Returns an IActionResult containing a list of AdminList objects representing the admin details.</returns>
        [HttpGet("getAllAdminsForMentor")]

        public async Task<IActionResult> GetMentorAdminDetails()
        {
            try
            {
                List<AdminList> result = await _service.getAllMentorsInOrganizationAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while fetching the feedback: {ex.Message}");
            }
        }

    }
}
