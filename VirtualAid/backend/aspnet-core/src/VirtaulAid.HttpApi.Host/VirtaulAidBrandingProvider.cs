using Volo.Abp.DependencyInjection;
using Volo.Abp.Ui.Branding;

namespace VirtaulAid;

[Dependency(ReplaceServices = true)]
public class VirtaulAidBrandingProvider : DefaultBrandingProvider
{
    public override string AppName => "VirtaulAid";
}
