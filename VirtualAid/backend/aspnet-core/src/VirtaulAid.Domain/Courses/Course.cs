using System;
using System.Collections.Generic;
using VirtaulAid.Carts;
using VirtaulAid.Exams;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class Course : FullAuditedAggregateRoot<Guid>, IMultiLingualObject<CourseTranslation>
    {
        public string Name { get; set; }
        public double Price { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public int TotalNoOfHours { get; set; }
        public int NoOfModules { get; set; }
        public List<string> LearningOutcomes { get; set; }
        public int ValidityInYears { get; set; }
        public int QuantitySold { get; set; }
        public bool HasOnlineExams { get; set; }
        public List<string> ExamTypes { get; set; }
        public ICollection<CourseTranslation> Translations { get; set; }
        public virtual ExamDetail ExamDetail { get; set; }
        public virtual ICollection<LiveExamDetails>? LiveExamDetails { get; set; }
        public virtual ICollection<Module> Modules { get; set; }
        public virtual ICollection<Cart>? Carts { get; set; }
        public virtual ICollection<CourseSubscriptionMapping>? CourseSubscriptionMappings { get; set; }
    }
}
