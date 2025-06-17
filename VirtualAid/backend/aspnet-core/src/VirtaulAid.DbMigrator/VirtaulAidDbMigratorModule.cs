using VirtaulAid.EntityFrameworkCore;
using Volo.Abp.Autofac;
using Volo.Abp.Modularity;

namespace VirtaulAid.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(VirtaulAidEntityFrameworkCoreModule),
    typeof(VirtaulAidApplicationContractsModule)
    )]
public class VirtaulAidDbMigratorModule : AbpModule
{
}
