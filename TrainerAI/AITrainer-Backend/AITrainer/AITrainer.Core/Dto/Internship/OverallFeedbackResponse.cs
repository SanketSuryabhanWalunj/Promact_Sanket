namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class OverallFeedbackResponse
    {
        public string Id { get; set; }
        public string ReviewerId { get; set; }
        public string ReviewerName { get; set; }
        public MessageFormat Message { get; set; }
        public string Type { get; set; }
        public string? AssignmentSubmissionId { get; set; }
        public string? JournalId { get; set; }
        public string? InternshipId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool? IsEdited { get; set; }
    }
    public class MessageFormat
    {
        public string? Feedback { get; set; }
        public string? ImprovementArea { get; set; }
        public double? Rating { get; set; }
        public double? Score { get; set; }
        public string? Comment { get; set; }
    }

    
}
