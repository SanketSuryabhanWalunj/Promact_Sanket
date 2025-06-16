using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AlertPreference
    {
        [Key]
        public required string UserId { get; set; }
        public string? UserEmail { get; set; }
        public bool SendSMS { get; set; } = false;
        public bool SendEmail { get; set; } = false;
        public bool ReceiveNewCategories { get; set; } = false;
    }
}
