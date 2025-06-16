using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AlertCategorie
    {
        [Key]
        public int Id { get; set; }
        public string CategoryLabel { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
        public int DefaultLevelId { get; set; }
    }
}
