using AITrainer.AITrainer.Core.Dto.CareerPaths;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.SuperAdmin
{
    public class AdminProfile
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string organization { get; set; }
        public string Type { get; set; }
        public string ?ContactNo { get; set; }
        public bool isDeleted { get; set; }
        public List<string> TechStacks { get; set; } = new List<string>();
        public CareerPathDto? CareerPath { get; set; }
        public List<string> ProjectManagersEmails { get; set; } = new List<string>();
        public List<string> ProjectManagersNames { get; set; } = new List<string>();
    }
}
