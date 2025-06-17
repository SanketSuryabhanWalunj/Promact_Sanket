using System;
using VirtaulAid.MultilingualObjects;
using Volo.Abp.Domain.Entities;

public class ModuleTranslation : Entity, IObjectTranslation
{
    public Guid ModuleId { get; set; }
    public string Language { get; set; }

    public string Name { get; set; }

    public override object[] GetKeys()
    {
        return new object[] { ModuleId, Language };
    }
}
