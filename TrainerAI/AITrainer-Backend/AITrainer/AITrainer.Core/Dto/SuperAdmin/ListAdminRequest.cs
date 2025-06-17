namespace AITrainer.AITrainer.Core.Dto.SuperAdmin
{
    public class ListAdminRequest
    {
        public int CurrentPage { get; set; }
        public int DefualtList { get; set; }
        public string? RoleType { get; set; }
        public string? OrganizationId { get; set; }
        public string? TechStacks { get; set; }
    }
}
