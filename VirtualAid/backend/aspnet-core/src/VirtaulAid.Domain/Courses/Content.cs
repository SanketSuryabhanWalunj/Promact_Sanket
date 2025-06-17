using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class Content : AuditedAggregateRoot<Guid>, IMultiLingualObject<ContentTranslation>
    {
        public int SerialNumber { get; set; }
        public string? ContentTitle { get; set; }
        public string? ContentData { get; set; }

        [ForeignKey("LessonId")]
        public Guid LessonId { get; set; }

        public virtual Lesson Lesson { get; set; }

        public DateTime CreatedDateTime { get; set; }
        public Guid? CreatorId { get; set; }

        public virtual ICollection<Section> Sections { get; set; }

        public ICollection<ContentTranslation> Translations { get; set; }
    }
}
