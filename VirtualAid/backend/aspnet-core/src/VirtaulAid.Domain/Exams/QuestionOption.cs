using Volo.Abp.Domain.Entities.Auditing;
using VirtaulAid.MultilingualObjects;

using System.Collections.Generic;
using VirtaulAid.Courses;

namespace VirtaulAid.Exams
{
    public class QuestionOption : AuditedAggregateRoot<int>, IMultiLingualObject<QuestionOptionTranslation>
    {
        public string OptionText { get; set; }
        public bool IsCorrect { get; set; }
        public int QuestionId { get; set; }
        public ICollection<QuestionOptionTranslation> Translations { get; set; }
        public Question? Question { get; set; }
    }
}
