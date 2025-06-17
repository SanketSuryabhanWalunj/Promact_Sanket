using AITrainer.AITrainer.Core.Dto.Topics;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Topics
{
    public class TopicRepository : ITopicRepository
    {
        private readonly ApplicationDbContext _context;
        public TopicRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddTopicAsync(Topic topic)
        {
            // Add the topic to the database context
            _context.Topics.Add(topic);

            // Save changes to the database
            await _context.SaveChangesAsync();
        }

        public async Task AddAllTopicAsync(List<Topic> topicList)
        {
            _context.Topics.AddRange(topicList);

            await _context.SaveChangesAsync();
        }

        public async Task<Topic> FindTopicId(string topicId)
        {
            var findTopic= await _context.Topics.FirstOrDefaultAsync(t => t.Id == topicId);

            return findTopic;
        }

        public async Task<Topic> updateTopicAsync(Topic topic)
        {
            _context.Topics.Update(topic);
            await _context.SaveChangesAsync();

            return topic;
        }

        public async Task<int> GetTotalDurationForCourse(string courseId)
        {
            return await _context.Topics.Where(t => t.CourseId == courseId && !t.IsDeleted).SumAsync(t => t.Duration);
        }

        public async Task<Course> FindCourseByTopicId(string courseId)
        {
            return await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        }

        public async Task<Course> UpdateCourseAsync(Course findCourse)
        {
             _context.Courses.Update(findCourse);
             await _context.SaveChangesAsync();

            return findCourse;
        }

        public async Task<Topic> FindTopicByIdAsync(string topicId)
        {
            var findTopic = await _context.Topics.FirstOrDefaultAsync(t => t.Id == topicId);

            return findTopic;
        }

        public async Task<Topic> DeleteTopicById(Topic findTopic)
        {
            // Update the entity in the database
            _context.Topics.Update(findTopic);
            await _context.SaveChangesAsync();

            return findTopic;
        }

        public async Task<Course> FindCourseByCourseId(string courseId)
        {
           var findCourse=await _context.Courses.FirstOrDefaultAsync(c => c.Id==courseId);

            return findCourse;
        }

        public async Task<IEnumerable<Topic>> GetTopicsByCourseIdAsync(string courseId)
        {
            var topicList = await _context.Topics
                .Where(topic => topic.CourseId == courseId && !topic.IsDeleted)
                .OrderBy(topic => topic.Index)
                .ToListAsync();

            return topicList;
        }

        public async Task<bool> UpdateTopicIndexAsync(string topicId, int newIndex)
        {
            var topic = await _context.Topics.FirstOrDefaultAsync(t => t.Id == topicId);

            if (topic != null)
            {
                topic.Index = newIndex;
                _context.Entry(topic).State = EntityState.Modified;
                var topicSaved = await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                return false;
            }
        }

        public async Task<bool> RearrangeTopicSequence(List<TopicRearrangeDto> topics)
        {
            int index = 1;
            foreach (var topic in topics)
            {
                var topicDetail = await _context.Topics.FirstOrDefaultAsync(t => t.Id == topic.Id);
                if(topicDetail.Index != index)
                {
                    topicDetail.Index = index;
                    _context.Topics.Update(topicDetail);
                    await _context.SaveChangesAsync();
                }
                index++;
            }
            if(topics.Count < index ) 
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
