namespace AITrainer.AITrainer.Core.Dto.JournalFeedbacks
{
    public class JournalFeedbackRequestDto
    {
        public string? AdminReview { get; set; }
        public string? JournalId { get; set; }   
        public string InternshipId { get; set; }
        public string TopicId { get; set; } 
    }
}
