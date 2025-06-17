namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class History
    {
        public CourseInfo? ActiveCourseName { get; set; }
        public List<CourseInfo>? AllCourseName { get; set; }
        public Object TopicInfo { get; set; }
        public string InternshipId { get; set; }
        public string BehaviourTemplateId { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
