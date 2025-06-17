using System;

namespace VirtaulAid.DTOs.User
{
    public class UserCourseEnrollmentDto
    {
        public int Id { get; set; }
        public UserDetailsDto User { get; set; }
        public int CourseSubscriptionId { get; set; }
        public DateTime EnrolledDate { get; set; }
        public DateTime CourseStartDate { get; set; }
        public DateTime CourseEndDate { get; set; }
        public double Progress { get; set; } = 0;
        public Guid? CurrentModuleId { get; set; }
        public double CurrentModulePorgress { get; set; }
        public Guid? CurrentLessonId { get; set; }
        public bool IsExamConducted { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime ExpirationDate { get; set; }
        public DateTime? CertificateExpirationDate { get; set; }
        public string? ExamType { get; set; }
        public DateTime? LiveExamDate { get; set; }
        public bool? IsLiveExamDateApproved { get; set; }        
        public double? LiveExamMarkes { get; set; }
        public bool? IsLiveExamCompleted { get; set; }
    }
}
