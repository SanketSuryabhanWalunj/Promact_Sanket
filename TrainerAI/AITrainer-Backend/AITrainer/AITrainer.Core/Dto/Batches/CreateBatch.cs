namespace AITrainer.AITrainer.Core.Dto.Batches
{
    public class CreateBatch
    {
        public string BatchName { get; set; }

        public string? Description { get; set; }
        public List<string> WeekdaysNames { get; set; }
        public int DailyHours { get; set; }
    }
}
