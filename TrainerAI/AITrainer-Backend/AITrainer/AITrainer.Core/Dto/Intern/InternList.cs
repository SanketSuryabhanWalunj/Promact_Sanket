using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Intern
{
    public class InternList
    {
        public string Id { get; set; } // Auto-incremented primary key
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? CareerPathId { get; set; }
        public CareerPath? CareerPath { get; set; }
        public string CreatedBy { get; set; }
        public string BatchName { get; set; }
        public string? MobileNumber { get; set; }
        public string? CollegeName { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public List<CourseInfo> InProgressCourses { get; set; } 
        public List<CourseInfo> UpcomingCourses { get; set; }
    }
    public class CourseInfo
    {
        public string courseId { get; set; }
        public string Name { get; set; }
        public int Duration { get; set; }
        public string DurationType { get; set; }
    }
}
