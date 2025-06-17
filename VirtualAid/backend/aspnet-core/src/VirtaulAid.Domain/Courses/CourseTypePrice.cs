using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Courses
{
    public class CourseTypePrice : AuditedAggregateRoot<int>
    {
        public string Name { get; set; }
        public double Price { get; set; }
    }
}
