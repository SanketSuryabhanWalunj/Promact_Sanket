namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class RequestPunchDto
    {
        public DateTime RequestedPunchOutTime { get; set; }
        public List<string> PunchInandOut { get; set; }

        public string? Comments { get; set; }
    }
}
