using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VirtaulAid.Data;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.EntityFrameworkCore;

public class EntityFrameworkCoreVirtaulAidDbSchemaMigrator
    : IVirtaulAidDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreVirtaulAidDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolving the VirtaulAidDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<VirtaulAidDbContext>()
            .Database
            .MigrateAsync();
    }
}
