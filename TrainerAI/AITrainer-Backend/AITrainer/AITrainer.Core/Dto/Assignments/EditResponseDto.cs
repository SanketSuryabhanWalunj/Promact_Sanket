using AITrainer.AITrainer.Core.Dto.Course;

namespace AITrainer.AITrainer.Core.Dto.Assignments
{
    public class EditResponseDto
    {
        public string AssignmentId { get; set; }
        public string AssignmentName { get; set; } 
        public Content content { get; set; }    
        public string AssignmentMarks { get; set; }
    }
}
