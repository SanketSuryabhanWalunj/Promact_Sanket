using System;
using VirtaulAid.Courses;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Exams
{
    public class LiveExamDetails : AuditedAggregateRoot<int>
    {
        public DateTime ExamDate { get; set; }
        public int AllocatedSeatsCount { get; set; }
        public int RemaningSeatsCount { get; set; }
        public Guid CourseId { get; set; }
        public virtual Course? Course { get; set; }
    }
}
