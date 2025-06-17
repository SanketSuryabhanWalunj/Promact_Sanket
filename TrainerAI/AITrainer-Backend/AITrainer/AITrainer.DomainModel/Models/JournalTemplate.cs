namespace AITrainer.AITrainer.DomainModel.Models
{
    public class JournalTemplate
    {
        public string Id { get; set; }  
        public string TemplateName { get; set; }
        public string Data { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }

    }
}
