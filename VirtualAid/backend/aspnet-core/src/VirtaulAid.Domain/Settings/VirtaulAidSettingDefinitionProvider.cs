using Volo.Abp.Settings;

namespace VirtaulAid.Settings;

public class VirtaulAidSettingDefinitionProvider : SettingDefinitionProvider
{
    public override void Define(ISettingDefinitionContext context)
    {
        //Define your own settings here. Example:
        //context.Add(new SettingDefinition(VirtaulAidSettings.MySetting1));
    }
}
