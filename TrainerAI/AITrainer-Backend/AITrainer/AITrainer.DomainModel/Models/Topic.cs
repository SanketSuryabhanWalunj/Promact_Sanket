using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Topic
    {
        [Key]
        public string Id { get; set; }

        [Required]
        public string CourseId { get; set; }
        public Course Course { get; set; }

        [Required]
        public string TopicName { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }

        public int Duration { get; set; }

        public int Index { get; set; }

        public string QuizLink { get; set; }
        public string? QuizId { get; set; } 
        public int? QuizDuration { get; set; }
 
    }
}
