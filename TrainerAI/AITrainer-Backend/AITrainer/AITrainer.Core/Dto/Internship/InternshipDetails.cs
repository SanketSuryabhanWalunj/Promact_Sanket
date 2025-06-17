namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class InternshipDetails
    {
        public string InternId { get; set; }
        public string CourseId { get; set; }
        public DateTime StartDate { get; set; }
        public string BatchId { get; set; }
        public List<string> MentorId { get; set; }
        public List<string> TemplateId { get; set; }
    }
}
