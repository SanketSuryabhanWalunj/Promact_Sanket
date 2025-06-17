using AITrainer.AITrainer.DomainModel.Models;
using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.Core.Dto.Quizes
{
    public class QuizAddResponseDto
    {
        public string quizId { get; set; }
        public string TopicId { get; set; }
        public string Question { get; set; }
        public string Option1 { get; set; }
        public string Option2 { get; set; }
        public string Option3 { get; set; }
        public string Option4 { get; set; }
        public string Answer { get; set; }
        public int Marks { get; set; }
    }
}
