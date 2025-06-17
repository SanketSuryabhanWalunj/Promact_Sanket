using AITrainer.AITrainer.Core.Dto.Assignments;

namespace AITrainer.AITrainer.Core.Dto
{
    public class GetUserAssignmentDto
    {
        public string Id { get; set; }
        public string TopicId { get; set; }
        public UserAssignmentContent Content { get; set; }
        public double Marks { get; set; }
        public double? DurationInDay { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
    }


   
}
