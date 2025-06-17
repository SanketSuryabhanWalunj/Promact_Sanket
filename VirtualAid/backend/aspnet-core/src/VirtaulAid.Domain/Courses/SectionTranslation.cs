using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Courses
{
    public class SectionTranslation : Entity, IObjectTranslation
    {
        public Guid SectionId { get; set; }
        public string Language { get; set; }
        public string? SectionTitle { get; set; }
        public string? SectionData { get; set; }

        public override object[] GetKeys()
        {
            return new object[] { SectionId, Language };
        }
    }
}
