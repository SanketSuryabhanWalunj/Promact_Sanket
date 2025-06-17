using System;

namespace VirtaulAid.DTOs.Course
{
    public class CourseCertificateDto
    {
        public string UserName { get; set; }
        public string CourseName { get; set; }
        public double Percentage { get; set; }
        public DateTime CourseCompletionDate { get; set; }
        public DateTime CertificateExpirationDate { get; set; }
    }
}
