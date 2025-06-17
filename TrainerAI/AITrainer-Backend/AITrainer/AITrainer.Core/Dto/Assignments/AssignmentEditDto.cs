namespace AITrainer.AITrainer.Core.Dto.Assignments
{
    public class AssignmentEditDto
    {
        public string AssignmentId { get; set; }
        public string AssignmentName { get; set; }
        public string AssignmentMarks { get; set; }
        public List<PartsDetails>? PartsDetails { get; set; }
        //public string AssignmentNote { get; set; }
        //public int AssignmentPoint { get; set; }
        //public string Percentage { get; set; }
    }
    public class PartsDetails
    {
        public int Part { get; set; }
        public string Note { get; set; }
        public string Percentage { get; set; }
        
    }
}
