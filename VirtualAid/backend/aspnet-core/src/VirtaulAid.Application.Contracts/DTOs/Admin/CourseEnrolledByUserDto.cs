using System;

namespace VirtaulAid.DTOs.Admin
{
    public class CourseEnrolledByUserDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DateTime CourseEnrolledDate { get; set; }
        public double Progress { get; set; }
        public int ExamId { get; set; }
        public string? ExamType { get; set; }
        public DateTime? CertificateExpirationDate { get; set; }
        public string Language { get; set; }
    }
}
