using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Carts;
using VirtaulAid.Courses;
using VirtaulAid.Purchases;
using VirtaulAid.Users;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Companies
{
    public class Company : FullAuditedAggregateRoot<Guid>
    {
        public string CompanyName { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }
        public string? Postalcode { get; set; }
        public bool? IsVerified { get; set; }
        public bool IsLocked { get; set; } = false;
        public string? ProfileImage { get; set; }
        public string? BannerImage { get; set; }
        public string? Slogan { get; set; }
        public string? Bio { get; set; }
        public int? NoOfEmployees { get; set; }
        public bool? PublishData { get; set; } = false;
        public virtual ICollection<Cart>? Carts { get; set; }
        public virtual ICollection<PurchaseDetail>? PurchaseDetails { get; set; }
        public virtual ICollection<UserDetail>? Employees { get; set; }
        public virtual ICollection<CourseSubscriptionMapping>? CourseSubscriptionMappings { get; set; }
        public virtual ICollection<LoggedInUser>? LoggedInUsers { get; set; }

    }
}
