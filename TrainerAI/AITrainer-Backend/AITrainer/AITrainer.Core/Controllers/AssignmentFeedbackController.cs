using AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.AssignmentFeedbacks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AssignmentFeedbackController: ControllerBase
    {
        private readonly IAssignmentFeedbackRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AssignmentFeedbackController(IAssignmentFeedbackRepository repository, IHttpContextAccessor httpContextAccessor) 
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Creates feedback for an assignment submission
        /// </summary>
        /// <param name="request">The data representing the assignment feedback request</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the feedback creation</returns>
        [HttpPost("CreateAssignmentFeedback")]
        public async Task<ActionResult> CreateAssignmentFeedback(AssignmentFeedbackRequest request) 
        {
            if (request.SubmitedAssgnimentId == null)
            {
                request.SubmitedAssgnimentId = await _repository.setNullEntry(request.InternshipId, request.AssignmentId);
            }

            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var assignment = new AssignmentFeedback
            {
                Id = Guid.NewGuid().ToString(),
                ReviewerId = userId,
                Feedback = request.Feedback,
                SubmitedAssgnimentId = request.SubmitedAssgnimentId,
                Score = request.Score,
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow,
                UpdatedBy = userId,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false,
                AdminReview = "Admin",
                IsPublished = false,
                InternshipId = request.InternshipId
            };

            var result =await _repository.CreatedAsync(assignment, request.AssignmentId);

            if(result != null)
            {
                return Ok(result);
            }

            return NotFound(new { message = "Please try again later" });

        }

        /// <summary>
        /// Retrieves feedback for a specific assignment submission
        /// </summary>
        /// <param name="Id">The ID of the submission for which feedback is to be retrieved</param>
        /// <param name="assignmentId">The ID of the assignment related to the submission</param>
        /// <returns>Returns an ActionResult with the feedback information if found, otherwise returns a not found message</returns>
        [HttpGet("getAssignmentFeedback")]
        public async Task<ActionResult> GetAssignmentFeedback(string Id, string assignmentId)
        {
            var result = await _repository.GetAssignmentFeedback(Id, assignmentId);

            if(result == null) 
            {
                return NotFound(new { messgae = "Not Found any Feedback" });
            }   

            return Ok(result);
        }

        /// <summary>
        /// Updates feedback for an assignment submission
        /// </summary>
        /// <param name="update">The data representing the updated assignment feedback</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the feedback update</returns>
        [HttpPut("UpdateAssignmentFeedback")]
        public async Task<ActionResult> UpdateAssignmentFeedback(UpdateAssignmentFeedbackRequest update)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var result = await _repository.UpdateAssignmentFeedback(update, userId);

            if(result == null)
            {
                return NotFound(new { message = "Not found any assignment Feedback" });
            }

            return Ok(result);
        }

        /// <summary>
        /// Publishes the feedback for an assignment submission
        /// </summary>
        /// <param name="feedbackId">The ID of the feedback to be published</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the feedback publication</returns>
        [HttpPut("PublishFeedback")]
        public async Task<ActionResult> UpdatePublishFeedback(string feedbackId)
        {
            var result = await _repository.PublishFeedback(feedbackId);

            if (!result)
            {
                return NotFound(new { message = "Not found any assignment Feedback" });
            }
            return Ok(result);
        }
    }
}
