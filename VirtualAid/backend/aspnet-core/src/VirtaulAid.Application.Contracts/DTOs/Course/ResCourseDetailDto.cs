using System;
using System.Collections.Generic;


namespace VirtaulAid.DTOs.Course
{
    public class ResCourseDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public double Price { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public int TotalNoOfHours { get; set; }
        public int NoOfModules { get; set; }
        public List<string> LearningOutcomes { get; set; }
        public List<ModuleDto> Modules { get; set; }
        public DateTime EnrolledDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public double Progress { get; set; } = 0;
        public bool IsCompleted { get; set; }
        public int ExamDetailId { get; set; }
        public string? ExamType { get; set; }
        public DateTime? CertificateExpirationDate { get; set; }
        public string Language { get; set; }

    }
}
