namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class BehaviourFeedbackResponse
    {
        public string TemplateName { get; set; }
        public List<BehaviourCategoryFeedback> CategoryWiseFeedback {  get; set; }
    }
    public class BehaviourCategoryFeedback
    {
        public string GeneralId { get; set; }
        public string? CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Feedback { get; set; }
        public double? ReceivedMarks { get; set; }
        public double TotalMarks { get; set; }
        public string? Type { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public bool? IsPublished { get; set; }
    }
}
