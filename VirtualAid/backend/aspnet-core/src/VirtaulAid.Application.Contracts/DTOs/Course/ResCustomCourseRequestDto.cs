using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Course
{
    public class ResCustomCourseRequestDto
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public Guid CourseId { get; set; }
        public ResAllCourseDto Course { get; set; }
        public string ExamType { get; set; }
        public int NoOfCourses { get; set; }
        public string RequestMessage { get; set; }
        public bool IsFinished { get; set; }
        public string? Status { get; set; }
        public string? ContactNumber { get; set; }
    }
}
