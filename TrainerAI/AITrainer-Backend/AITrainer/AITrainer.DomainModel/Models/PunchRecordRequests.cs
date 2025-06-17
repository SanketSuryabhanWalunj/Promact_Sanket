namespace AITrainer.AITrainer.DomainModel.Models
{
    public class PunchRecordRequests
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public DateTime RequestDate { get; set; }
        public string RequestPunches { get; set; }
        public string? RequestReason { get; set; }
        public DateTime RequestedOn { get; set; }
        public string status { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public bool IsDeleted { get; set; }
    }
}
