using AITrainer.AITrainer.Core.Dto.Intern;

namespace AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks
{
    public class BugsFeedbackInputModel
    {
      
        public List<string>? ReportedToId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public List<IFormFile>? Files { get; set; }
    }

    public class FeedbackWithImagesDTO
    {
        public string Id { get; set; }
        public string ReporterId { get; set; }
        public ReporterInfoDTO? ReporterInfo { get; set; }
        public List<AdminList>? Admins { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Comments { get; set; }
        public string? CommentedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public bool IsDeleted { get; set; }
        public string Status { get; set; }
        public List<AttachmentInfo> ImageUrls { get; set; }
    }
    public class AttachmentInfo
    {
        public string FileName { get; set; }
        public string Id { get; set; }
    }
    public class ReporterInfoDTO
    {
        public string ReporterId { get; set; }
        public string ReporterName { get; set; }
        public string ReporterEmail { get; set; }
        public string ReporterCareerPath { get; set; }
    }

}
