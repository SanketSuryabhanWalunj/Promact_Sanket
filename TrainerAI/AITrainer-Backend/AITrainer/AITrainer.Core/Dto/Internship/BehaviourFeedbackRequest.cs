namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class BehaviourFeedbackRequest
    {
        public string TemplateId { get; set; }
        public string InternshipId { get; set; }
        public List<Category> Categories { get; set; }
    }

    public class Category
    {
        public string CategoryId { get; set; }
        public double ReceivedMarks { get; set; }
        public string Feedback { get; set; }
    }

}
