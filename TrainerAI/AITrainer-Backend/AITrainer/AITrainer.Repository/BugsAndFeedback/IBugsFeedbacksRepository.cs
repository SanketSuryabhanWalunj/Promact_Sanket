using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.BugsAndFeedback
{
    public interface IBugsFeedbacksRepository
    {
        Task<BugsFeedback> CreateFeedbackAsync(BugsFeedback feedback);
        Task<string> GetMentorAsync(string userId);
        Task<List<AdminList>> GetMentorListOfInternAsync(List<string> userIds);
        Task<List<BugsFeedback>> GetallBugReportOfInternAsync(string userId);
        Task <BugsFeedback> FindBugByIdAsync(string feedbackId);
        Task<BugsFeedback> UpdateFeedbackAsync(BugsFeedback feedback);
        Task<DocumentAttachment> GetImageAsync(string id);
        Task<List<BugsFeedback>> GetMentorBugsAsync(string? mentorId, List<string> internIds);
        Task<List<ReporterInfoDTO>> GetReporterDetailsAsync(List<string> internIds);
        Task<List<string>> GetAllInternsOfMentorAsync(string mentorId);
        Task<string> GetAdminTypeAsync(string userId);
        Task<List<AdminList>> getAllMentorsInOrganizationAsync(string mentorId);
    }
}
