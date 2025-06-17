using AITrainer.AITrainer.Core.Dto.Internship.Const;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.Repository.Feedbacks;
using AITrainer.AITrainer.Repository.Interdashboard;
using AITrainer.AITrainer.Repository.Internships;
using AITrainer.Services.OpenAiServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;
using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.Services.Feedbacks;
using NPOI.HSSF.Record;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {

        #region Dependencies
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IInternshipRepository _internshipRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IFeedbackService _feedbackService;
        #endregion

        #region Constructors
        public FeedbackController(IFeedbackRepository feedbackRepository, IInternshipRepository internshipRepository,
                                    IHttpContextAccessor httpContextAccessor,IFeedbackService feedbackService)
        {
            _feedbackRepository = feedbackRepository;
            _internshipRepository = internshipRepository;
            _httpContextAccessor = httpContextAccessor;
            _feedbackService = feedbackService;
        }
        #endregion

        #region Public methods

        /// <summary>
        /// To fetch all feedbacks of all interns in a batch
        /// </summary>
        /// <param name="batchId"></param>
        /// <returns>Interns feedback for given batch</returns>
        [Authorize]
        [HttpGet("GetFeedback")]
        public async Task<ActionResult> GetFeedback(string batchId)
        {
            List<string> interns = await _internshipRepository.GetInternshipByBatchId(batchId);
            List<Feedback> result = await _feedbackRepository.GetFeedbackDetails(interns);
            return Ok(result);
        }
        /// <summary>
        /// Retrieves overall feedback for an intern by their user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern.</param>
        /// <returns>
        /// Returns an HTTP 200 OK response with the overall feedback data if the intern is found,
        /// or an HTTP 404 Not Found response if the intern is not found.
        /// </returns>
        [Authorize]
        [HttpGet("GetOverAllFeedbackbyInternId")]
        public async Task<ActionResult> GetOverallFeedback(string userId)
        {
            string internId = await _feedbackRepository.GetInternId(userId);
            if(internId == null)
            {
                return NotFound();
            }
            List<OverallFeedback> feedback = await _feedbackRepository.GetOverAllFeedbackbyInternId(internId);
            return Ok(feedback);
        }

        /// <summary>
        /// Retrieves overall feedback for a specific intern, optionally filtered by batch name.
        /// </summary>
        /// <param name="internId">The unique identifier of the intern.</param>
        /// <param name="batchName">Optional. The name of the batch to filter the feedback.</param>
        /// <returns>
        /// An HTTP action result containing the overall feedback for the intern. 
        /// If successful, returns a JSON object representing the feedback.
        /// If the intern is not found, returns a 404 NotFound response with an appropriate message.
        /// If no internship is found for the intern, returns a 404 NotFound response with an appropriate message.
        /// If any other exception occurs, returns a StatusCode 500 response with an error message.
        /// </returns>
        [HttpGet("OverallFeedbackByAI")]
        public async Task<ActionResult> OverallFeedback(string internId, string? batchName)
        {
            try
            {
                Intern internInfo = await _internshipRepository.GetInternName(internId);
                if (internInfo == null)
                {
                    return NotFound("Intern not found");
                }

                List<string> internshipIds = await _internshipRepository.GetInternshipId(internId);
                if (internshipIds.Count == 0)
                {
                    return NotFound("No internship found for intern");
                }
                string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                BatchwiseInternshipInfo feedback = await _feedbackService.GetRequiredOverallFeedback(internshipIds, internInfo, batchName,userId);

                OverallFeedback result = await _feedbackService.OverallFeedback(feedback.FeedbackList,internId,userId);
                return Ok(result);
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while generating overall feedback." });
            }
        }
        /// <summary>
        /// Updates the overall feedback for an intern based on the provided feedback data.
        /// </summary>
        /// <param name="feedback">The data representing the updated overall feedback for the intern.</param>
        /// <returns>
        /// Upon successful update, returns an ActionResult with the updated overall feedback object.
        /// If an error occurs during the update process, returns a StatusCode 500 response with an error message.
        /// </returns>
        [HttpPut("UpdateOverallFeedback")]
        public async Task<ActionResult> UpdateOverallFeedback(UpdateOverallFeedbackDTO feedback)
        {
            try
            {
                string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string userName = await _internshipRepository.GetUserName(userId);
                OverallFeedback result = await _feedbackRepository.UpdateOverallFeedback(feedback, userId,userName);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating overall feedback." });
            }
        }

        /// <summary>
        /// Retrieves the previous feedbacks given for a specific intern.
        /// </summary>
        /// <param name="internId">The unique identifier of the intern for whom to retrieve previous feedbacks.</param>
        /// <returns>
        /// Upon successful retrieval, returns an ActionResult with the previous feedbacks.
        /// </returns>
        [HttpGet("GetPreviousFeedbacks")]
        public async Task<ActionResult> GetPreviousFeedbacks(string internId)
        {
            List<OverallFeedback> result = await _feedbackRepository.GetPreviousFeedbacks(internId);
            return Ok(result);

        }

        /// <summary>
        /// Publishes the feedback with the specified ID.
        /// </summary>
        /// <param name="feedbackId">The unique identifier of the feedback to be published.</param>
        /// <returns>
        /// Upon successful publishing, returns an ActionResult with the published feedback object.
        /// </returns>
        [HttpGet("PublishFeedback")]
        public async Task<ActionResult> PublishFeedback(string feedbackId)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string userName = await _internshipRepository.GetUserName(userId);
            OverallFeedback result = await _feedbackRepository.PublishFeedback(feedbackId, userId, userName);
            return Ok(result);

        }

        /// <summary>
        /// Publishes feedback for all interns in a specified batch.
        /// </summary>
        /// <param name="batchId">The identifier of the batch for which feedback is to be published.</param>
        /// <returns>
        /// An ActionResult representing the outcome of the operation:
        ///   - If successful, returns a list of OverallFeedback objects representing the published feedback.
        ///   - If no interns are found for the given batchId, returns a NotFound response with an appropriate message.
        ///   - If an error occurs during the publishing process, returns a BadRequest response with an error message.
        /// </returns>
        [HttpPut("PublishAllFeedbacks")]
        public async Task<ActionResult> PublishAllFeedbacks([FromQuery] string batchId)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string userName = await _internshipRepository.GetUserName(userId);
            List<string> internIds = await _internshipRepository.GetInternshipByBatchId(batchId);
            if(internIds ==  null || internIds.Count == 0)
            {
                return NotFound(new { message = "No intern was found" });
            }
            List<OverallFeedback> result = await _feedbackService.PublishAllFeedbacksAsync(internIds,userId, userName);
            if(result == null)
            {
                return BadRequest("Error occurred while publishing feedbacks.");
            }
            return Ok(result);
        }

        /// <summary>
        /// Methos is to check intern has a mentor feedback or not.
        /// </summary>
        /// <param name="internId">Intern id to get feedback.</param>
        /// <param name="batchName">Intern batch.</param>
        /// <returns>If have mentor feedback then false if not then true.</returns>
        [HttpGet("GetInternFeedbackExist")]
        public async Task<ActionResult> GetInternFeedbackExist(string internId, string? batchName)
        {
            try
            {
                Intern internInfo = await _internshipRepository.GetInternName(internId);
                if (internInfo == null)
                {
                    return NotFound("Intern not found");
                }

                List<string> internshipIds = await _internshipRepository.GetInternshipId(internId);
                if (internshipIds.Count == 0)
                {
                    return NotFound("No internship found for intern");
                }
                string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                BatchwiseInternshipInfo feedback = await _feedbackService.GetRequiredOverallFeedback(internshipIds, internInfo, batchName, userId);
                return Ok(!(feedback.FeedbackList.Any()));
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An error occurred while checking the feedback " + ex.Message+ "." });
            } 
        }
        #endregion
    }
}
