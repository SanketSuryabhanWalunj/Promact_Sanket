using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class Lesson : AuditedAggregateRoot<Guid>, IMultiLingualObject<LessonTranslation>
    {
        public int SerialNumber { get; set; }
        public string Name { get; set; }

        [ForeignKey("ModuleId")]
        public Guid ModuleId { get; set; }

        public virtual Module Module { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public Guid? CreatorId { get; set; }
        public virtual ICollection<Content> Contents { get; set; }
        public ICollection<LessonTranslation> Translations { get; set; }
    }
}
