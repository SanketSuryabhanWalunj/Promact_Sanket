namespace LakePulse.DTOs
{
    public class ToolboxOrderDto
    {
        public int Id { get; set; } 
        public string? OrderId { get; set; }
        public string? Product { get; set; }
        public string? Status { get; set; }
        public string? ProductSKU { get; set; }
        public int? LakePulseId { get; set; }
        public DateTime PurchaseDateTime { get; set; }
    }
}
