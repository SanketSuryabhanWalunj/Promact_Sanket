namespace AITrainer.AITrainer.Core.Dto.Notification
{
    public class NotificationModel
    {
        public string? InternFirstName { get; set; }
        public string? InternLastName { get; set; }
        public string EmailId { get; set; }
        public string CourseName { get; set; }
        public int? CourseDuration { get; set; }
        public string? SubmissionName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? MentorNames { get; set; }
        public int? SubmissionCount { get; set; }
        public DateTime? SubmissionDate { get; set; }
    }

    public class AcknowledgmentModel
    {
        public string AcknowledgedByName { get; set; }
        public string EmailId { get; set; }
        public string CourseName { get; set; }
        public string ReceiverFirstName { get; set; }
    }

}
