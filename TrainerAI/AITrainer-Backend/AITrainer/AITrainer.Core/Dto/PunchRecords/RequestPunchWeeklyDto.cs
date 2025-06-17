namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class RequestPunchWeeklyDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }
}
