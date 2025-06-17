using Volo.Abp.Modularity;

namespace VirtaulAid;

[DependsOn(
    typeof(VirtaulAidApplicationModule),
    typeof(VirtaulAidDomainTestModule)
    )]
public class VirtaulAidApplicationTestModule : AbpModule
{

}
