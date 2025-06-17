using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Users
{
    public class UserCourseCompanyMapping : FullAuditedAggregateRoot<Guid>
    {
        public Guid? UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail? User { get; set; }
        public Guid? CompanyId { get; set; }
        public virtual Company? Company { get; set; }

        /// <summary>
        /// CourseId will never be null because this class will be used for course mapping either user or company.
        /// </summary>
        public Guid CourseId { get; set; }
        public virtual Course? Course { get; set; }
        public bool? IsActive { get; set; }

        public DateTime PurchaseDateTimeStamp { get; set; } = DateTime.UtcNow;
        public string PurchaseDate { get; set; } = DateTime.UtcNow.ToString("dd/MM/yyyy");
        public DateTime ExpirationDateTimeStamp { get; set; } = DateTime.UtcNow.AddYears(4);
        public string ExpirationDate { get; set;} = DateTime.UtcNow.AddYears(4).ToString("dd/MM/yyyy");

    }
}
