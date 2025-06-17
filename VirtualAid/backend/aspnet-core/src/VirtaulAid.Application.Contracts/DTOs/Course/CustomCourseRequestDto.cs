using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using VirtaulAid.DTOs.Company;

namespace VirtaulAid.DTOs.Course
{
    public class CustomCourseRequestDto
    {
        public Guid CompanyId { get; set; }
        public Guid CourseId { get; set; }
        public string ExamType { get; set; }
        public int NoOfCourses { get; set; }
        public string RequestMessage { get; set; }
        public string? ContactNumber { get; set; } = null;
    }
}
