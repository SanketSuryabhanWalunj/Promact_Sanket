using AITrainer.AITrainer.Core.Dto.JournalTemplate;

namespace AITrainer.AITrainer.Core.Dto.BehaviouralTemplate
{
    public class CreateBehaviouralTemplateDto
    {
        public string TemplateName { get; set; }
        public string? Description { get; set; }
        public List<TemplateCategories> Options { get; set; }

    }
    public class TemplateCategories
    {
        public string CategoryName { get; set; }
        public double TotalMarks { get; set; }
    }
}
