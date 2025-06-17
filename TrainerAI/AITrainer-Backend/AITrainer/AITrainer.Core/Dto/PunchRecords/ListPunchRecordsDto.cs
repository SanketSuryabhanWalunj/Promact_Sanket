using AITrainer.AITrainer.Core.Dto.LeavesApplication;

namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class ListPunchRecordsDto
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public DateTime PunchDate { get; set; }
        public bool IsPunch { get; set; }
        public string? Comments { get; set; }
        public bool IsRequest { get; set; }
        public DateTime? RequestDate { get; set; }
        public string? RequestStatus { get; set; }
        public bool IsStartDate { get; set; }
        public bool IsApplyLeave { get; set; }
        public string? LeaveStatus { get; set; }
        public string? LeaveType { get; set; }
        public List<ListPunchLogTimeDto>? punchLogTime { get; set; }
        public List<LeavePunchDto>? leavePunchDto {  get; set; }
    }

}
