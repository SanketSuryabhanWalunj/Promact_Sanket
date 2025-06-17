using Microsoft.AspNetCore.Identity;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class ApplicationUser: IdentityUser
    {
        public string FirstName { get; set; }

        public string LastName { get; set; }

        public bool isDeleted { get; set; }

        public DateTime CreatedDate { get; set; }

        public string? Type { get; set; }
    }
}
