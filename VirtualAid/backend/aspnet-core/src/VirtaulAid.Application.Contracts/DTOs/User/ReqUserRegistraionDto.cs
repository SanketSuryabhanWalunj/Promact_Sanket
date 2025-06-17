using System;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.User
{
    public class ReqUserRegistraionDto
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string ContactNumber { get; set; }

        public Guid? CurrentCompanyId { get; set; }
    }
}
