using System;

namespace VirtaulAid.DTOs.CompanyDashboard
{
    public class ResCourseMetricDto
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; }
        public int EnrolledCount { get; set; }
        public int CertifiedCount { get; set; }
        public int CourseExpiredCount { get; set; }
    }
}
