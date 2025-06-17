namespace AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks
{
    public class AssignmentFeedbackResponse
    {
        public string Id { get; set; }
        public string SubmitionId { get; set; }
        public string ReviewerName { get; set; }
        public string Feedback { get; set;}
        public double? Score { get; set;}
        public DateTime? CreatedDate { get; set; }
        public double TotalMarks { get; set; }
        public bool IsPublished { get; set; }
        public bool? IsEdited { get; set; }

    }
}
