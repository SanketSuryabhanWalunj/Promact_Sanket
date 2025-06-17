using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class Module: FullAuditedAggregateRoot<Guid>, IMultiLingualObject<ModuleTranslation>
    {
        public int SerialNumber { get; set; }
        public string Name { get; set; }

        [ForeignKey("CourseId")]
        public Guid CourseId { get; set; }

        public bool HasExam { get; set; }
        public virtual Course Course { get; set;}
        public virtual ICollection<Lesson> Lessons { get; set; }

        public ICollection<ModuleTranslation> Translations { get; set; }

    }
}
