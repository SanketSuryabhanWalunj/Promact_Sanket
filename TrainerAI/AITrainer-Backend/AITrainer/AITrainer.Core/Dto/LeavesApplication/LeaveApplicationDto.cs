using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.Core.Enums;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.LeavesApplication
{
    public class LeaveApplicationDto
    {
        public DateTime leaveStartDate { get; set; }
        public DateTime? leaveEndDate { get; set; }
        public string leaveType { get; set; }
        public string? leaveReason { get; set; }
        public string leaveCategory { get; set; }
        public List<IFormFile>? Files { get; set; }

    }
    public class ListAttendance
    {
        public List<LeaveApplicationsDto> LeaveApplication { get; set; }
        public int TotalPages { get; set; }
    }
    public class ListAdminAttendanceView
    {
        public List<AdminLeaveView> LeaveApplication { get; set; }
        public int TotalPages { get; set; }
    }
    public class LeaveApplicationsDto
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
        public List<LeaveDocumentAttachmentDto>? Attachments { get; set; } = new List<LeaveDocumentAttachmentDto>();

    }
    public class LeaveDocumentAttachmentDto
    {
        public string Id { get; set; }
        public string FileName { get; set; }
        public string FileData { get; set; }

    }
}
