using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Exams
{
    public class QuestionOptionTranslation : Entity, IObjectTranslation
    {
        public int QuestionOptionId { get; set; }
        public string Language { get; set; }
        public string OptionText { get; set; }
        public override object[] GetKeys()
        {
            return new object[] { QuestionOptionId, Language };
        }
    }
}
