using System;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Users;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Exams
{
    public class ExamResult : AuditedAggregateRoot<int>
    {
        public int ChosedOptionId { get; set; }
        public bool IsOptionCorrect { get; set; }
        public int QuestionId { get; set; }
        public Question? Question { get; set; }
        public Guid? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail? UserDetail { get; set; }
        public int CourseEnrollmentId { get; set; }
    }
}
