using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Otps
{
    public class Otp : AuditedAggregateRoot<Guid>
    {
        public string EmailId { get; set; }
        public string OtpCode { get; set; }
        public string? VirtualRealityOtpCode { get; set; }
        public DateTime? VirtualRealityOtpCodeCreationTime { get; set; }
    }
}
