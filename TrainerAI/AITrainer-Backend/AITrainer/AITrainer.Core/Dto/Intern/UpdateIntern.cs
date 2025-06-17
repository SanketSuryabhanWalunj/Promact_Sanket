using AITrainer.AITrainer.Core.Dto.CareerPaths;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Intern
{
    public class UpdateIntern
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string? ContactNo { get; set; }
        public string? CollegeName { get; set; }
        public string? CareerPath { get; set; }
        public string? CreatedTime { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
        public string BatchId { get; set; }
    }
}
