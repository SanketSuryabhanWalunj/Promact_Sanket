using System;

namespace VirtaulAid.DTOs.Course
{
    public class CourseSubscriptionDto
    {

        public Guid? UserId { get; set; }
        public Guid? CompanysId { get; set; }
        public Guid CourseId { get; set; }
        public string ExamType { get; set; }
        public double TotalAmount { get; set; }
        public string PlanType { get; set; }
        public int TotalCount { get; set; }
        public int RemainingCount { get; set; }
        public Guid PayementId { get; set; }
        public DateTime PurchasedDate { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}
