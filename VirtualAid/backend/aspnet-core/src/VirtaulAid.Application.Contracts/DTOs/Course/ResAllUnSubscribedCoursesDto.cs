using System;

namespace VirtaulAid.DTOs.Course
{
    public class ResAllUnSubscribedCoursesDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int TotalNoOfHours { get; set; }
        public int NoOfModules { get; set; }
        public string ShortDescription { get; set; }
        public double Price { get; set; }
        public int ValidityInYears { get; set; }
        public string Language { get; set; }
    }
}
