using System;
using System.Collections.Generic;
using System.Text;
using VirtaulAid.Enums;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.DTOs.Course
{
    public class SectionDto : IObjectTranslation
    {
        public int SerialNumber { get; set; }
        public string? SectionTitle { get; set; }
        public string? SectionData { get; set; }
        public SectionType FieldType { get; set; }
        public Guid ContentId { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public Guid? CreatorId { get; set; }
        public string Language {  get; set; }
    }
}
