using System;
using System.Collections.Generic;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.DTOs.Course
{
    public class ModuleDto : IObjectTranslation
    {
        public Guid Id { get; set; }
        public int SerialNumber { get; set; }
        public string Name { get; set; }
        public Guid CourseId { get; set; }
        public bool HasExam { get; set; }
        public ICollection<LessonDto> Lessons { get; set; }
        public string Language { get; set; }

    }
}
