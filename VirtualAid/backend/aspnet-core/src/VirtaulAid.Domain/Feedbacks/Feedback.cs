using Amazon.S3.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Enums;
using Volo.Abp.Domain.Entities.Auditing;



namespace VirtaulAid.Feedbacks
{
    public class Feedback : FullAuditedAggregateRoot<Guid>
    {
        public string FeedbackProviderName { get; set; }
        public string FeedbackProviderEmail { get; set; }
        public string Message { get; set; }
        public List<string>? ScreenShots { get; set; }
        public string Category { get; set; }
        public Guid? UserId { get; set; }
        public Guid? CompanyId { get; set; }
        public string Status { get; set; } = FeedbackStatus.ToDo.ToString();
        public string Platform { get; set; }
        public DateTime FeedbackDate { get; set; } = DateTime.Now.Date;
    }
}
