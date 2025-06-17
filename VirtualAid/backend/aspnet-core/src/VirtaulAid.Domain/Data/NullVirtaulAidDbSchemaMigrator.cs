using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Data;

/* This is used if database provider does't define
 * IVirtaulAidDbSchemaMigrator implementation.
 */
public class NullVirtaulAidDbSchemaMigrator : IVirtaulAidDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
