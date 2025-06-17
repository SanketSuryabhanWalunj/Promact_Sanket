namespace AITrainer.AITrainer.Core.Dto.JournalFeedbacks
{
    public class UpdateJournalFeedback
    {
        public string? Id { get; set; }
        public string? JournalId { get; set; }
        public string FeedbackPoints { get; set;}
        public double Rating { get; set;}
        public string ImprovementArea { get; set;}
        public string AdminReview { get; set;}

    }
}
