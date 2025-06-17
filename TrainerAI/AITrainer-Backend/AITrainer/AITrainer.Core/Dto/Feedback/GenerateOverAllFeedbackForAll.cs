using AITrainer.AITrainer.Core.Dto.Interndashboard;
using AITrainer.AITrainer.Core.Dto.Internship;

namespace AITrainer.AITrainer.Core.Dto.Feedback
{
    public class GenerateOverAllFeedbackForAll
    {
        public List<BatchwiseInternshipInfo> AllInternsFinalFeedbacks { get; set; }
        public int TotalPages { get; set; }
    }
}
