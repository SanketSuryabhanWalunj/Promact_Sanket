using AITrainer.AITrainer.Core.Enums;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Feedback
{
    public class OverallFeedbackRequest
    {
        public List<string> InternIds { get; set; }
        public ResponseType Type { get; set; }
        public string? BatchName { get; set; }
        public List<string>? CareerPaths { get; set; }
        public List<string>? Course { get; set; }
        public List<string>? Reviewer { get; set; }
        public List<string>? InternName { get; set; }

    }
    public class InternOverallFeedbackDto
    {
        public string internId { get; set; }
        public ResponseType type { get; set; }
        public string? batchName { get; set; }
        public List<string>? course { get; set; }
        public List<string>? careerPath { get; set; }
        public List<string>? reviewer { get; set; }
    }
}
