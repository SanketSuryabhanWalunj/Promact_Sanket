using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("LakeSubscription")]
    public class LakeSubscription: AuditableEntity
    {
        [Key]
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string? CustomerEmail { get; set; }
        public string LakeId { get; set; }
        public string? OrderId { get; set; }
        public string? TotalPrice { get; set; }
        public string? Currency { get; set; }
        public string? ProductId { get; set; }
        public string? VariantId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductPrice { get; set; }
        public DateTime SubscriptionEndDate { get; set; }
    }
}
