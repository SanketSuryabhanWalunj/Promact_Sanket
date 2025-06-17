using AITrainer.AITrainer.Core.Dto.Quizes;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Quizes;
using Newtonsoft.Json;

namespace AITrainer.Services.QuizService
{
    public class QuizService:IQuizService
    {
        private readonly IQuizRepository _quizRepository;
        public QuizService(IQuizRepository quizRepository)
        {
            _quizRepository = quizRepository;  
        }

        /// <summary>
        /// Adds a quiz response to the database.
        /// </summary>
        /// <param name="content">The content of the quiz response.</param>
        /// <param name="TopicId">The ID of the topic associated with the quiz.</param>
        /// <param name="username">The username of the intern.</param>
        /// <returns>The added quiz response.</returns>
        public async Task<QuizSubmission> addResponse(QuizQuestyResponseDto content, string TopicId, string username)
       {
            var Topic = await _quizRepository.FindTopic(TopicId);
            var internship = await _quizRepository.FindInternship(username,Topic.CourseId);

            var questionList = content.singleMultipleQuestionACs.Select(q =>
    new SingleMultipleQuestionAC
       {
          questionDetail = q.questionDetail,
          singleMultipleAnswerQuestionOption = q.singleMultipleAnswerQuestionOption
                .Where(option => option.isAnswer)
                .Select(option => new SingleMultipleAnswerQuestionOption
                {
                    option = option.option,
                    isAnswer = option.isAnswer
                })
                .ToList()
       }).ToList();
            var questionListJson = JsonConvert.SerializeObject(content);
            var newQuizResponse = new QuizSubmission
            {
                Id = Guid.NewGuid().ToString(),
                QuizId = Topic.QuizId,
                InternshipId = internship.Id,
                TopicId = Topic.Id,
                ScoreAchieved = content.scoreAchieved,
                PercentageAchieved=content.percentage,
                QuestionList = questionListJson,
                IsDeleted = false,
                CreatedDate= DateTime.UtcNow
            };
            await _quizRepository.SaveResponseQuiz(newQuizResponse);
            return newQuizResponse;
       }
    }
}
