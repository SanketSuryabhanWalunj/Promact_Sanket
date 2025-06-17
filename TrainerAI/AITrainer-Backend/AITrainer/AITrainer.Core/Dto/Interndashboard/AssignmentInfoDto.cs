using AITrainer.AITrainer.Core.Dto.Assignments;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class AssignmentInfoDto
    {
        
        public GetGptAssignmentResponseDto Content { get; set; }

        public double Marks { get; set; }
    }
    public class InternAssignmentInfoDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string SubmissionLink { get; set; }
        public GetGptAssignmentResponseDto Content { get; set; }

        public double Marks { get; set; }
        public bool isPublished { get; set; }
    }
}
