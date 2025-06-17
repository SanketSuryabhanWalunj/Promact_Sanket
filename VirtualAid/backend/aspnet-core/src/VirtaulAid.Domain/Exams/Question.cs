using System;
using System.Collections.Generic;
using VirtaulAid.Courses;
using Volo.Abp.Domain.Entities.Auditing;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.Exams
{
    public class Question : AuditedAggregateRoot<int>, IMultiLingualObject<QuestionTranslation>
    {
        public string QuestionText { get; set; }
        public int ExamDetailId { get; set; }
        public Guid ModuleId { get; set; }
        public ICollection<QuestionTranslation> Translations { get; set; }
        public virtual ExamDetail? ExamDetail { get; set; }
        public virtual ICollection<QuestionOption>? QuestionOptions { get; set; }
        public virtual ICollection<ExamResult> ExamResults { get; set; }

    }
}
