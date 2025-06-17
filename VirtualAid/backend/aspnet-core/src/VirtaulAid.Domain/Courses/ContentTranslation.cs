using System;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Courses
{
    public class ContentTranslation : Entity, IObjectTranslation
    {
        public Guid ContentId { get; set; }
        public string Language { get; set; }
        public string? ContentTitle { get; set; }
        public string? ContentData { get; set; }

        public override object[] GetKeys()
        {
            return new object[] { ContentId, Language };
        }

    }
}
