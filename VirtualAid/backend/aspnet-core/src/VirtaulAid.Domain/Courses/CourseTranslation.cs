using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Courses
{
    public class CourseTranslation : Entity, IObjectTranslation
    {
        public Guid CourseId { get; set; }
        public string Language { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ShortDescription { get; set; }
        public List<string> LearningOutcomes { get; set; }
        public List<string> ExamTypes { get; set; }

        public override object[] GetKeys()
        {
            return new object[] { CourseId, Language };
        }
    }
}
