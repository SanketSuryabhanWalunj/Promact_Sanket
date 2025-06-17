using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Admin
{
    public class AdminRegistrationDto
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
    }
}
