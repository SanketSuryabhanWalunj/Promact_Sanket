using AITrainer.AITrainer.Core.Dto.Topics;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Topics
{
    public interface ITopicRepository
    {
         Task AddTopicAsync(Topic topic);
         Task AddAllTopicAsync(List<Topic> topicList);
         Task<int> GetTotalDurationForCourse(string courseId);
         Task<Topic> updateTopicAsync(Topic topic);
         Task<Course> FindCourseByTopicId(string courseId);
         Task<Topic> FindTopicId(string topicId);
         Task<Course> UpdateCourseAsync(Course findCourse);
         Task<Topic> FindTopicByIdAsync(string topicId);
         Task<Topic> DeleteTopicById(Topic findTopic);
         Task<Course> FindCourseByCourseId(string courseId);
         Task<IEnumerable<Topic>> GetTopicsByCourseIdAsync(string courseId);
         Task<bool> UpdateTopicIndexAsync(string topicid, int newIndex);
        Task<bool> RearrangeTopicSequence(List<TopicRearrangeDto> topics);
    }
}
