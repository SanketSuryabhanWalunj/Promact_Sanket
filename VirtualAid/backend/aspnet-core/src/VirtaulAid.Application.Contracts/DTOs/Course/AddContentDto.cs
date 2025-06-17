using System;

namespace VirtaulAid.DTOs.Course
{
    public class AddContentDto
    {
        public string? ContentTitle { get; set; }
        public string? ContentData { get; set; }
        public Guid LessonId { get; set; }
    }
}
