using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("UserLake")]
    public class UserLake : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        [Required]
        public required string LakeId { get; set; }
        public string? LakeState { get; set; }
        public ICollection<FavouriteCharacteristic>? FavouriteCharacteristics { get; set; }
    }
}
