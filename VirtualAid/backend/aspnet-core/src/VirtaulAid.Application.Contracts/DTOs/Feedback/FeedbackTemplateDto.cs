using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Feedback
{
    public class FeedbackTemplateDto
    {
        public string FeedbackProviderName { get; set; }
        public string FeedbackProviderEmail { get; set; }
        public string ScreenShots { get; set; }
        public string Message { get; set; }
        public string Status { get; set; }
        public string Platform { get; set; }
        public DateTime FeedbackDate { get; set; }
    }
}
