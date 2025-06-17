namespace AITrainer.AITrainer.Core.Dto.Assignments;


public class GetGptAssignmentResponseDto
{
    public string AssignmentTitle { get; set; }
    public string Course { get; set; }
    public string Topic { get; set; }
    public string Objective { get; set; }
    public List<Instruction> Instructions { get; set; }
    public List<GradingCriterion> GradingCriteria { get; set; }
}

public class Instruction
{
    public int Part { get; set; }
    public string Note { get; set; }
}

public class GradingCriterion
{
    public int Part { get; set; }
    public string Percentage { get; set; }
}
