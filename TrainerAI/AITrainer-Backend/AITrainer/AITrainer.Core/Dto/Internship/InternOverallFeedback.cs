namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class InternOverallFeedback
    {
        public string CourseName { get; set; }
        public string? TopicName { get; set; }
        public string Type { get; set; }
        public string? Feedback { get; set; }
        public string? ImprovementArea { get; set; }
        public string? Comment { get; set; }
        public double? JournalRating { get; set; }
        public double? AssignmentReceivedMarks { get; set; }
        public double? AssignmentTotalMarks { get; set; }
        public double? BehaviouralScore { get; set; }
        public double? BehaviouralTotalScore { get; set; }
        public string ReviewerName { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
