using System;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Companies;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Users
{
    public class LoggedInUser : AuditedAggregateRoot<int>
    {
        public Guid? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail? UserDetail { get; set; }
        public Guid? CompanyId { get; set; }
        public virtual Company? Company { get; set; }
        public DateTime LoggedIn { get; set; }
        public DateTime? LoggedOut { get; set; }

    }
}
