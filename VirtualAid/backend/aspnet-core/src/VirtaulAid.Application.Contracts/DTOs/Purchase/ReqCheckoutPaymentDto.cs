using System.Collections.Generic;

namespace VirtaulAid.DTOs.Purchase
{
    public class ReqCheckoutPaymentDto
    {
        public string SuccessUrl { get; set; }
        public string CancelUrl { get; set; }
        public string PayerEmail { get; set; }
        public IList<ReqPurchaseCourseDetails> reqPurchaseCourseDetails {get ; set;}
    }
}
