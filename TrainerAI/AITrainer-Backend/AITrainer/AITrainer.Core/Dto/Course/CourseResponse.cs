namespace AITrainer.AITrainer.Core.Dto.Course
{
    public class CourseResponse
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int Duration { get; set; }
        public string DurationType { get; set; }
        public string TrainingLevel { get; set; }
        public bool Quiz { get; set; }
        public bool IsDeleted { get; set; }
    }
}
