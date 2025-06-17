using AITrainer.AITrainer.Core.Dto.Course;

namespace AITrainer.AITrainer.Core.Dto.Assignments
{
    public class CreateUserAssignmentDto
    {
       
        public double durationInDay { get; set; }
        public double Marks { get; set; }
        public UserAssignmentContent content { get; set; }
        public string Name { get; set; }
        public bool AddTimeToCourseDuration { get; set; }
    }

    public class UserAssignmentContent
    {
        public string AssignmentTitle { get; set; }
        public string Course { get; set; }
        public string Topic { get; set; }
        public string Objective { get; set; }
        public List<Instruction> Instructions { get; set; }
        public List<GradingCriterion> GradingCriteria { get; set; }
    }
}
