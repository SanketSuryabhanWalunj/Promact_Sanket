using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Feedback
{
    public class ResUpdateFeedbackStatusDto
    {
        public Guid Id { get; set; }
        public string FeedbackProviderName { get; set; }
        public string FeedbackProviderEmail { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
    }
}
