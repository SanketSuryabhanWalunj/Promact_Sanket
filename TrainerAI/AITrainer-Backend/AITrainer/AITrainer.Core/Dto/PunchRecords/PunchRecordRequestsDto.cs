namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class PunchRecordRequestsDto
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public DateTime RequestDate { get; set; }
        public List<DateTime> RequestPunches { get; set; }
        public string? RequestReason { get; set; }
        public string status { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
    public class PunchRecordRequestStatusDto
    {
        public DateTime RequestDate { get; set; }
        public string RequestStatus { get; set; }


    }
}
