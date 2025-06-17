using Amazon.S3.Model;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Companies;
using VirtaulAid.Users;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class CourseSubscriptionMapping : AuditedAggregateRoot<int>
    {
        public Guid? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail UserDetail { get; set; }
        public Guid? CompanysId { get; set; }
        [ForeignKey("CompanysId")]
        public virtual Company Company { get; set; }
        public Guid CourseId { get; set; }
        [ForeignKey("CourseId")]
        public string ExamType { get; set; } // Online, VR, Live
        public double TotalAmount { get; set; }
        public string PlanType { get; set; }
        public virtual Course Course { get; set; }
        public int TotalCount { get; set; }
        public int RemainingCount { get; set; }
        public Guid? PayementId { get; set; }
        public DateTime PurchasedDate { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}
