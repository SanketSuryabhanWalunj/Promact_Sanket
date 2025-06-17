using System;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Company
{
    public class UpdateCompanyDto
    {
        [Required]
        public Guid Id { get; set; }
        [Required]
        public string CompanyName { get; set; }
        [Required]
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string Postalcode { get; set; }
        [Required]
        public bool IsVerified { get; set; }
        [Required]
        public bool IsLocked { get; set; }
        public bool IsDeleted { get; set; }
        public string? ProfileImage { get; set; }
    }
}
