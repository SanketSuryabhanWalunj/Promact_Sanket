using System;

namespace VirtaulAid.DTOs.Admin
{
    public class UserListDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int NoOfCoursesEnrolled { get; set; }
        public double Progress { get; set; }
        public string Country { get; set; }
        public string ProfileImage { get; set; }
        public bool IsDeleted { get; set; }
        public string Company { get; set; }
        public bool ConsentToShareData { get; set; } 
        public bool IsVerified { get; set; }
    }
}
