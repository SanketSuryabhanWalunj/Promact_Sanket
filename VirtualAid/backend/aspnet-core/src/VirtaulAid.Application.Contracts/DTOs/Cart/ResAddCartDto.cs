using System;
using VirtaulAid.DTOs.Course;

namespace VirtaulAid.DTOs.Cart
{
    public class ResAddCartDto
    {
        public Guid Id { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? UserId { get; set; }
        public Guid CourseId { get; set; }
        public string ExamType { get; set; }
        public ResCourseDetailDto? CourseDetails { get; set; }
        public int CourseCount { get; set; }
    }
}
