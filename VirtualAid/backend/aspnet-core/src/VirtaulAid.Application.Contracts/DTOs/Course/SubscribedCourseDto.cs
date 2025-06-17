using System.Collections.Generic;
using VirtaulAid.DTOs.User;

namespace VirtaulAid.DTOs.Course
{
    public class SubscribedCourseDto
    {
        public int CourseSubscriptionMappingId { get; set; }
        public ResCourseDetailDto ResCourseDetail { get; set; }
        public int TotalSubscriptionCount { get; set; }
        public int RemainingSubscriptionCount { get; set; }
        public ICollection<EmployeeDetailsDto> EmployeeDetails { get; set; }
    }
}
