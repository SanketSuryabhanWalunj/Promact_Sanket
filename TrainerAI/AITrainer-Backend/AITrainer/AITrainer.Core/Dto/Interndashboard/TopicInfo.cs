using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class TopicInfo
    {
        public Topic Topic { get; set; }
        public QuizSubmission? Quiz { get; set; }
        public List<AssginmentInfo>? Assginment { get; set; }
        public JournalDataInfo? Journal { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
