using System.Threading.Tasks;

namespace VirtaulAid.Data;

public interface IVirtaulAidDbSchemaMigrator
{
    Task MigrateAsync();
}
