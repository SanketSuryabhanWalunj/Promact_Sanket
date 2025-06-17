namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class ListPunchLogTimeDto
    {
        public string Id { get; set; }
        public DateTime PunchIn { get; set; }
        public DateTime? PunchOut { get; set; }
        public TimeSpan TotalTimeSpan { get; set; }
        public bool IsPunchLog { get; set; }
        public bool IsPunchLogin { get; set; }
        public bool IsPunchLogOut { get; set; }
        public string? PunchRecordId { get; set; }
        public bool IsDeleted { get; set; }
        public string? PunchLogCategory { get; set; }
        
    }
}
