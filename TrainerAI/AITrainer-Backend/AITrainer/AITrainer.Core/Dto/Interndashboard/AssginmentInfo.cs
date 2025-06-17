using AITrainer.AITrainer.Core.Dto.Assignments;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class AssginmentInfo
    {
        public string? AssignmentId { get; set; }
        
        public string? AssignmentTitle { get; set; }

        public string? SubmissionId { get; set; }

        public string? SubmissionLink { get; set;}
        public DateTime? submittedDate { get; set; }
        public List<AssignmentInfoDto>? Assignment { get; set; }

    }
}
