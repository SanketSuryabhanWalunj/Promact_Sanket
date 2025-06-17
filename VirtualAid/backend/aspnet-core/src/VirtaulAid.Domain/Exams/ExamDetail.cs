using System;
using System.Collections.Generic;
using VirtaulAid.Courses;
using Volo.Abp.Domain.Entities.Auditing;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.Exams
{
    public class ExamDetail : AuditedAggregateRoot<int>, IMultiLingualObject<ExamDetailTranslation>
    {
        public string ExamName { get; set; }
        public ushort DurationTime { get; set; }
        public ushort NoOfQuestions { get; set; }
        public Guid CourseId { get; set; }
        public ICollection<ExamDetailTranslation> Translations { get; set; }
        public virtual Course? Course { get; set; } 
        public virtual ICollection<Question>? Questions { get; set; }
    }
}
