using System;

namespace VirtaulAid.DTOs.Purchase
{
    public class ResPurchaseDto
    {
        public Guid Id { get; set; }
        public string TransactionId { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? UserId { get; set; }
        public Double ToatalAmount { get; set; }
        public string CurrencyType { get; set; }
        public string PayerEmail { get; set; }
        public string InvoiceId { get; set; }
        public string InvoiceMasterLink { get; set; }
        public string InvoicePdfLink { get; set; }
        public DateTime PurchaseDate { get; set; }
    }
}
