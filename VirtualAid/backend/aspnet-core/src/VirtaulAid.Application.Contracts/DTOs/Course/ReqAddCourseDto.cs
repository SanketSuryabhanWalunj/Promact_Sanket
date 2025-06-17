using System.Collections.Generic;

namespace VirtaulAid.DTOs.Course
{
    public class ReqAddCourseDto
    {
        public string Name { get; set; }
        public string ShortDescription{ get; set; }
        public string Description { get; set; }
        public int TotalNoOfHours{ get; set; }
        public List<string> LearningOutcomes{ get; set; }
        public int NoOfModules{ get; set; }
        public double Price{ get; set; }
        public int ValidityInYears { get; set; }
        public List<string> ExamTypes { get; set; }
    }
}
