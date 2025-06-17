using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Quizes
{
    public class QuizRepository:IQuizRepository
    {
        private readonly ApplicationDbContext _context;
        public QuizRepository(ApplicationDbContext context) 
        {
            _context = context;
        }

        public async Task AddAllQuizAsync(List<Quiz> quiz)
        {
            _context.Quiz.AddRange(quiz);

            await _context.SaveChangesAsync();
        }

        public async Task<Quiz> AddQuizAsync(Quiz quiz)
        {
            _context.Quiz.Add(quiz);

            await _context.SaveChangesAsync();

            return quiz;
        }

        public async Task<Quiz> findQuizById(string quizId)
        {
            var findQuiz = await _context.Quiz.FirstOrDefaultAsync(q => q.Id == quizId);

            return findQuiz;
        }

        public async Task<Quiz> findQuizAsync(string question, string answer, string topicId)
        {
            var findcourse = await _context.Quiz.FirstOrDefaultAsync(q =>
                q.TopicId == topicId &&
                q.Title == question &&
                q.Answer == answer &&
                q.IsDeleted == false
            );
            return findcourse;
        }

        public async Task<Quiz> updateQuizAsync(Quiz findQuiz)
        {
            _context.Quiz.Update(findQuiz);
            await _context.SaveChangesAsync();

            return findQuiz;
        }

        public async Task<List<Quiz>> FindQuizByTopic(string topicId)
        {
            var result = await _context.Quiz.Where(i=>i.TopicId == topicId).ToListAsync();
            return result;
        }
        public async Task<Topic> FindTopic(string TopicId)
        {
            var result = await _context.Topics.Where(i=>i.Id== TopicId).Where(i=>i.IsDeleted==false).FirstOrDefaultAsync();
            return result;
        }

        public async Task updateTopic(string TopicId, string testId, string testLink)
        {
            var result = await _context.Topics.Where(i => i.Id == TopicId).Where(i => i.IsDeleted == false).FirstOrDefaultAsync();
            result.QuizLink= testLink;
            result.UpdatedDate= DateTime.UtcNow; 
            result.QuizId= testId;
            await _context.SaveChangesAsync();
        }
        public async Task<Internship> FindInternship(string username, string courseId)
        {
            var intern = await _context.Intern.Where(i=>i.Email==username).FirstOrDefaultAsync();
            var intership = await _context.Internship.Where(i => i.InternId == intern.Id && i.CourseId == courseId).Where(i => i.Status == true).FirstOrDefaultAsync();
            return intership;

        }

        public async Task SaveResponseQuiz(QuizSubmission quizSubmission)
        {
            _context.QuizSubmissions.Add(quizSubmission);
            await _context.SaveChangesAsync();
        }
        public async Task<Quiz> FindMark(string topic)
        {
            var result = await _context.Quiz.FirstOrDefaultAsync(i=>i.TopicId==topic);
            return result;

        }

        public  bool isQuizSubmitted(string TopicId,string userId)
        {
            var internId = _context.Intern.Where(u => u.UserId == userId)
                  .Select(u => u.Id)
                  .FirstOrDefault();
            bool submitted;
            var intershiIp =  _context.Internship.Where(i=>i.InternId== internId && i.Status==true).FirstOrDefault();
            var result =  _context.QuizSubmissions.Where(i=>i.TopicId == TopicId && i.InternshipId == intershiIp.Id).FirstOrDefault();
            if (result == null)
            {
                submitted = false;
            }
            else
            {
                submitted = true;
            }
            return submitted;

        }
    }
}
