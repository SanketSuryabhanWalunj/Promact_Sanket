using System;

namespace VirtaulAid.DTOs.Admin
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int NoOfCoursesEnrolled { get; set; }
        public int NoOfCertificate { get; set; }
        public string Status { get; set; }
        public string ContactNumber { get; set; }
        public string[] Languages { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string Country { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string ProfileImage { get; set; }
        public bool IsDeleted { get; set; }
        public string CompanyName { get; set; }
    }
}
