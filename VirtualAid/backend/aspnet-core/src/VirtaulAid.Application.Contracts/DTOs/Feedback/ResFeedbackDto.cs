using System;
using System.Collections.Generic;
using System.Text;
using VirtaulAid.Enums;

namespace VirtaulAid.DTOs.Feedback
{
    public class ResFeedbackDto
    {
        public Guid Id { get; set; }
        public string FeedbackProviderName { get; set; }
        public string FeedbackProviderEmail { get; set; }
        public string Message { get; set; }
        public List<string> ScreenShots { get; set; }
        public string Category { get; set; }
        public Guid? UserId { get; set; }
        public Guid? CompanyId { get; set; }
        public string Status { get; set; }
        public string Platform { get; set; }
        public DateTime FeedbackDate { get; set; }
    }
}
