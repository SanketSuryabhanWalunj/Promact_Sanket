using VirtaulAid.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace VirtaulAid;

[DependsOn(
    typeof(VirtaulAidEntityFrameworkCoreTestModule)
    )]
public class VirtaulAidDomainTestModule : AbpModule
{

}
