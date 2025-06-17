namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class PunchRecordsDto
    {
        public string InternId { get; set; }
        public DateTime PunchDate { get; set; }
        public bool IsPunch { get; set; }
        public string? Comments { get; set; }
        public string? approvedBy { get; set; }
        public DateTime? approvedDate { get; set; }
    }
}
