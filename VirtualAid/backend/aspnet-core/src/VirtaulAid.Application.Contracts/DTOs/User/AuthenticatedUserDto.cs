using System.Collections.Generic;
using VirtaulAid.DTOs.Company;

namespace VirtaulAid.DTOs.User
{
    public class AuthenticatedUserDto
    {
        public string Email { get; set; }
        public List<UserRoleDto> Roles { get; set; }
        public string Token { get; set; }
        public UserDetailsDto UserDetails { get; set; }
        public CompanyDto Company { get; set; }
    }
}
