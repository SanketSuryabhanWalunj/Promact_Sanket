using System.ComponentModel.DataAnnotations.Schema;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class PunchLogTime
    {
        public string Id { get; set; }
        public DateTime PunchIn { get; set; }
        public DateTime? PunchOut { get; set; }
        public TimeSpan TotalTimeSpan { get; set; }
        public bool IsPunchLog { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsPunchLogin { get; set; }

        public bool IsPunchLogOut { get; set; }

        [ForeignKey(nameof(PunchRecordId))]
        public PunchRecord PunchRecord { get; set; }
        public string? PunchRecordId { get; set; }
    }
}
