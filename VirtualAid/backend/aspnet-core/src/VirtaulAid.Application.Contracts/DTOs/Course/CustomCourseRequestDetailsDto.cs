using System;
using System.Collections.Generic;
using System.Text;
using VirtaulAid.DTOs.Company;

namespace VirtaulAid.DTOs.Course
{
    public class CustomCourseRequestDetailsDto
    {
        public Guid CompanyId { get; set; }
        public Guid CourseId { get; set; }
        public CompanyDto Company { get; set; }
        public ResCourseDetailDto Course { get; set; }
        public string RequestMessage { get; set; }
        public string? ContactNumber { get; set; }
        public string ExamType { get; set; }
        public int NoOfCourses { get; set; }
    }
}
