using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.Services.BugsAndFeedback
{
    public interface IBugsFeedbacksService
    {
        Task<BugsFeedback> CreateInternBugsAsync(BugsFeedbackInputModel model);
        Task<List<AdminList>> GetInternsMentorDetailsAsync();
        Task<List<FeedbackWithImagesDTO>> GetBugsReportAsync();
        Task<FeedbackWithImagesDTO> GetInternFeedbackByIdAsync(string Id);
        Task DeleteFeedbackAsync(string feedbackId);
        Task<List<FeedbackWithImagesDTO>> GetAllBugsForMentorsAsync();
        Task<BugsFeedback> AddMentorCommentAsync(BugsMentorReplyInputDto feedbackReplyDto);
        Task<List<AdminList>> getAllMentorsInOrganizationAsync();
    }
}
