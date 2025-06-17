using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("FieldNote")]
    public class FieldNote : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public string? LakeId { get; set; }
        public string? UserName { get; set; }
        public string? Note { get; set; }
        public bool? IsReplay { get; set; }
        public bool IsAlert { get; set; }= false;
        public int? AlertLevelId { get; set; }
        public int? AlertCategorieId { get; set; }
        public Guid? FieldNoteId { get; set; }
        public virtual FieldNote? ParentFieldNote { get; set; }
        public ICollection<FieldNoteLike>? FieldNoteLike { get; set; }

    }
}
