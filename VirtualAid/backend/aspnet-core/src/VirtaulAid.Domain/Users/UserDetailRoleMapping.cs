using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Roles;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Users
{
    public class UserDetailRoleMapping : Entity<Guid>
    {
        public Guid RoleId { get; set; }
        public virtual Role Roledetail { get; set; }
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail User { get; set; }  
    }
}
