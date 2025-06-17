namespace VirtaulAid.DTOs.Course
{
    public class PreviousNextCourseDto
    {
        public LessonDto? PreviousLesson { get; set; }
        public LessonDto CurrentLesson { get; set; }
        public LessonDto? NextLesson { get; set; }
    }
}
