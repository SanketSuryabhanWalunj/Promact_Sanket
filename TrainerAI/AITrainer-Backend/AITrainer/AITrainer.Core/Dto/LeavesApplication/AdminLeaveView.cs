namespace AITrainer.AITrainer.Core.Dto.LeavesApplication
{
    public class AdminLeaveView
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public string Name { get; set; }    
        public DateTime leaveStartDate { get; set; }
        public DateTime? leaveEndDate { get; set; }
        public int? totalDay { get; set; }
        public string leaveType { get; set; }
        public string? leaveReason { get; set; }
        public string leaveStatus { get; set; }
        public string updatedBy { get; set; }
        public string? leaveCategory { get; set; }
        public DateTime createdDate { get; set; }
        public List<LeaveDocumentAttachmentDto>? Attachments { get; set; } = new List<LeaveDocumentAttachmentDto>();

    }
}
