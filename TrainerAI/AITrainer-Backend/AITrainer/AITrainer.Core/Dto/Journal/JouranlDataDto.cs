namespace AITrainer.AITrainer.Core.Dto.Journal
{
    public class JouranlDataDto
    {
        public string TopicId { get; set; }
        public string InternshipId { get; set; }
        public List<OptionData> Options { get; set; }
    }

    public class OptionData
    {
        public string TopicName { get; set; }
        public string Notes { get; set; }
        public string Description { get; set; }
    }
    public class JournalStatus
    {
        public bool isEvaluated { get; set; }
        public bool isPublished { get; set; }
    }
}
