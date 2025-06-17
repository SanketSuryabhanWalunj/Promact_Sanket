using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.Interndashboard;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.Services.Assignements
{
    public interface IAssignmentAppService
    {
        Task<Assignment> AddAssignmentAsync(string topicId, CreateAssignmentDto input);
        Task<Assignment> AddCourseAssignmentAsync(string courseId, CreateAssignmentDto input);
        Task<Assignment> DeleteAssignmentAsync(string assignmentId);
        Task<string> GenerateAssignmentAsync(string courseName, string courseTopic, double durationInDay, double marks);
        Task<string> GenerateCourseAssignmentAsync(string courseId, CreateAssignmentDto input);
        Task<Assignment> ReGenerateAssignmentAsync(string id, UpdateAssignmentDto input);
        Task<Assignment> RemoveCourseAssignmentAsync(string id);
        Task<List<Assignment>> GetAssignmentList(string id);
        Task<bool> CheckAssignmentSubmited(string assignmentId, string topicId);
        Task<AssginmentInfo> AssignmentSubmisiion(AssignmentSubmisionReq assignment);
        Task<bool> AssignmentSubmisionUpdate(AssignmentSubmisionReq assignment);

        Task<Assignment> AddUserAssignmentAsync(string topicId, CreateUserAssignmentDto input);
        void ValidateAndAdjustGradingCriteria(UserAssignmentContent content);
    }
}