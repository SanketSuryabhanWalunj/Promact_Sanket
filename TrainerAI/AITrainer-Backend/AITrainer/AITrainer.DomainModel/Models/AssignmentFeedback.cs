using Microsoft.AspNetCore.Components.Web;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class AssignmentFeedback
    {
        public required string Id { get; set; }
        public string? ReviewerId { get; set; }
        public ApplicationUser? Reviewer { get; set; }
        public string? Feedback { get; set; }
        public required string SubmitedAssgnimentId { get; set; }
        public AssignmentSubmission AssignmentSubmission { get; set; }
        public string? InternshipId { get; set; }
        public Internship? Internship { get; set; }
        public double? Score { get; set; }
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
