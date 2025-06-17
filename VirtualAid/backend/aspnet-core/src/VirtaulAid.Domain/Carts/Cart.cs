using System;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.Users;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Carts
{
    public class Cart : AuditedAggregateRoot<Guid>
    {
        public Guid? CompanyId { get; set; }
        public virtual Company? Company { get; set; }
        public Guid? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail? UserDetail { get; set; }
        public Guid CourseId { get; set; }
        public string ExamType {  get; set; }
        public virtual Course? Course { get; set; }
        public int CourseCount { get; set; }

    }
}
