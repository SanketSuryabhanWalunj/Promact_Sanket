using System.ComponentModel.DataAnnotations;

namespace LakePulse.Models
{
    public class DataPartner : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public int LakePulseId { get; set; }
        public string? Name { get; set; }
        public string? Website { get; set; }
        public string? Participation { get; set; }
    }
}
