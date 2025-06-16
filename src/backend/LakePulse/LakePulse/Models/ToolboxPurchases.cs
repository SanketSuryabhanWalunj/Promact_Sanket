using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("toolbox_purchases")]
    public class ToolboxPurchases
    {
        [Key]
        public int lp_trans_no { get; set; }
        public string? vendor_trans_id { get; set; }
        public string? vendor_id { get; set; }
        public DateTime? purchase_datetime { get; set; }
        public string? item_sku { get; set; }
        public string? item_label { get; set; }
        public string? user_email { get; set; }
        public decimal? price { get; set; }
        public string status { get; set; } = "Purchased";
        public DateTime? registration_datetime { get; set; }
        public string? vendor_device_id { get; set; }
        public string? location_id { get; set; }
        public int? lakepulse_id { get; set; }
        public string? api_key { get; set; }
        public DateTime? last_data_collected { get; set; }
    }
}
