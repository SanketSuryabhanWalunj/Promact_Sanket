namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Holiday
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string WeekDay { get; set; }
        public string HolidayName { get; set; }
        public string WorkLocation { get; set; }
    }
}
