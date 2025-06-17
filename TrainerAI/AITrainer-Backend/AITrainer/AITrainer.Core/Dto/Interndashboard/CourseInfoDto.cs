namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class CourseInfoDto
    {
        public string InternshipId { get; set; }
        public object TopicInfo { get; set; }
        public string CourseName { get; set; }
        public string? JournalId { get; set; }
        public int CourseDuration { get; set; }
        public DateTime CourseEndDate { get; set; }
        public DateTime CourseStartDate { get; set; }
    }
}
