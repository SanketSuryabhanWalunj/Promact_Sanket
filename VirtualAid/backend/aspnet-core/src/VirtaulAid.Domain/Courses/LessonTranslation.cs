using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Courses
{
    public class LessonTranslation : Entity, IObjectTranslation
    {
        public Guid LessonId { get; set; }
        public string Language { get; set; }

        public string Name { get; set; }

        public override object[] GetKeys()
        {
            return new object[] { LessonId, Language };
        }
    }
}
