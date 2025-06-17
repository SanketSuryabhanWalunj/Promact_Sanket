namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class AdminInternRequestDetailsDto
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public string? InternName { get; set; }
        public DateTime Date { get; set; }
        public List<DateTime>? RequestPunches { get; set; }
        public DateTime? RequestedOn { get; set; }
        public string? approvedBy { get; set; }
        public DateTime? approvedDate { get; set; }
        public string? Comments { get; set; }
        public string? Status { get; set; }
        public bool IsDeleted { get; set; }
        public string? RequestReason { get; set; }
    }
}
