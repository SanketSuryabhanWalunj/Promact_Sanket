using System;
using System.Collections.Generic;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.DTOs.Course
{
    public class LessonDto : IObjectTranslation
    {
        public Guid Id { get; set; }
        public int SerialNumber { get; set; }
        public string Name { get; set; }
        public Guid ModuleId { get; set; }
        public int CurrentModuleSerialNumber { get; set; }
        public ICollection<ContentDto> Contents { get; set; }
        public string Language { get; set; }
    }
}
