namespace AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks
{
    public class UpdateAssignmentFeedbackRequest
    {
        public string Id { get; set; }
        public string assignmentId { get; set; }
        public string? Feedback { get; set; }
        public double? Score { get; set; }
    }
}
