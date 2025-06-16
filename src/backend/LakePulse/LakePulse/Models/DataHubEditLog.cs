using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("DataHubEditLog")]
    public class DataHubEditLog : AuditableEntity
    {
        [Key]
        public int Id { get; set; }
        public string? LakePulseId { get; set; } 
        public string? UserEmail { get; set; }
        public string? FeatureId { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }

    }
}
