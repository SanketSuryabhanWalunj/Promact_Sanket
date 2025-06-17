using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Enums;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class Section : AuditedAggregateRoot<Guid>, IMultiLingualObject<SectionTranslation>
    {
        public int SerialNumber { get; set; }
        public string? SectionTitle { get; set; }
        public string? SectionData { get; set; }
        public SectionType FieldType { get; set; } = SectionType.Paragraph;

        [ForeignKey("ContentId")]
        public Guid ContentId { get; set; }

        public virtual Content Content { get; set; }

        public DateTime CreatedDateTime { get; set; }
        public Guid? CreatorId { get; set; }
        public ICollection<SectionTranslation> Translations { get; set; }
    }
}
