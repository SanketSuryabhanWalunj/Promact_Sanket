namespace AITrainer.AITrainer.Core.Dto.Course
{
    public class CourseDto
    {
        public string Name { get; set; }
        public int Duration { get; set; }
        public string DurationType { get; set; }
        public string TrainingLevel { get; set; }
        public bool Quiz { get; set; }
        public int QuizTime { get; set; }
        public int QuizCount { get; set; }
        public int QuizMarks { get; set; }
        public int QuizDuration { get; set; }
      
    }
    public class EditQuizDurationDto
    {
        public string courseId { get; set; }
        public int QuizDuration { get; set; }
    }

    public class EditCourseDto
    {
        public string CourseId { get; set; }
        public string Name { get; set; }
    }
}
