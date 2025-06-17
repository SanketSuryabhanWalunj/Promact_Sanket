using System;

namespace VirtaulAid.DTOs.User
{
    public class EmployeeDetailsDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? ContactNumber { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }
        public string? Postalcode { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsActive { get; set; }
        public Guid? CurrentCompanyId { get; set; }
        public DateTime? EnrolledDate { get; set; }
        public double Progress { get; set; } = 0;
        public DateTime? CertificateExpirationDate { get; set; }
        public bool IsPersonalCourse { get; set; } = false;
        public string? ProfileImage { get; set; }
        public bool IsDeleted { get; set; }
    }
}
