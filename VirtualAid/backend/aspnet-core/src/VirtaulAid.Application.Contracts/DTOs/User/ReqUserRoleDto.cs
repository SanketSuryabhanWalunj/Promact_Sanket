using System;

namespace VirtaulAid.DTOs.User
{
    public class ReqUserRoleDto
    {
        public Guid RoleId { get; set; }
        public Guid UserId { get; set; }
    }
}
