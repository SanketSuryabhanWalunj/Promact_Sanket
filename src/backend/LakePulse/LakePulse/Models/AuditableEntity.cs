using LakePulse.Data;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class AuditableEntity
    {
        [MaxLength(100)]
        public string CreatedBy { get; set; } = StringConstant.system; // Default value

        public DateTime CreatedTime { get; set; } = DateTime.UtcNow; // Default to current time

        [MaxLength(100)]
        public string LastUpdatedBy { get; set; } = string.Empty;

        public DateTime? LastUpdatedTime { get; set; }
    }
}
