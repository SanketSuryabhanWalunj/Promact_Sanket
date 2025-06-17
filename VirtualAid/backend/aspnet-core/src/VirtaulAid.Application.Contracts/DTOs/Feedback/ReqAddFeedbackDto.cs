using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Feedback
{
    public class ReqAddFeedbackDto
    {
        public string Message { get; set; }
        public string Category { get; set; }
        public Guid? UserId { get; set; }
        public Guid? CompanyId { get; set; }
        public string Platform { get; set; }
        public IFormFileCollection? FormFiles { get; set; }
    }
}
