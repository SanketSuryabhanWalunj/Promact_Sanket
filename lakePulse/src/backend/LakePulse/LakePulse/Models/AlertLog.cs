using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AlertLog : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public int LakePulseId { get; set; } = 0;
        public string? UserId { get; set; }
        public DateTime CreatedDateTime { get; set; } = DateTime.UtcNow;
        public DateTime? EndDateTime { get; set; } = null;
        public string? AlertText { get; set; }
        public int CategoryId { get; set; }
        public int LevelId { get; set; }
    }
}
