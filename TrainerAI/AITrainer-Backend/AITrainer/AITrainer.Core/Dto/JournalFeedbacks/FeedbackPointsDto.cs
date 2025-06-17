using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.JournalFeedbacks
{
    public class FeedbackPointsDto
    {
        public List<Topics> topicList { get; set; }
        public string improvements { get; set; } 
        public string FeedBack { get; set; }
    }
    public class Topics
    {
        public string topic { get; set; }
        public double rate { get; set; }
    }
}
