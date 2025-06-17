using System;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Purchase
{
    public class ReqPurchaseDto
    {
        [Required]
        public string TransactionId { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? UserId { get; set; }
        [Required]
        public Double ToatalAmount { get; set; }
        [Required]
        public string CurrencyType { get; set; }
        [Required]
        public string PayerEmail { get; set; }
    }
}
