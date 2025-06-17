namespace AITrainer.AITrainer.Core.Dto.LeavesApplication
{
    public class LeaveNotificationModel
    {
        public string? AdminName { get; set; }
        public string InternFirstName { get; set; }
        public string InternLastName { get; set; }
        public DateTime leaveStartDate { get; set; }
        public DateTime? leaveEndDate { get; set; }
        public string leaveType { get; set; }
        public string? leaveReason { get; set; }
        public string leaveCategory { get; set; }
        public double? leaveDuration { get; set; }
        public string? leaveStatus { get; set; }
        public DateTime? RequestedOn { get; set; }
        public string? Comments { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? ApprovedBy { get; set; }
        public string? URL { get; set; }
    }
    public class AdminEmailModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
    }
}
