using System;

namespace VirtaulAid.DTOs.Course
{
    public class AddLessonDto
    {
        public string Name { get; set; }
        public Guid ModuleId { get; set; }
    }
}
