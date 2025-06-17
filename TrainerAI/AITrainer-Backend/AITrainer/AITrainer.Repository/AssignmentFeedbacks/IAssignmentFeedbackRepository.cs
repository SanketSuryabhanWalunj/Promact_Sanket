using AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks;
using AITrainer.AITrainer.DomainModel.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace AITrainer.AITrainer.Repository.AssignmentFeedbacks
{
    public interface IAssignmentFeedbackRepository
    {
        Task<AssignmentFeedbackResponse> CreatedAsync(AssignmentFeedback assignment, string assignmentId);
        Task<AssignmentFeedbackResponse> GetAssignmentFeedback(string id, string assignmentId);
        Task<bool> PublishFeedback(string feedbackId);
        Task<AssignmentFeedbackResponse> UpdateAssignmentFeedback(UpdateAssignmentFeedbackRequest update, string userId);
        Task<string> setNullEntry(string InternshipId, string AssignmentId);

    }
}
