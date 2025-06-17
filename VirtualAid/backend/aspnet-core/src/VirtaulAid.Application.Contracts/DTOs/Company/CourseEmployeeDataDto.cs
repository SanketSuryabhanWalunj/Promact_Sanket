using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Company
{
    public class CourseEmployeeDataDto
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; }
        public string ExamType { get; set; }
        public int NoOfEmployees { get; set; }
    }
}
