using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class JournalFeedback
    {
        [Key]
        public required string Id { get; set; }
        public string? reviewerId { get; set; }
        public ApplicationUser? Reviewer { get; set; }
        public string? InternshipId { get; set; }
        public Internship? Internship { get; set; }
        public string? FeedbackPoints { get; set; }
        public string? ImprovementArea { get; set; }
        public required string JournalId { get; set; }
        public Journal? Journal { get; set; }
        public double? Rating { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public string? AdminReview { get; set; }
        public bool IsPublished { get; set; }
        public bool IsNotified { get; set; }
        public bool? IsEdited { get; set; }
    }
}
