using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AlertLevel
    {
        [Key]
        public int Id { get; set; }
        public string LevelLabel { get; set; } = string.Empty;
        public string LevelColor { get; set; } = string.Empty;
    }
}
