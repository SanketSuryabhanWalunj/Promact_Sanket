using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.Core.Dto.Internship.Const;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Feedbacks;
using AITrainer.AITrainer.Repository.Internships;
using AITrainer.Services.OpenAiServices;
using AutoMapper;
using Newtonsoft.Json;

namespace AITrainer.Services.Feedbacks
{
    public class FeedbackService : IFeedbackService
    {
        #region Dependencies
        private readonly IFeedbackRepository _feedbackRepository;
        private readonly IOpenAiService _openAiService;
        private readonly IInternshipRepository _internshipRepository;
        private readonly IMapper _mapper;
        #endregion

        #region Constructors
        public FeedbackService(IFeedbackRepository feedbackRepository,IOpenAiService openAiService, IInternshipRepository internshipRepository, IMapper mapper)
        {
            _feedbackRepository = feedbackRepository;
            _openAiService = openAiService;
            _internshipRepository = internshipRepository;
            _mapper = mapper;
        }
        #endregion

        #region Public methods
        /// <summary>
        /// Creates overall feedback for a specific intern based on the provided feedback data.
        /// </summary>
        /// <param name="overallFeedback">The data representing the overall feedback for the intern.</param>
        /// <param name="internId">The unique identifier of the intern for whom the feedback is created.</param>
        /// <param name="userId">The unique identifier of the user creating the feedback.</param>
        /// <returns>
        /// An asynchronous task representing the creation of overall feedback.
        /// Upon successful creation, returns the created overall feedback object.
        /// </returns>
        public async Task<BatchwiseInternshipInfo> GetRequiredOverallFeedback(List<string> internshipIds, Intern internInfo, string? batchName,string userId)
        {
            List<string>? courseName = null;
            List<string>? careerPath = null;
            List<string>? reviewer = null;
            BatchwiseInternshipInfo internFeedback = await _internshipRepository.GetRequiredOverallFeedback(internshipIds, internInfo, batchName, courseName, careerPath, reviewer);
            return internFeedback;
        }
        /// <summary>
        /// Generates overall feedback for a specific intern based on the provided feedback list, intern ID, and user ID.
        /// </summary>
        /// <param name="feedbackList">The list of feedback items contributing to the overall feedback.</param>
        /// <param name="internId">The unique identifier of the intern for whom the overall feedback is generated.</param>
        /// <param name="userId">The unique identifier of the user generating the overall feedback.</param>
        /// <returns>
        /// Upon successful generation, returns the created overall feedback object.
        /// </returns>
        public async Task<OverallFeedback> OverallFeedback(List<InternOverallFeedback> feedbackList,string internId, string userId)
        {
            string systemPrompt = InternshipFeedbackConst.systemOverallPrompt();
            string requsetPrompt = InternshipFeedbackConst.generateOverallFeedbackPrompt(feedbackList);
            string generateOverallFeedback = await _openAiService.GetOpenAiResponse(systemPrompt, requsetPrompt);
            OverallFeedbackDTO feedback = JsonConvert.DeserializeObject<OverallFeedbackDTO>(generateOverallFeedback);
            string userName = await _internshipRepository.GetUserName(userId);
            OverallFeedback overallFeedback = _mapper.Map < OverallFeedbackDTO, OverallFeedback>(feedback);

                overallFeedback.Id = Guid.NewGuid().ToString();
                overallFeedback.InternId = internId;
                overallFeedback.CreatedById = userId;
                overallFeedback.CreatedByName = userName;
                overallFeedback.UpdatedById = userId;
                overallFeedback.UpdatedByName = userName;
                overallFeedback.CreatedDate = DateTime.UtcNow;
                overallFeedback.UpdatedDate = DateTime.UtcNow;
                overallFeedback.IsDeleted = false;
                overallFeedback.IsPublished = false;
                overallFeedback.IsNotified = false;

            OverallFeedback result = await _feedbackRepository.CreateOverallFeedback(overallFeedback, internId, userId, userName);

            return result;
        }
        /// <summary>
        /// Publishes feedback for all interns with the latest feedback marked as published.
        /// </summary>
        /// <param name="internIds">The list of intern IDs for which feedback is to be published.</param>
        /// <param name="userId">The ID of the user initiating the publishing operation.</param>
        /// <param name="userName">The name of the user initiating the publishing operation.</param>
        /// <returns>
        /// A list of OverallFeedback objects representing the published feedback if successful; otherwise, null.
        /// </returns>
        public async Task<List<OverallFeedback>> PublishAllFeedbacksAsync(List<string> internIds, string userId, string userName)
        {
            List<OverallFeedback> updatedFeedbacks = new List<OverallFeedback>();
            Dictionary<string, List<OverallFeedback>> feedbacks = await _feedbackRepository.GetAllOverallFeedbacks(internIds);
            foreach (var feedback in feedbacks)
            {
                OverallFeedback latestFeedback = feedback.Value.OrderByDescending(i => i.CreatedDate).First();
                latestFeedback.IsPublished = true;
                latestFeedback.UpdatedDate = DateTime.UtcNow;
                latestFeedback.UpdatedById = userId;
                latestFeedback.UpdatedByName = userName;
                updatedFeedbacks.Add(latestFeedback);
            }
            int result = await _feedbackRepository.PublishAllFeedbacksAsync(updatedFeedbacks);
            if(result == 0)
            {
                return null;
            }
            return updatedFeedbacks;
        }
        #endregion
    }
}
