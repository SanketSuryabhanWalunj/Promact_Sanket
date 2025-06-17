using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.PackagePlans
{
    public class PackagePlan : FullAuditedAggregateRoot<Guid>
    {
        public Guid PackagePlanId { get; set; }
        public string Name { get; set; }
        public int MaxNoOfCourses { get; set; }
        public int MinNoOfCourses { get; set; }
    }
}
