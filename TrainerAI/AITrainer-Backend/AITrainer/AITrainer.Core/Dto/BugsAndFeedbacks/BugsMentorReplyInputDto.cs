namespace AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks
{
    public class BugsMentorReplyInputDto
    {
        public string FeedbackId { get; set; }
        public string Status { get; set; }
        public string? Comment { get; set; }
        public List<string>? MentorsId { get; set;}
    }
}
