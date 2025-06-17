namespace AITrainer.AITrainer.Core.Dto.Batches
{
    public class EditBatch
    {
        public string Id { get; set; }
        public string BatchName { get; set; }
        public string? Description { get; set; }
        public List<string> WeekdaysNames { get; set; }
        public int DailyHours { get; set; }
    }
}
