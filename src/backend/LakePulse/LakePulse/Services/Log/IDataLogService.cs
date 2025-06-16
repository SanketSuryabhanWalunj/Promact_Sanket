using LakePulse.Models;

namespace LakePulse.Services.Log
{
    public interface IDataLogService
    {
        /// <summary>
        /// Adds a list of log data entries to the data log.
        /// </summary>
        /// <param name="logs">A list of DataHubEditLog objects to be added.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        Task AddLogData(List<DataHubEditLog> logs);
    }
}
