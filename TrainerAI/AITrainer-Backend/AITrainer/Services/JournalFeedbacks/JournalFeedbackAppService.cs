using AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks;
using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks.Consts;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.JournalFeedbacks;
using AITrainer.Services.OpenAiServices;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace AITrainer.Services.JournalFeedbacks
{
    public class JournalFeedbackAppService : IJournalFeedbackAppService
    {

        private readonly IJournalFeedbackRepository _journalFeedbackRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDbContext _context;
        private readonly IOpenAiService _openAiService;
        private readonly UserManager<ApplicationUser> _userManager;


        public JournalFeedbackAppService(IJournalFeedbackRepository journalFeedbackRepository, ApplicationDbContext context, IOpenAiService openAiService, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager)
        {
            _journalFeedbackRepository = journalFeedbackRepository;
            _context = context;
            _openAiService = openAiService;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
        }


        /// <summary>
        /// Generates journal feedback asynchronously based on the provided journal feedback request.
        /// </summary>
        /// <param name="journals">The journal feedback request DTO</param>
        /// <returns>An action result containing the journal feedback details</returns>
        public async Task<ActionResult> GenerateJournalFeedbackAsync(JournalFeedbackRequestDto journals)
        {
            var journal = await _journalFeedbackRepository.FindJournalByIdAsync(journals.JournalId);
            var reviewerId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var topic = await _journalFeedbackRepository.GetJournalTopic(journals.TopicId);
            if (journal == null || journal.Data == "NA")
            {
                journal = await _journalFeedbackRepository.createNullSubmition(journals);
                var feedback = new AITrainer.DomainModel.Models.JournalFeedback
                {
                    Id = Guid.NewGuid().ToString(),
                    reviewerId = reviewerId,
                    FeedbackPoints = journals.AdminReview,
                    ImprovementArea = "Not Submitted",
                    JournalId = journal.Id,
                    Rating = 0,
                    CreatedBy = reviewerId,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedBy = reviewerId,
                    UpdatedDate = DateTime.UtcNow,
                    IsDeleted = false,
                    AdminReview = journals.AdminReview,
                    InternshipId = journals.InternshipId
                };

                await _context.JournalFeedbacks.AddAsync(feedback);
                await _context.SaveChangesAsync();

                var user = await _userManager.FindByIdAsync(reviewerId);
                var JournalFeedbackDetails = new JournalFeddbackResponse
                {
                    Id = feedback.Id,
                    JournalId = journal.Id,
                    ReviewerName = user.FirstName,
                    FeedbackPoints = feedback.FeedbackPoints,
                    Rating = feedback.Rating,
                    CreatedDate = feedback.CreatedDate,
                    ImprovementArea = feedback.ImprovementArea,
                    AdminReview = feedback.AdminReview,
                    IsPublished = feedback.IsPublished,
                };

                return new OkObjectResult(JournalFeedbackDetails);
            }
            else
            {
                var systemPrompt = JournalFeedbackConst.systemPrompt();
                var requsetPrompt = JournalFeedbackConst.generateJournalFeedbackPrompt(journal.Data, topic.TopicName);
                var feedBackpoints = await _openAiService.GetOpenAiResponse(systemPrompt, requsetPrompt);
                var result = JsonConvert.DeserializeObject<FeedbackPointsDto>(feedBackpoints);
                Console.WriteLine("OpenAI API Response:");
                Console.WriteLine(feedBackpoints);
                double totalRating = 0;
                int numberOfRatings = 0;
                foreach (var topics in result.topicList)
                {
                    string topicName = topics.topic;
                    double rate = topics.rate;
                    totalRating += rate;
                    numberOfRatings++;
                    Console.WriteLine($"Topic: {topicName}, Rate: {rate}");
                }

                double averageRating = totalRating / numberOfRatings;
                var checkFeedback = await _journalFeedbackRepository.FindJournalFeedbackByIdAsync(journals.JournalId);

                if (checkFeedback != null)
                {
                    checkFeedback.FeedbackPoints = result.FeedBack;
                    checkFeedback.Rating = Math.Round(averageRating, 1);
                    checkFeedback.ImprovementArea = result.improvements;
                    checkFeedback.AdminReview = journals.AdminReview;
                    checkFeedback.reviewerId = reviewerId;
                    checkFeedback.UpdatedBy = reviewerId;
                    checkFeedback.UpdatedDate = DateTime.UtcNow;

                    _context.JournalFeedbacks.Update(checkFeedback);
                    await _context.SaveChangesAsync();

                    var user = await _userManager.FindByIdAsync(checkFeedback.reviewerId);

                    var JournalFeedbackDetails = new JournalFeddbackResponse
                    {
                        Id = checkFeedback.Id,
                        ReviewerName = user.FirstName,
                        FeedbackPoints = checkFeedback.FeedbackPoints,
                        Rating = checkFeedback.Rating,
                        CreatedDate = checkFeedback.CreatedDate,
                        ImprovementArea = checkFeedback.ImprovementArea,
                        AdminReview = checkFeedback.AdminReview,
                        IsPublished = checkFeedback.IsPublished,
                    };

                    return new OkObjectResult(JournalFeedbackDetails);
                }
                else
                {
                    var feedback = new AITrainer.DomainModel.Models.JournalFeedback
                    {
                        Id = Guid.NewGuid().ToString(),
                        reviewerId = reviewerId,
                        FeedbackPoints = result.FeedBack,
                        ImprovementArea = result.improvements,
                        JournalId = journal.Id,
                        Rating = Math.Round(averageRating, 1),
                        CreatedBy = reviewerId,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedBy = reviewerId,
                        UpdatedDate = DateTime.UtcNow,
                        IsDeleted = false,
                        AdminReview = journals.AdminReview,
                        InternshipId = journals.InternshipId
                    };

                    await _journalFeedbackRepository.AddJournalFeedback(feedback);
                    var user = await _userManager.FindByIdAsync(feedback.reviewerId);

                    var JournalFeedbackDetails = new JournalFeddbackResponse
                    {
                        Id = feedback.Id,
                        JournalId = feedback.JournalId,
                        ReviewerName = user.FirstName,
                        FeedbackPoints = feedback.FeedbackPoints,
                        Rating = feedback.Rating,
                        CreatedDate = feedback.CreatedDate,
                        ImprovementArea = feedback.ImprovementArea,
                        AdminReview = feedback.AdminReview,
                        IsPublished = feedback.IsPublished,
                    };

                    return new OkObjectResult(JournalFeedbackDetails);
                }
            }
        }


        /// <summary>
        /// Retrieves the journal feedback for a given journal ID.
        /// </summary>
        /// <param name="journalId">The ID of the journal</param>
        /// <returns>
        /// ActionResult containing JournalFeddbackResponse if the feedback exists;
        /// NotFoundObjectResult if the feedback does not exist
        /// </returns>
        public async Task<ActionResult> GetJournalFeedback(string journalId)
        {
            var journalFeedback = await _context.JournalFeedbacks
                .Where(i => i.JournalId == journalId && i.IsDeleted == false).FirstOrDefaultAsync();

            if (journalFeedback == null)
            {
                return new NotFoundObjectResult(new { Message = "Please Genarte Feedback" });
            }

            var user = await _userManager.FindByIdAsync(journalFeedback.reviewerId);

            var JournalFeedbackDetails = new JournalFeddbackResponse
            {
                Id = journalFeedback.Id,
                ReviewerName = user.FirstName,
                FeedbackPoints = journalFeedback.FeedbackPoints,
                Rating = journalFeedback.Rating,
                CreatedDate = journalFeedback.CreatedDate,
                ImprovementArea = journalFeedback.ImprovementArea,
                AdminReview = journalFeedback.AdminReview,
                IsPublished = journalFeedback.IsPublished,
            };

            return new OkObjectResult(JournalFeedbackDetails);
        }


        /// <summary>
        /// Updates the journal feedback with the provided details.
        /// </summary>
        /// <param name="update">The object containing updated feedback details</param>
        /// <returns> JournalFeddbackResponse containing the updated feedback details if successful;
        /// Otherwise, null if the feedback does not exist  </returns>
        public async Task<JournalFeddbackResponse> UpdateJournalFeedback(UpdateJournalFeedback update)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var journalFeedback = await _context.JournalFeedbacks
                .FirstOrDefaultAsync(u => u.Id == update.Id);

            if (journalFeedback == null)
            {
                return null;
            }

            journalFeedback.UpdatedDate = DateTime.UtcNow;
            journalFeedback.FeedbackPoints = update.FeedbackPoints;
            journalFeedback.Rating = update.Rating;
            journalFeedback.ImprovementArea = update.ImprovementArea;
            journalFeedback.AdminReview = update.AdminReview;
            journalFeedback.reviewerId = userId;
            journalFeedback.UpdatedBy = userId;
            journalFeedback.IsEdited = true;

            _context.JournalFeedbacks.Update(journalFeedback);
            await _context.SaveChangesAsync();

            var reviewer = await _userManager.FindByIdAsync(journalFeedback.reviewerId);

            var result = new JournalFeddbackResponse
            {
                Id = journalFeedback.Id,
                ReviewerName = reviewer.FirstName,
                FeedbackPoints = journalFeedback.FeedbackPoints,
                Rating = journalFeedback.Rating,
                CreatedDate = journalFeedback.CreatedDate,
                ImprovementArea = journalFeedback.ImprovementArea,
                AdminReview = journalFeedback.AdminReview,
                IsPublished = journalFeedback.IsPublished,
                IsEdited = true
            };

            return result;
        }


        /// <summary>
        /// Publishes the journal feedback with the provided feedback ID.
        /// </summary>
        /// <param name="feedbackId">The ID of the feedback to be published</param>
        /// <returns>
        /// True if the feedback is successfully published; otherwise, false if the feedback does not exist
        /// </returns>
        public async Task<bool> PublishJournalFeedback(string feedbackId)
        {
            var journalFeedback = await _context.JournalFeedbacks
                    .FirstOrDefaultAsync(u => u.Id == feedbackId);

            if (journalFeedback == null)
            {
                return false;
            }
            journalFeedback.IsPublished = true;
            _context.JournalFeedbacks.Update(journalFeedback);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
