using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Core.Dto.Quizes;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.Services.QuizService
{
    public interface IQuizService
    {
        Task <QuizSubmission>addResponse(QuizQuestyResponseDto content, string TopicId,string username);
    }
}
