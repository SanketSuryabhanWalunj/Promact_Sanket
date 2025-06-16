using LakePulse.DTOs.Alert;
using LakePulse.Models;

namespace LakePulse.Services.Alert
{
    public interface IAlertService
    {
        #region Public Methods
        /// <summary>
        /// Gets all alert categories.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of alert categories.</returns>
        Task<List<AlertCategorie>> GetAllAlertCategoriesAsync();

        /// <summary>
        /// Gets all alert levels.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of alert levels.</returns>
        Task<List<AlertLevel>> GetAllAlertLevelsAsync();

        /// <summary>  
        /// Adds an alert to field notes.  
        /// </summary>  
        /// <param name="alertRequestDto">The alert request data transfer object containing alert details.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        Task AddAlertInFieldNotesAsync(AlertRequestDto alertRequestDto);

        /// <summary>
        /// Gets critical alerts analysis with pagination for a specific lake.
        /// </summary>
        /// <param name="lakeId">The ID of the lake to filter alerts for.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a tuple with the list of critical alerts and total count.</returns>
        Task<(List<FieldNote> Alerts, int TotalCount)> GetCriticalAlertsAsync(string lakeId, int pageNumber, int pageSize);

        /// <summary>
        /// Deletes a critical alert by its ID.
        /// </summary>
        /// <param name="alertId">The ID of the critical alert to delete.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a string message indicating the result of the operation.</returns>
        Task<string> DeleteCriticalAlertAsync(Guid alertId);

        /// <summary>
        /// Adds or updates user alert preferences including level preferences, category preferences, and notification settings.
        /// </summary>
        /// <param name="preferencesRequestDto">The DTO containing user alert preferences including level preferences, category preferences, and notification settings.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task AddUserAlertPreferencesAsync(PreferencesRequestDto preferencesRequestDto);

        /// <summary>
        /// Gets user alert preferences by userId.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the user preferences DTO.</returns>
        Task<PreferencesRequestDto?> GetUserAlertPreferencesAsync(string userId);

        /// <summary>
        /// Gets the latest alert logs with pagination.
        /// </summary>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a tuple with the list of alert logs and total count.</returns>
        Task<(List<AlertLog> Alerts, int TotalCount)> GetLatestAlertLogsAsync(int pageNumber, int pageSize);
        #endregion
    }
} 