using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("FavouriteCharacteristic")]
    public class FavouriteCharacteristic: AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }
        public string? CharacteristicId { get; set; }
        public Guid UserLakeId { get; set; }
        public UserLake? UserLake { get; set; }

    }
}
