using System;

namespace VirtaulAid.DTOs.Admin
{
    public class CoursePurchasedByCompanyDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Guid CourseId { get; set; }
        public string? ExamType { get; set; }
        public double Price { get; set; }
        public int PurchasedAmount { get; set; }
        public int EnrolledAmount { get; set; }
        public DateTime PurchasedDate { get; set; }
        public DateTime ExpirationDate { get; set; }
        public string Language { get; set; }
    }
}
