using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

namespace VirtaulAid.Exams
{
    public class ExamDetailTranslation : Entity, IObjectTranslation
    {

        public int ExamDetailId { get; set; }
        public string Language { get; set; }
        public string ExamName { get; set; }
        public override object[] GetKeys()
        {
            return new object[] { ExamDetailId, Language };
        }
    }
}
