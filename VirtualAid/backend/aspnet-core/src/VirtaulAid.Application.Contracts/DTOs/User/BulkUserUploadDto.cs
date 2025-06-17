using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.User
{
    public class BulkUserUploadDto
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string CurrentCompanyId { get; set; }
    }
}
