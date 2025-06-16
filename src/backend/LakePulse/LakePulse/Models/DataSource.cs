using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("DataSouces")]
    public class DataSource : AuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FileName { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string DataSourceType { get; set; } = string.Empty;
        public string? Label { get; set; }
        public string? Comment { get; set; }
        public string? LakePulseId { get; set; }
        public DateTime? ReportDate { get; set; }
        public string? UserId { get; set; }

    }
}
