namespace AITrainer.AITrainer.DomainModel.Models
{
    public class LeaveApplication
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public DateTime leaveStartDate { get; set; }
        public DateTime? leaveEndDate { get; set; }
        public int? totalDay { get; set; }
        public string leaveType { get; set; }
        public string? leaveReason { get; set; }
        public string leaveStatus { get; set; }
        public string leaveCategory { get; set; }
        public bool isDeleted { get; set; }
        public string? approvedBy { get; set; }
        public DateTime? approvedDate { get; set; }
        public string? Comments { get; set; }
        public string createdBy { get; set; }
        public string updatedBy { get; set; }
        public DateTime createdDate { get; set; }
        public DateTime updatedDate { get; set; }
        public List<LeaveDocumentAttachment>? Attachments { get; set; } = new List<LeaveDocumentAttachment>();


    }
    public class LeaveDocumentAttachment
    {
        public string Id { get; set; }
        public string FileName { get; set; }
        public byte[] FileData { get; set; }
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        public LeaveApplication leaveApplication { get; set; }
        public string LeaveApplicationId { get; set; }
    }
}
