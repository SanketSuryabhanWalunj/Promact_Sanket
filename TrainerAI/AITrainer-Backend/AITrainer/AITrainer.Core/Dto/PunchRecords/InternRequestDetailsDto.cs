using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class InternRequestDetailsDto
    {
        public string Id { get; set; }
        public string InternId { get; set; }
        public DateTime PunchDate { get; set; }
        public bool IsPunch { get; set; }
        public string? Comments { get; set; }
        public string? approvedBy { get; set; }
        public DateTime? approvedDate { get; set; }
        public bool IsRequest { get; set; }
        public DateTime? RequestDate { get; set; }
        public string? RequestStatus { get; set; }
        public bool IsDeleted { get; set; }
        public string? RequestReason { get; set; }
        public List<PunchLogTimeDto>? PunchLogTime { get; set; }

    }
}
