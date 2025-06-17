using System;

namespace VirtaulAid.DTOs.Course
{
    public class ReqLessonDto
    {
        public Guid Id { get; set; }
        public int SerialNumber { get; set; }
        public string Name { get; set; }
        public Guid ModuleId { get; set; }
    }
}
