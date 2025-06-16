namespace LakePulse.DTOs
{
    public class SuperAdminUserDto
    {
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? FamilyName { get; set; }
        public string? Email { get; set; }
        public bool Subscription { get; set; } = false;
        public string? Role { get; set; }      
        public string? LakeName { get; set; }      
        public DateTime LastModifiedDate { get; set; }
    }
}
