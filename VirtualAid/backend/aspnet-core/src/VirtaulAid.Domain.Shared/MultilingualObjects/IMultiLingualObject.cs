using System.Collections.Generic;

namespace VirtaulAid.MultilingualObjects
{
    public interface IMultiLingualObject<TTranslation> 
        where TTranslation : class, IObjectTranslation
    {
        ICollection<TTranslation> Translations { get; set; }
    }
}
