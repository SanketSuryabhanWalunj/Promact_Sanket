using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Course
{
    public class ResFinishedCourseDto
    {
        public Guid CourseId {  get; set; }
        public string Name { get; set; }
        public string ExamType { get; set; }
        public string Percentage { get; set; }
    }
}
