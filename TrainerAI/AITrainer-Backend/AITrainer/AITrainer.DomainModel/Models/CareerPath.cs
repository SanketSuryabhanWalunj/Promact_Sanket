namespace AITrainer.AITrainer.DomainModel.Models
{
    public class CareerPath
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdatedDate { get; set; }

    }
}
