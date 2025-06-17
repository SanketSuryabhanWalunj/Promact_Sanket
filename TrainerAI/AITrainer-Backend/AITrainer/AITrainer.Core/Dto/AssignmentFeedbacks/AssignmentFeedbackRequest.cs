namespace AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks
{
    public class AssignmentFeedbackRequest
    {
        public string? Feedback { get; set; }
        public double? Score { get; set; }
        public string? SubmitedAssgnimentId { get; set;}
        public string AssignmentId { get; set; }
        public string? InternshipId { get;set; }
    }
}
