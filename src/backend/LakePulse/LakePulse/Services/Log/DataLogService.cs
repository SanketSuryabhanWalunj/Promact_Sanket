using LakePulse.Data;
using LakePulse.Models;

namespace LakePulse.Services.Log
{
    public class DataLogService : IDataLogService 
    {
        private readonly ApplicationDbContext _context;
        public DataLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Logs the data edit operation.
        /// </summary>
        /// <param name="logs">The data logs entry to be added.</param>
        public async Task AddLogData(List<DataHubEditLog> logs)
        {
            try
            {
                logs.ForEach(x => x.CreatedTime = DateTime.UtcNow);
                    
               await _context.DataHubEditLogs.AddRangeAsync(logs);
               await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(StringConstant.errorLoggingData, ex);
            }
        }
    }
}
