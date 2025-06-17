using System;
using System.Collections.Generic;
using VirtaulAid.DTOs.Course;

namespace VirtaulAid.DTOs.Admin
{
    public class CompanyProfileDto
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; }
        public string Email { get; set; }
        public int EmployeesEnrolled { get; set; }
        public int CoursesPurchased { get; set; }
        public string Status { get; set; }
        public string ContactNumber { get; set; }
        public string[] Languages { get; set; }
        public string Country { get; set; }
        public string ProfileImage { get; set; }
        public bool IsDeleted { get; set; }
        public List<ResCustomCourseRequestDto> CustomCourseRequests { get; set; }
    }
}
