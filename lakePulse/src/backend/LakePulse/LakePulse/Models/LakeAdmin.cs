using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("LakeAdmin")]
    public class LakeAdmin : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        [Required]
        public required string LakeId { get; set; }

        public string? LakeState { get; set; }
    }
}
