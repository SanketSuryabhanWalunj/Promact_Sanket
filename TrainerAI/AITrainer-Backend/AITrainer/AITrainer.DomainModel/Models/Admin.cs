namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Admin
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }
        public string OrganizationId { get; set; }
        public Organization Organization { get; set; }
        public string? Type { get; set; }
        public string? CareerPathId { get; set; }
        public List<TechStack> TechStacks { get; set; } = new List<TechStack>();
        public CareerPath? CareerPath { get; set; }
        public List<Admin> ProjectManagers { get; set; } = new List<Admin>();

    }
}
