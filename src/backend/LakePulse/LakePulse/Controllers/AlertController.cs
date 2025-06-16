using Microsoft.AspNetCore.Mvc;
using LakePulse.Services.Alert;
using LakePulse.Models;
using Microsoft.AspNetCore.Authorization;
using LakePulse.DTOs.Alert;
using LakePulse.Data;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
    [Authorize(Roles = "Super Admin, Admin, User")]
    [Route("api/alert")]
    [ApiController]
    public class AlertController : ControllerBase
    {
        #region Private Fields
        private readonly IAlertService _alertService;
        #endregion

        #region Constructor
        public AlertController(IAlertService alertService)
        {
            _alertService = alertService;
        }
        #endregion

        #region Public Methods
        /// <summary>
        /// Gets all alert categories.
        /// </summary>
        /// <returns>A list of alert categories.</returns>
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllAlertCategoriesAsync()
        {
            List<AlertCategorie> categories = await _alertService.GetAllAlertCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Gets all alert levels.
        /// </summary>
        /// <returns>A list of alert levels.</returns>
        [HttpGet("levels")]
        public async Task<IActionResult> GetAllAlertLevelsAsync()
        {
            List<AlertLevel> levels = await _alertService.GetAllAlertLevelsAsync();
            return Ok(levels);
        }

        /// <summary>  
        /// Adds an alert to field notes if the field note is selected.  
        /// </summary>  
        /// <param name="alertRequestDto">The alert request data transfer object containing alert details.</param>  
        /// <returns>An IActionResult indicating the result of the operation.</returns>  
        [HttpPost("alert")]
        public async Task<IActionResult> AddAlertInFieldNotesAsync(AlertRequestDto alertRequestDto)
        {
            await _alertService.AddAlertInFieldNotesAsync(alertRequestDto);
            return Ok(StringConstant.alertSendSuccessfully);
        }

        /// <summary>
        /// Gets critical alerts analysis with pagination for a specific lake.
        /// </summary>
        /// <param name="lakeId">The ID of the lake to filter alerts for.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A paginated list of critical alerts with total count for the specified lake.</returns>
        [HttpGet("critical-alerts")]
        public async Task<IActionResult> GetCriticalAlertsAsync([Required] string lakeId, [Required] int pageNumber, [Required] int pageSize)
        {
            if (pageNumber < 1)
            {
                return BadRequest(StringConstant.invalidPageNumber);
            }

            if (pageSize < 1)
            {
                return BadRequest(StringConstant.invalidPageSize);
            }

            (List<FieldNote> alerts, int totalCount) = await _alertService.GetCriticalAlertsAsync(lakeId, pageNumber, pageSize);
            var response = new
            {
                Alerts = alerts,
                TotalCount = totalCount,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
            return Ok(response);
        }

        /// <summary>
        /// Deletes a critical alert by its ID.
        /// </summary>
        /// <param name="alertId">The ID of the critical alert to delete.</param>
        /// <returns>A response indicating the result of the delete operation.</returns>
        [HttpDelete("critical-alerts/{alertId}")]
        public async Task<IActionResult> DeleteCriticalAlertAsync(Guid alertId)
        {
            string result = await _alertService.DeleteCriticalAlertAsync(alertId);
            if (result == StringConstant.criticalAlertNotFound)
            {
                return NotFound(new { message = result });
            }
            return Ok(new { message = result });
        }

        /// <summary>  
        /// Adds or updates user alert preferences including level preferences, category preferences, and notification settings.  
        /// </summary>  
        /// <param name="preferencesRequestDto">The DTO containing user alert preferences including level preferences, category preferences, and notification settings.</param>  
        /// <returns>An IActionResult indicating the result of the operation.</returns>  
        [HttpPost("preferences")]
        public async Task<IActionResult> AddUserAlertPreferencesAsync(PreferencesRequestDto preferencesRequestDto)
        {
            try
            {
                await _alertService.AddUserAlertPreferencesAsync(preferencesRequestDto);
                return Ok(new { message = StringConstant.alertPreferencesUpdated });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Gets user alert preferences by userId.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The user preferences DTO.</returns>
        [HttpGet("preferences/{userId}")]
        public async Task<IActionResult> GetUserAlertPreferencesAsync(string userId)
        {
            PreferencesRequestDto? preferences = await _alertService.GetUserAlertPreferencesAsync(userId);
            if (preferences == null)
                return NotFound(new { message = StringConstant.userPreferencesNotFound });
            return Ok(preferences);
        }

        /// <summary>
        /// Gets the latest alert logs with pagination.
        /// </summary>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A paginated list of alert logs with total count.</returns>
        [HttpGet("logs")]
        public async Task<IActionResult> GetAlerLogsAsync(int pageNumber, int pageSize)
        {
            (List<AlertLog> Alerts, int TotalCount) alertLogs = await _alertService.GetLatestAlertLogsAsync(pageNumber, pageSize);
            var response = new
            {
                Alerts = alertLogs.Alerts,
                TotalCount = alertLogs.TotalCount,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(alertLogs.TotalCount / (double)pageSize)
            };
            return Ok(response);
        }
        #endregion
    }
}
