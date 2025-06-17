using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.Interndashboard;

namespace AITrainer.AITrainer.Core.Dto.Course
{
    public class CourseDetailResponseDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int Duration { get; set; }
        public string DurationType { get; set; }
        public string TrainingLevel { get; set; }
        public bool Quiz { get; set; }
        public int QuizTime { get; set; }
        public int QuizCount { get; set; }
        public string QuizLink { get; set; }
        public DateTime CreatedDate { get; set; }
        public string JournalTemplateId { get; set; }
        public string TemplateName { get;set; }
        public List<CourseDetailTopicDto> Topics { get; set; }
    }

    public class CourseDetailTopicDto
    {
        public string Id { get; set; }
        public string TopicName { get; set; }
        public int Index { get; set; }
        public int Duration { get; set; }
        public string QuizLink { get; set; }
        public List<CourseDetailAssignmentDto> Assignment { get; set; }
        public List<CourseDetailQuizDto> Quiz { get; set; }
    }

    public class CourseDetailAssignmentDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public Content Content { get; set; }
        public string Marks { get; set; }
    }
    public class Content
    {
        public string AssignmentTitle { get; set; }
        public string course { get; set; }
        public string Topic { get; set; }
        public string Objective { get; set; }
        public List<Instruction> Instructions { get; set; }
        public List<GradingCriterion> GradingCriteria { get; set; }
    }
    public class CourseDetailQuizDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Option1 { get; set; }
        public string Option2 { get; set; }
        public string Option3 { get; set; }
        public string Option4 { get; set; }
        public string Answer { get; set; }
        public int Marks { get; set; }
    }
}
