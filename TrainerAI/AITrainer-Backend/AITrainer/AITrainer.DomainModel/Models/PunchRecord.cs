namespace AITrainer.AITrainer.DomainModel.Models
{
    public class PunchRecord
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public DateTime PunchDate { get; set; }
        public bool IsPunch { get; set; }
        public string? Comments { get; set; }
        public string? approvedBy { get; set; }
        public DateTime? approvedDate { get; set; }
        public bool IsDeleted { get; set; }
        public List<PunchLogTime> PunchLogTime { get; set; }
    }
}
