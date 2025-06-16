using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("FieldNoteLike")]
    public class FieldNoteLike : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public Guid? FieldNoteId { get; set; }
        public virtual FieldNote? FieldNote { get; set; }
    }
}
