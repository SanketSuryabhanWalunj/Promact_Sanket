using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.MentorDashboard
{
    public interface IMentorDashboardRepository
    {
        Task<List<Batch>> GetMentorBatches(string userId);
        //Task<List<string>> GetMentorIds(CourseIdsDTO courseIds);
        Task<List<ApplicationUser>> GetMentorDetails(List<string> courseIds, string? BatchId);
        Task<List<Course>> GetAllCourses(string userId);
        Task<Course> GetCourse(string internshipId);
        Task<List<Internship>> GetAllBatchInternship(string batchId);
        Task<string> GetUserName(string mentorId);
        Task<List<Intern>> GetActiveInternsAsync();
        Task<List<Course>> GetActiveCoursesAsync();
        Task<List<Topic>> GetActiveTopicsAsync();
        Task<List<Assignment>> GetActiveAssignmentsAsync();
        Task<List<AssignmentSubmission>> GetActiveAssignmentSubmissionsAsync();
        Task<List<Journal>> GetActiveJournalsAsync();
        Task<List<AssignmentFeedback>> GetActiveAssignmentFeedbacksAsync();
        Task<List<JournalFeedback>> GetActiveJournalFeedbacksAsync();
        Task<List<Internship>> GetInternshipsByCourseAsync(List<string> courseId);
        Task<List<Internship>> GetActiveInternshipsAsync();
        Task<List<ApplicationUser>> GetMentorList(string userId);
        Task<Batch> GetBatchIdAsync(Internship internship);
    }
}
