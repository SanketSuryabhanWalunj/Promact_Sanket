using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Courses
{
    public interface ICourseRepository
    {
        Task<Course> AddCourseAsync(CourseDto course,string userId);
        Task<Course> FindCourseAsync(CourseDto course);
        Task<ApplicationUser> findUSerByEmailASync(string email);
        Task<List<Course>> GetCoursesCreatedByUserAsync(string userId);
        Task<bool> DeleteCourseById(string courseId);
        Task<ChatGptInteraction> AddResponseAsync(ChatGptInteraction chatGptInteraction);
        Task<IEnumerable<Course>> GetCoursesListForInternAsync(string id);
        Task<Course> GetCourseByIdAsync(string courseId);
        Task<IEnumerable<Topic>> GetTopicsByCourseIdAsync(string courseId);
        Task<List<Assignment>> GetAssignmentsForTopicsAsync(List<string> topicIds);
        Task<List<Quiz>> GetQuizzesForTopicsAsync(List<string> topicIds);
        Task<JournalTemplate> GetJournalData(string journalId);
        Task<Course> FindTemplateIdForCourseAsync(string courseId);
        Task<Course> CreateTemplateIdAsync(Course course);
        Task<Course> UpdateCourse(Course course);
        Task<bool>UpdateTopicQuizDuration(string courseId, int duration);
        Task<Course> FindTemplateAsync(string templateId);
        Task<bool> DeleteTemplateById(Course findTemplate);
        Task<List<CourseInfoDto>> GetCourses(string userId);
    }
}
