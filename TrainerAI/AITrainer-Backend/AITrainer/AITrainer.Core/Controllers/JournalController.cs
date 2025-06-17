using AITrainer.AITrainer.Core.Dto.Journal;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Journals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JournalController: ControllerBase
    {
        private readonly IJournalRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JournalController(IJournalRepository repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }


        /// <summary>
        /// Records daily journal entries submitted by interns.
        /// </summary>
        /// <param name="jouranlData">Data containing journal entries.</param>
        /// <returns>
        /// Returns Ok with the created journal entry if successful.
        /// Returns Ok with existing journal details if a journal entry already exists for the day.
        /// Returns BadRequest if the operation fails.
        /// </returns>
        [HttpPost("daily-journal")]
        public async Task<ActionResult> DailyJournal(JouranlDataDto jouranlData)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var internDetails = await _repository.InternDetails(userId, jouranlData.TopicId, jouranlData.InternshipId);
            var jsonData = JsonSerializer.Serialize(jouranlData.Options);
            var date = DateTime.UtcNow;

            var JournalDetails = await _repository.CheckJournal(jouranlData.TopicId, date, jsonData,jouranlData.InternshipId);

            if (JournalDetails == null)
            {
                var journal = new Journal
                {
                    Id = Guid.NewGuid().ToString(),
                    Internship_Id = internDetails.InternshipId,
                    Intern_Id = internDetails.InternId,
                    Topic_Id = jouranlData.TopicId,
                    Data = jsonData,
                    CreatedDate = date,
                    UpdatedDate = date,
                    IsDeleted = false
                };

                await _repository.AddAsync(journal);
                return Ok(journal);
            }
            else if (JournalDetails != null)
            {
                return Ok(JournalDetails);
            }

            return BadRequest(new { message = "Please try again leter" });
        }


        /// <summary>
        /// Checks the evaluation status of the journal for the specified internship and topic.
        /// </summary>
        /// <param name="internshipId">The ID of the internship</param>
        /// <param name="TopicId">The ID of the topic</param>
        /// <returns>A JournalStatus object representing the evaluation status</returns>
        [HttpGet("Journal-status")]
        
        public async Task<JournalStatus> CheckEvaluationStatus(string internshipId, string TopicId)
        {
            return await _repository.JournalEvaluationStatus(internshipId, TopicId);
        }

    }
}
