using System;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Companies;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class CustomCourseRequest : AuditedAggregateRoot<Guid>
    {
        public Guid CompanyId { get; set; }
        [ForeignKey("CompanyId")]
        public virtual Company Company { get; set; }
        public Guid CourseId { get; set; }
        [ForeignKey("CourseId")]
        public virtual Course Course { get; set; }
        public string ExamType { get; set; }
        public string RequestMessage { get; set; }
        public string? ContactNumber { get; set; }
        public int NoOfCourses { get; set; }
        public bool IsFinished { get; set; } = false;
        public string? Status { get; set; } = null;
        public DateTime RequestDate { get; set; } = DateTime.Now;
        public DateTime? ResponseDate { get; set; }
    }
}
