namespace AITrainer.AITrainer.DomainModel.Models
{
    public class TechStack
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public List<Admin> Admins { get; set; } = new List<Admin>();
        public bool IsDeleted { get; set; } = false; 
        public DateTime CreatedDate { get; set; } 
        public DateTime LastUpdatedDate { get; set; } 
    }
}
