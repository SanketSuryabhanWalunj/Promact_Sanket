namespace AITrainer.AITrainer.Core.Dto.JournalFeedbacks
{
    public class JournalFeddbackResponse
    {
        public string Id { get; set; }
        public string JournalId { get; set; }
        public string ReviewerName { get; set; }
        public string FeedbackPoints { get; set; }
        public double? Rating { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? ImprovementArea { get; set; }
        public string? AdminReview { get; set; }
        public bool IsPublished { get; set; }
        public bool? IsEdited { get; set; }
    }
}
