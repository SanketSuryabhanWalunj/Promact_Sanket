using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Employee
{
    public class TerminatedEmployee : FullAuditedAggregateRoot<Guid>
    {
        public Guid CompanyId { get; set; }
        public Guid UserId { get; set; }
        public DateTime? JoiningDate { get; set; }
        public DateTime TerminationDate { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeEmail { get; set; }
    }
}
