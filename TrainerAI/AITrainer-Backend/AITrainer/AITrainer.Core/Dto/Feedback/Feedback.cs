using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.Migrations;

namespace AITrainer.AITrainer.Core.Dto.Feedback
{
    public class Feedback
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string EmailId { get; set; }
        public string? CareerPath { get; set; } 
        public string? Courses { get; set; }
        public OverallFeedback? OverallFeedback { get; set; }

    }
  
}
