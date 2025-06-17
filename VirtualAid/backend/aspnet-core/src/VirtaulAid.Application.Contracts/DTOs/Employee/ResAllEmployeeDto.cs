using System;

namespace VirtaulAid.DTOs.Employee
{
    public class ResAllEmployeeDto
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
        public Guid? CurrentCompanyId { get; set; }
        public int TotalCourses { get; set; }
    }
}
