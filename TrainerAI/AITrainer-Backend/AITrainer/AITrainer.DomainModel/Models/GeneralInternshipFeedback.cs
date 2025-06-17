using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using Npgsql.EntityFrameworkCore.PostgreSQL.Query.Expressions.Internal;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class GeneralInternshipFeedback
    {
        public required string Id { get; set; }
        public required string InternshipId { get; set; }
        public Internship? Internship { get; set; }
        public string? Type { get; set; }
        public string? BehaviourCategoryId { get; set; }
        public BehaviourCategory? Category { get; set; }
        public string Comment { get; set; }
        public double? ReceivedMarks { get; set; }
        public string CreatedById { get; set; }
        public string CreatedByName { get; set;}
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set;}
        public bool? IsPublished { get; set;}
        public bool IsNotified { get; set; }
        public bool? IsEdited { get; set; }
    }
}
