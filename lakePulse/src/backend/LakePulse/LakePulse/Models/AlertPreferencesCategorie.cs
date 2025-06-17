using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AlertPreferencesCategorie
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public required string UserId { get; set; }
        public int CategoryId { get; set; }
        public bool Selected { get; set; } = false;
    }
}
