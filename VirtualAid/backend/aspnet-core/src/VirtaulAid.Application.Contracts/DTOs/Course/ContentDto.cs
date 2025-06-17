using System;
using System.Collections.Generic;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.DTOs.Course
{
    public class ContentDto : IObjectTranslation
    {
        public Guid Id { get; set; }
        public int SerialNumber { get; set; }
        public string? ContentTitle { get; set; }
        public string? ContentData { get; set; }
        public Guid LessonId { get; set; }
        public ICollection<SectionDto> Sections { get; set; }
        public string Language { get; set; }
    }
}
