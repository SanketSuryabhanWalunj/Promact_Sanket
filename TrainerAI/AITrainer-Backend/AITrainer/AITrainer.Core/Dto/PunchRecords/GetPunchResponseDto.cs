namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class GetPunchResponseDto
    {
        public bool isPunch { get; set; }
        public DateTime? PunchLogInTime { get; set; }
        public DateTime? PunchLogOutTime { get; set; }
        public DateTime? InternStartDate { get; set; }
    }
}
