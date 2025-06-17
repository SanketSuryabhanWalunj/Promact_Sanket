namespace LakePulse.DTOs
{
    public class ToolboxRecentPurchasesDto
    {
        public string? ItemSku { get; set; }
        public string? ItemLabel { get; set; }
        public string? UserEmail { get; set; }
        public string? UserName { get; set; }
        public string? Status { get; set; }
        public DateTime? PurchaseDateTime { get; set; }
    }
}
