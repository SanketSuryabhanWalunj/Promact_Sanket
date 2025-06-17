namespace VirtaulAid.DTOs.Purchase
{
    public class ReqPurchaseCourseDetails
    {
        public string CourseId { get; set; }
        public string ExamType { get; set; }
        public string CourseName { get; set; }
        public string CourseDescription { get; set; }
        public double UnitAmount { get; set; }
        public string CurrencyType { get; set; }
        public int Quantity { get; set; }
        public string PlanType { get; set; }
    }
}
