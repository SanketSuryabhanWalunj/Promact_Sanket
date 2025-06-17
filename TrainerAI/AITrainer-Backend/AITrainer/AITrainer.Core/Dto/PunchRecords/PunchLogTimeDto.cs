using AITrainer.Migrations;

namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class PunchLogTimeDto
    {
        public string PunchLogId { get; set; }
        public DateTime PunchIn { get; set; }
        public DateTime? PunchOut { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsPunchLogin { get; set; }
        public bool IsPunchLogOut { get; set; }
        public TimeSpan TotalTimeSpan { get; set; }
        public string? PunchStatus { get; set; }
    }
}
