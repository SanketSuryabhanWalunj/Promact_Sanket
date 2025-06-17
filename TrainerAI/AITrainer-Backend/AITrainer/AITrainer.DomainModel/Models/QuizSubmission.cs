namespace AITrainer.AITrainer.DomainModel.Models
{
    public class QuizSubmission
    {
        public string Id { get; set; }
        public string QuizId { get; set; }
        public string InternshipId { get; set; }
        public string TopicId { get; set; }
        public double ScoreAchieved { get; set; }
        public double PercentageAchieved { get;set; }
        public string QuestionList { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
