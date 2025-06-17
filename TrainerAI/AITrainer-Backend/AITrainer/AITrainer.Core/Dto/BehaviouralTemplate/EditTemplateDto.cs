namespace AITrainer.AITrainer.Core.Dto.BehaviouralTemplate
{
    public class EditTemplateDto
    {
        public string Id { get; set; }
        public string TemplateName { get; set; }
        public List<BehaviouralCategoryDto> Options { get; set; }
    }

    public class BehaviouralCategoryDto
    {
        public string? Id { get; set; }
        public string CategoryName { get; set; }
        public double TotalMarks { get; set; }
    }
}

