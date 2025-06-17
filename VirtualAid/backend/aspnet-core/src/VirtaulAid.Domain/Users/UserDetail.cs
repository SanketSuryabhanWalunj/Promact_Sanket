using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Carts;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.Exams;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Users
{
    public class UserDetail : FullAuditedAggregateRoot<Guid>
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? Designation { get; set; }
        public string? Bio {  get; set; }
        public string? ContactNumber { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }
        public string? Postalcode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsLocked { get; set; } = false;
        public string? BannerImage { get; set; }
        public string? ProfileImage { get; set; }
        public bool? PublishData { get; set; } = false;
        public bool ConsentToShareData { get; set; } = false;
        public Guid? CurrentCompanyId { get; set; }
        [ForeignKey("CurrentCompanyId")]
        public virtual Company? Company { get; set; }
        public DateTime? JoiningDate { get; set; }
        public virtual ICollection<Cart>? Carts { get; set; }
        public virtual ICollection<UserDetailRoleMapping>? UserDetailRoleMappings { get; set; }
        public virtual ICollection<UserCourseEnrollments>? UserCourseEnrollments { get; set; }
        public virtual ICollection<CourseSubscriptionMapping>? CourseSubscriptionMappings { get; set; }
        public virtual ICollection<ExamResult>? ExamResults { get; set; }
        public virtual ICollection<LoggedInUser>? LoggedInUsers { get; set; }
    }
}
