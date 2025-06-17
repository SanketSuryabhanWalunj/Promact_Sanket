using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Internship
    {
        [Key]
        public string Id { get; set; } // Auto-incremented primary key
        public string InternId { get; set; }
        public string CourseId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool Status { get; set; }
        public string MentorId { get; set; }
        public string? BehaviourTemplateId { get; set; }
        public bool IsStartNotified { get; set; }
        public bool IsEndNotified { get; set; }
        public bool IsEvaluated { get; set; }
        public bool? isDismissed { get; set; }
    }
}
