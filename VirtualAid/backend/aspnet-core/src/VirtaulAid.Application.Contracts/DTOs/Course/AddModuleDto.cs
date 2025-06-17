using System;

namespace VirtaulAid.DTOs.Course
{
    public class AddModuleDto
    {
        public string Name { get; set; }
        public Guid CourseId { get; set; }
    }
}
