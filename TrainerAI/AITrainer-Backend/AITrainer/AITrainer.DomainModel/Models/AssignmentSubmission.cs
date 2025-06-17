namespace AITrainer.AITrainer.DomainModel.Models
{
    public class AssignmentSubmission
    {
        public string Id { get; set; }
        public string AssignmentId { get; set; }
        public Assignment Assignment { get; set; }
        public string InternshipId { get; set; }
        public Internship Internship { get; set; }
        public string TopicId { get; set; }
        public Topic Topic { get; set; }
        public string GithubLink { get; set; }
        public DateTime SubmitedDate { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsNotified { get; set; }

    }
}
