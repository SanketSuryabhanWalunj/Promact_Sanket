using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AlertPreferencesLevel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string UserId { get; set; }
        public int LevelId { get; set; }
        public bool Selected { get; set; } = false;
    }
}
