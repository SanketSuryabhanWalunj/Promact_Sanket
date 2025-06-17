namespace AITrainer.AITrainer.Core.Dto.JournalTemplate
{
    public class JournalTemplateDto
    {
        public string TemplateName { get; set; }
        public List<OptionDataDto> Options { get; set; }
    }

    public class OptionDataDto
    {
        public string TopicName { get; set; }
        public string Notes { get; set; }
        public string Description { get; set; }
    }
}
