using System;

namespace VirtaulAid.DTOs.User
{
    public class ResUserRoleDto
    {
        public Guid Id { get; set; }  
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
    }
}
