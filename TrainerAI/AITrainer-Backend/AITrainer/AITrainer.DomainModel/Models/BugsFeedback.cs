namespace AITrainer.AITrainer.DomainModel.Models
{
    public class BugsFeedback
    {
        public string Id { get; set; }
        public string ReporterId { get; set; }
        public List<string>? ReportedToId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Comments { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string Status { get; set; }
        public List<DocumentAttachment>? Attachments { get; set; } = new List<DocumentAttachment>();
    }
    public class DocumentAttachment
    {
        public string Id { get; set; }
        public string FileName { get; set; }
        public byte[] FileData { get; set; }
        public string? Description { get; set; }
        public bool IsDeleted { get; set; } = false;
        public BugsFeedback BugsFeedback { get; set; }
        public string BugsFeedbackId { get; set; }
    }

}
