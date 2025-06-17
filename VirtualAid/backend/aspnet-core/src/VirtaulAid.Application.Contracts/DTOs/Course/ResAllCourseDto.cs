using DocumentFormat.OpenXml.Office2010.ExcelAc;
using System;
using System.Collections.Generic;
using VirtaulAid.MultilingualObjects;


namespace VirtaulAid.DTOs.Course
{
    public class ResAllCourseDto : IObjectTranslation
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public int TotalNoOfHours { get; set; }
        public int NoOfModules { get; set; }
        public string ShortDescription { get; set; }
        public double Price { get; set; }
        public List<string> ExamTypes { get; set; }
        public string Language { get; set; }
    }
}
