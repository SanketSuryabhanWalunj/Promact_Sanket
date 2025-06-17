namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class AssignmentContentDto
    {
        public string AssignmentTitle { get; set; }
        public string Course { get; set; }
        public string Topic { get; set; }
        public string Objective { get; set; }
        public List<InstructionDto> Instructions { get; set; }
        public List<GradingCriteriaDto> GradingCriteria { get; set; }
    }

    public class InstructionDto
    {
        public int Part { get; set; }
        public string Note { get; set; }
    }

    public class GradingCriteriaDto
    {
        public int Part { get; set; }
        public string Percentage { get; set; }
    }
}
