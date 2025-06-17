using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Assignment
    {
        [Key]
        public required string Id { get; set; }
        public required string TopicId { get; set; }
        public Topic? Topic { get; set; }
        public required string Name { get; set; }
        public string Content { get; set; }
        public double Marks { get; set; }
        public double? DurationInDay { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
