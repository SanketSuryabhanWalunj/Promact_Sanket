namespace AITrainer.AITrainer.Core.Dto.Topics
{
    public class TopicDto
    {
        public string TopicName {get; set;}  
        public int QuizCount { get; set;}
    }
    public class TopicRearrangeDto
    {
        public string Id { get; set; }
        public int index { get; set; }
    }
}
