using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Quizes
{
    public interface IQuizRepository
    {
        Task AddAllQuizAsync(List<Quiz> quiz);
        Task<Quiz> AddQuizAsync(Quiz quiz);
        Task<Quiz> findQuizById(string quizId);
        Task<Quiz> findQuizAsync(string question,string answer,string topicId);
        Task<Quiz> updateQuizAsync(Quiz findQuiz);
        Task <List<Quiz>>FindQuizByTopic(string topicId);
        Task <Topic>FindTopic(string TopicId);
        Task updateTopic(string topic, string testId, string testLink);
        Task SaveResponseQuiz(QuizSubmission quizSubmission);
        Task<Internship> FindInternship(string username,string courseId);
        Task <Quiz>FindMark(string topic);
        bool isQuizSubmitted(string TopicId, string internId);
    }
}
