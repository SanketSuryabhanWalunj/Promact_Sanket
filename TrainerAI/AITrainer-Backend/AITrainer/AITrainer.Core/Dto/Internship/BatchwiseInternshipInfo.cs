using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class BatchwiseInternshipInfo
    {
        public string InternId { get; set; }
        public string? BatchName { get; set; }
        public string Name { get; set; }
        public string EmailId { get; set; }
        public CareerPath CareerPath { get; set; }
        public List<InternOverallFeedback> FeedbackList { get; set; }
    }

}
