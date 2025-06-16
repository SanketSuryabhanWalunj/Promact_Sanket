using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class UserRole : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }
        public required string UserId { get; set; }
        public required string Role { get; set; }
        public required string UserName { get; set; }
        public string? UserEmail { get; set; }
    }
}
