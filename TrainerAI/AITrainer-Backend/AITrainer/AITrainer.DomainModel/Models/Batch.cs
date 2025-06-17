namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Batch
    {
        public string Id { get; set; }
        public string BatchName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set;}
        public bool IsDeleted { get; set; }
        public string? Description { get; set; }
        public string CreatedBy { get; set; }
        public List<string> WeekdaysNames { get; set; }
        public int DailyHours { get; set; }
        public List<Intern> Interns { get; set; }
    }
}
