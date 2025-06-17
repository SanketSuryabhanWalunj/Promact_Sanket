namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class LeavePunchDto
    {
        public DateTime LeaveStartDate { get; set; }
        public DateTime? LeaveEndDate { get; set;}
        public string? LeaveStatus { get; set; }
        public string? LeaveType { get; set; }
        public DateTime createdDate { get; set; }
    }
}
