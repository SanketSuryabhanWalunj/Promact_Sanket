using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Company
{
    public class ReqCompanyRegistrationDto
    {
        [Required]
        public string CompanyName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string ContactNumber { get; set; }
    }
}
