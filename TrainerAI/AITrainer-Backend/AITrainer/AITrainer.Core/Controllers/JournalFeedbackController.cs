using AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.Services.JournalFeedbacks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AITrainer.AITrainer.Core.Controllers
{


    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JournalFeedbackController : ControllerBase
    {
        private readonly IJournalFeedbackAppService _journalFeedbackAppService;
        public JournalFeedbackController(IJournalFeedbackAppService journalFeedbackAppService)
        {
            _journalFeedbackAppService = journalFeedbackAppService;
        }


        /// <summary>
        /// Creates feedback for a journal entry.
        /// </summary>
        /// <param name="journal">Data containing the journal feedback request.</param>
        /// <returns> Returns the result of generating the journal feedback. </returns>
        [HttpPost("journal-feedback")]
        public async Task<ActionResult> CreateJournalFeedback(JournalFeedbackRequestDto journal)
        {
            var result = await _journalFeedbackAppService.GenerateJournalFeedbackAsync(journal);
            return result;
        }


        /// <summary>
        /// Retrieves feedback for a specific journal entry.
        /// </summary>
        /// <param name="journalId">The ID of the journal entry to retrieve feedback for.</param>
        /// <returns> Returns the feedback for the specified journal entry. </returns>
        [HttpGet("journal-feedback")]
        public async Task<ActionResult> GetJournalFeedback(string journalId)
        {
            var result = await _journalFeedbackAppService.GetJournalFeedback(journalId);
            return result;
        }


        /// <summary>
        /// Updates feedback for a journal entry.
        /// </summary>
        /// <param name="update">Data containing the updated journal feedback.</param>
        /// <returns>
        /// Returns Ok with the updated journal feedback if successful.
        /// Returns NotFound if no journal feedback is found.
        /// </returns>
        [HttpPut("edit-journal-feedback")]
        public async Task<ActionResult> UpdateJournalFeedback(UpdateJournalFeedback update)
        {
            var result = await _journalFeedbackAppService.UpdateJournalFeedback(update);

            if (result == null)
            {
                return NotFound(new { message = "Not found any Journal Feedback" });
            }
            return Ok(result);
        }


        /// <summary>
        /// Publishes feedback for a journal entry.
        /// </summary>
        /// <param name="feedbackId">The ID of the feedback to be published.</param>
        /// <returns>
        /// Returns Ok if the feedback is successfully published.
        /// Returns NotFound if no feedback is found.
        /// </returns>
        [HttpPut("publish-journal-feedback")]
        public async Task<ActionResult> UpdatePublishFeedback(string feedbackId)
        {
            var result = await _journalFeedbackAppService.PublishJournalFeedback(feedbackId);

            if (!result)
            {
                return NotFound(new { message = "Not found any assignment Feedback" });
            }
            return Ok(result);
        }
    }
}
