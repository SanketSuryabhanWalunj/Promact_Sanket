namespace AITrainer.AITrainer.Core.Dto.Intern
{
    public class AssignCourseDto
    {
        public string CourseName { get; set; }
        public string CourseDurationType { get; set; }
        public DateTime StartDate { get; set; }
        public List<TopicDTO> Topics { get; set; }
    }

    public class TopicDTO
    {
        public string Topic { get; set; }
        public string Date { get; set; }

        //public bool JournalSubmitted { get; set; }
    }
}
