using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.Core.Dto.Interndashboard;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.Core.Dto.Quizes;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Interdashboard
{
    public interface IInterndashboardRepository
    {
        string GetInternId(string userId);
        Task<InternCourseDto> Course(string internId);
        Task<List<InternCourseDto>> CourseByActive(string internId);
        int Duration(string courseId);
        Task<List<Topic>> GetTopic(string courseId);
        string CourseName(string courseId);
        List<InternAssignmentInfoDto> GetAssignment(string topicId, string internshipId);
        List<AssginmentInfo> AssignmentHistory(string topicId, string internshipId);
        JournalDataInfo JournalHistory(string topicId, string internshipId);
        Task<AssginmentInfo> GetAssignmentById(string id, string assignmentSubmisionId);
        Task<Journal> GetJournalDetails(string id);
        Task<CourseInfo> ActiveCourseName(string? internshipId);
        Task<List<CourseInfo>> AllCourseName(string? internId, string? internshipId);
        Task<InternCourseDto> CourseListById(string courseId);
        Task<InternCourseDto> GetCourseDetails(string internshipId);
        Task<List<string>> GetuniqueInternIds(string batchId);
        Task<double?> GetJournalFeedbackDetails(string journalId);
        Task<double?> AssignmentMarks(string SubmissionId);
        Task<double> AssignmentTotalMarks(string assignmentId);
        Task<ApplicationUser> GetUserDeatils(string InternId);
        string GetInternshipId(string internId, string courseId);
        Task<List<Internship>> GetInternshipDetails(string InternId);
        Task<List<Internship>> GetActiveInternshipDetails(string InternId);
        Task<List<string>> GetWorkingDays(string internId);
        Task<string> GetInternDetails(string internshipId, string CourseId);
        Task<JournalTemplate> GetJournalFromCourse(string CourseId);
        Task<DateTime[]> GetLeaveDetails(string internId);
        Task MakeChange(string Id);
        Task<List<Internship>> getActiveInternships();
        Task UpdateInternshipStatus(Internship internship);
        QuizSubmission QuizHistory(string topicId, string internshipId);
        Task<List<QuizQuestyResponseDto>> GetQuizById(string id);
        Task<string> GetQuizLink(string TopicId);
        Task<double> FindQuizTotalMarks(string QuizSubmissionId);
        Task<string> getUserId(string InternId);
        Task<List<string>> GetWorkingDaysFromBatch(string batchId);
        Task<Dictionary<string, BehaviouralScoreboard>> GetBehaviouralFeedback(string internshipId);
        Task<string> GetTemplateId(string internshipId);

    }
}
