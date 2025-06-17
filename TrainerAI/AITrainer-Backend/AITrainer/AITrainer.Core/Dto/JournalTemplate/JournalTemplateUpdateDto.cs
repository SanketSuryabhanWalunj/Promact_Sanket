namespace AITrainer.AITrainer.Core.Dto.JournalTemplate
{
    public class JournalTemplateUpdateDto
    {
        public string Id { get; set; }
        public string TemplateName { get; set; }
        public List<OptionsData> Options { get; set; }
    }

    public class OptionsData
    {
        public string TopicName { get; set; }
        public string Notes { get; set; }
        public string Description { get; set; }
    }
}
