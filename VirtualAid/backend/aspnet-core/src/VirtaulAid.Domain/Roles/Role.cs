using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Users;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Roles
{
    public class Role : FullAuditedAggregateRoot<Guid>
    {
        public string Name { get; set; }
        public virtual ICollection<UserDetailRoleMapping> UserDetailRoleMappings { get; set; }
    }
}
