using System;
using VirtaulAid.Companies;
using VirtaulAid.Users;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Purchases
{
    public class PurchaseDetail : FullAuditedAggregateRoot<Guid>
    {
        public string TransactionId { get; set; }
        public Guid? CompanyId { get; set; }
        public virtual Company? Company { get; set; }
        public Guid? UserId { get; set; }
        public virtual UserDetail? User { get; set; }
        public Double ToatalAmount { get; set; }
        public string CurrencyType { get; set; }
        public string PayerEmail { get; set; }
        public string InvoiceId { get; set; }
        public string InvoiceMasterLink { get; set; }
        public string InvoicePdfLink { get; set; }
        public DateTime PurchaseDate { get; set; }
    }
}