using System;
using System.Collections.Generic;
using VirtaulAid.DTOs.Course;

namespace VirtaulAid.DTOs.Admin
{
    public class CompanyListDto
    {
        public Guid Id { get; set; }
        public int NoOfEmployees { get; set; }
        public string CompanyName { get; set; }
        public string Email { get; set; }
        public int NoOfCoursesPurchased { get; set; }
        public string Country { get; set; }
        public string ProfileImage { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsVerified { get; set; }
        public List<ResCustomCourseRequestDto> CustomCourseRequests { get; set; }
    }
}
