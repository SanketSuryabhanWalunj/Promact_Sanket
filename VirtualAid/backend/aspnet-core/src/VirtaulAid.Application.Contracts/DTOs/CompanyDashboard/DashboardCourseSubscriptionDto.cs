using System;

namespace VirtaulAid.DTOs.CompanyDashboard
{
    public class DashboardCourseSubscriptionDto
    {      
        public int Id { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid CourseId { get; set; }     
        public int TotalCount { get; set; }
        public int RemainingCount { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}
