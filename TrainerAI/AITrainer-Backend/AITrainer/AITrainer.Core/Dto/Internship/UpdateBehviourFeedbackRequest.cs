namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class UpdateBehviourFeedbackRequest
    {
        public string TemplateId { get; set; }
        public string InternshipId { get; set; }
        public List<UpdateCategory> Categories { get; set; }
    }

    public class UpdateCategory
    {
        public string GeneralId { get; set; }
        public string CategoryId { get; set; }
        public double ReceivedMarks { get; set; }
        public string Feedback { get; set; }
    }
}
