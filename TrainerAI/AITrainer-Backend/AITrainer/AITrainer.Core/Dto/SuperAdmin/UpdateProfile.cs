using AITrainer.AITrainer.Core.Dto.CareerPaths;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.SuperAdmin
{
    public class UpdateProfile
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
       // public string Organization { get; set; }
        public string? ContactNo { get; set; }
        public string? Type { get; set; }
        public List<TechStackDTO> TechStacks { get; set; } = new List<TechStackDTO>();
        public CareerPathDto? CareerPath { get; set; }
        public List<string> ProjectManagerIds { get; set; } = new List<string>();

    }
}
