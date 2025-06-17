using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class BehaviourCategory
    {
        [Key]
        [Required]
        public string Id { get; set; }
        [Required]
        public string BehaviourTemplateId { get; set; }
        public BehaviourTemplate? BehaviourTemplate { get; set; }
        public string CategoryName { get; set; }
        public double TotalMarks{ get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
