using LakePulse.Data;
using LakePulse.DTOs.Alert;
using LakePulse.Models;
using LakePulse.Services.Common;
using LakePulse.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace LakePulse.Services.Alert
{
    public class AlertService : IAlertService
    {
        #region Private Fields
        private readonly ApplicationDbContext _context;
        private readonly ICommonService _commonService;
        private readonly ILogger<AlertService> _logger;
        private readonly IEmailService _alertEmailService;
        private readonly IConfiguration _configuration;
        #endregion

        #region Constructor
        public AlertService(
            ApplicationDbContext context,
            ILogger<AlertService> logger,
            ICommonService commonService,
            IEmailService alertEmailService,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _commonService = commonService;
            _alertEmailService = alertEmailService;
            _configuration = configuration;
        }
        #endregion

        #region Public Methods
        /// <summary>
        /// Gets all alert categories.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of alert categories.</returns>
        public async Task<List<AlertCategorie>> GetAllAlertCategoriesAsync()
        {
            try
            {
                return await _context.AlertCategories.ToListAsync();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw new Exception(StringConstant.internalServerError, ex);
            }
        }

        /// <summary>
        /// Gets all alert levels.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of alert levels.</returns>
        public async Task<List<AlertLevel>> GetAllAlertLevelsAsync()
        {
            try
            {
                return await _context.AlertLevels.ToListAsync();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw new Exception(StringConstant.internalServerError, ex);
            }
        }

        /// <summary>  
        /// Adds an alert to the field notes and sends email notifications to subscribed users.  
        /// </summary>  
        /// <param name="alertRequestDto">The DTO containing alert details to be added.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        public async Task AddAlertInFieldNotesAsync(AlertRequestDto alertRequestDto)
        {
            try
            {
                if (alertRequestDto.IsFieldNoteSelected)
                {
                    // Create and save the field note
                    FieldNote fieldNote = new FieldNote
                    {
                        UserId = alertRequestDto.UserId,
                        LakeId = alertRequestDto.LakeId,
                        UserName = alertRequestDto.UserName,
                        Note = alertRequestDto.AlertText,
                        AlertLevelId = alertRequestDto.AlertLevelId,
                        AlertCategorieId = alertRequestDto.AlertCategorieId,
                        IsAlert = true,
                        CreatedBy = alertRequestDto.UserName ?? StringConstant.system,
                    };

                    await _context.FieldNotes.AddAsync(fieldNote);
                }

                AlertLog alertLog = new AlertLog
                {
                    UserId = alertRequestDto.UserId,
                    LakePulseId = Int32.Parse(alertRequestDto.LakeId?? "0"),
                    LevelId = alertRequestDto.AlertLevelId ?? 0,
                    CategoryId = alertRequestDto.AlertCategorieId ?? 0,
                    AlertText = alertRequestDto.AlertText,
                    CreatedBy = alertRequestDto.UserName ?? StringConstant.system,
                    CreatedTime = DateTime.UtcNow
                };
                await _context.AlertLogs.AddAsync(alertLog);
                await _context.SaveChangesAsync();

                // Get users associated with the lake
                List<UserLake> userLakes = await _context.UserLakes
                    .Where(ul => ul.LakeId == alertRequestDto.LakeId)
                    .ToListAsync();

                if (!userLakes.Any())
                {
                    return;
                }

                // Get alert preferences for all users
                List<string> userIds = userLakes.Select(ul => ul.UserId).ToList();
                List<AlertPreference> alertPreferences = await _context.AlertPreferences
                    .Where(ap => userIds.Contains(ap.UserId) && ap.SendEmail)
                    .ToListAsync();

                List<AlertPreferencesLevel> levelPreferences = await _context.AlertPreferencesLevels
                    .Where(pl => userIds.Contains(pl.UserId) && pl.Selected && pl.LevelId == alertRequestDto.AlertLevelId)
                    .ToListAsync();

                List<AlertPreferencesCategorie> categoryPreferences = await _context.AlertPreferencesCategories
                    .Where(pc => userIds.Contains(pc.UserId) && pc.Selected && pc.CategoryId == alertRequestDto.AlertCategorieId)
                    .ToListAsync();

                // Filter users who should receive the alert based on their preferences
                List<string?> usersToNotify = alertPreferences
                    .Where(ap => levelPreferences.Any(lp => lp.UserId == ap.UserId) &&
                                categoryPreferences.Any(cp => cp.UserId == ap.UserId))
                    .Select(ap => ap.UserEmail)
                    .Where(email => !string.IsNullOrEmpty(email))
                    .ToList();

                if (usersToNotify.Any())
                {
                    string lakeName = await _commonService.GetLakeNameByLakePulseId(alertRequestDto.LakeId) ?? StringConstant.unknownLake;
                    string? alertLevel = await _context.AlertLevels
                .Where(al => al.Id == alertRequestDto.AlertLevelId)
                .Select(al => al.LevelLabel)
                .FirstOrDefaultAsync();
                    string emailBody = GetAlertEmailBody(alertRequestDto, lakeName, alertLevel);
                    string emailSubject = StringConstant.lakePulse + " " + alertLevel;
                    await _alertEmailService.SendAlertEmailAsync(usersToNotify, emailBody, emailSubject);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorAlertAddAndEmailNotifications);
                throw;
            }
        }

        /// <summary>
        /// Gets critical alerts analysis with pagination for a specific lake.
        /// </summary>
        /// <param name="lakeId">The ID of the lake to filter alerts for.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a tuple with the list of critical alerts and total count.</returns>
        public async Task<(List<FieldNote> Alerts, int TotalCount)> GetCriticalAlertsAsync(string lakeId, int pageNumber, int pageSize)
        {
            try
            {
                // Get total count of critical alerts for the specific lake
                int totalCount = await _context.FieldNotes
                    .Where(x => x.IsAlert && x.AlertLevelId == 3 && x.LakeId == lakeId)
                    .CountAsync();

                // Get paginated critical alerts with related data for the specific lake
                var criticalAlerts = await _context.FieldNotes
                    .Where(x => x.IsAlert && x.AlertLevelId == 3 && x.LakeId == lakeId)
                    .OrderByDescending(x => x.CreatedTime)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (criticalAlerts, totalCount);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw new Exception(StringConstant.internalServerError, ex);
            }
        }

        /// <summary>
        /// Deletes a critical alert by its ID.
        /// </summary>
        /// <param name="alertId">The ID of the critical alert to delete.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a string message indicating the result of the operation.</returns>
        public async Task<string> DeleteCriticalAlertAsync(Guid alertId)
        {
            try
            {
                var alert = await _context.FieldNotes
                    .FirstOrDefaultAsync(x => x.Id == alertId && x.IsAlert && x.AlertLevelId == 3);

                if (alert == null)
                {
                    return StringConstant.criticalAlertNotFound;
                }

                _context.FieldNotes.Remove(alert);
                await _context.SaveChangesAsync();
                return StringConstant.criticalAlertDeleted;
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorDeletingCriticalAlert);
                throw new Exception(StringConstant.errorDeletingCriticalAlert, ex);
            }
        }

        /// <summary>
        /// Adds or updates user alert preferences including level preferences, category preferences, and notification settings.
        /// </summary>
        /// <param name="preferencesRequestDto">The DTO containing user alert preferences including level preferences, category preferences, and notification settings.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task AddUserAlertPreferencesAsync(PreferencesRequestDto preferencesRequestDto)
        {
            try
            {
                // Get all existing preferences in one query
                List<AlertPreferencesLevel> existingLevelPrefs = await _context.AlertPreferencesLevels
                    .Where(x => x.UserId == preferencesRequestDto.UserId)
                    .ToListAsync();

                List<AlertPreferencesCategorie> existingCategoryPrefs = await _context.AlertPreferencesCategories
                    .Where(x => x.UserId == preferencesRequestDto.UserId)
                    .ToListAsync();

                AlertPreference? existingPreference = await _context.AlertPreferences
                    .FirstOrDefaultAsync(x => x.UserId == preferencesRequestDto.UserId);

                // Handle level preferences
                if (preferencesRequestDto.LevelPreferences != null)
                {
                    foreach (PreferencesIdValue levelPref in preferencesRequestDto.LevelPreferences)
                    {
                        AlertPreferencesLevel? existingLevelPref = existingLevelPrefs
                            .FirstOrDefault(x => x.LevelId == levelPref.Id);

                        if (existingLevelPref != null)
                        {
                            // Update existing preference
                            existingLevelPref.Selected = levelPref.IsSelected;
                        }
                        else
                        {
                            // Add new preference
                            AlertPreferencesLevel newLevelPref = new AlertPreferencesLevel
                            {
                                UserId = preferencesRequestDto.UserId,
                                LevelId = levelPref.Id,
                                Selected = levelPref.IsSelected
                            };
                            _context.AlertPreferencesLevels.Add(newLevelPref);
                        }
                    }
                }

                // Handle category preferences
                if (preferencesRequestDto.CategoriePreferences != null)
                {
                    foreach (PreferencesIdValue categoryPref in preferencesRequestDto.CategoriePreferences)
                    {
                        AlertPreferencesCategorie? existingCategoryPref = existingCategoryPrefs
                            .FirstOrDefault(x => x.CategoryId == categoryPref.Id);

                        if (existingCategoryPref != null)
                        {
                            // Update existing preference
                            existingCategoryPref.Selected = categoryPref.IsSelected;
                        }
                        else
                        {
                            // Add new preference
                            AlertPreferencesCategorie newCategoryPref = new AlertPreferencesCategorie
                            {
                                UserId = preferencesRequestDto.UserId,
                                CategoryId = categoryPref.Id,
                                Selected = categoryPref.IsSelected
                            };
                            _context.AlertPreferencesCategories.Add(newCategoryPref);
                        }
                    }
                }

                // Handle general preferences (SMS and Email)
                if (existingPreference != null)
                {
                    // Update existing preferences
                    existingPreference.SendSMS = preferencesRequestDto.IsSMSSelected;
                    existingPreference.SendEmail = preferencesRequestDto.IsEmailSelected;
                }
                else
                {
                    // Add new preferences
                    AlertPreference newPreference = new AlertPreference
                    {
                        UserId = preferencesRequestDto.UserId,
                        UserEmail = await _commonService.GetUserEmailBySubAsync(preferencesRequestDto.UserId),
                        SendSMS = preferencesRequestDto.IsSMSSelected,
                        SendEmail = preferencesRequestDto.IsEmailSelected,
                        ReceiveNewCategories = true // Default value
                    };
                    _context.AlertPreferences.Add(newPreference);
                }

                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw new Exception(StringConstant.internalServerError, ex);
            }
        }

        /// <summary>
        /// Gets user alert preferences by userId.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The user preferences DTO.</returns>
        public async Task<PreferencesRequestDto?> GetUserAlertPreferencesAsync(string userId)
        {
            try
            {
                List<PreferencesIdValue> levelPrefs = await _context.AlertPreferencesLevels
                    .Where(x => x.UserId == userId)
                    .Select(x => new PreferencesIdValue { Id = x.LevelId, IsSelected = x.Selected })
                    .ToListAsync();

                List<PreferencesIdValue> categoryPrefs = await _context.AlertPreferencesCategories
                    .Where(x => x.UserId == userId)
                    .Select(x => new PreferencesIdValue { Id = x.CategoryId, IsSelected = x.Selected })
                    .ToListAsync();

                AlertPreference? generalPref = await _context.AlertPreferences
                    .FirstOrDefaultAsync(x => x.UserId == userId);

                if (generalPref == null && !levelPrefs.Any() && !categoryPrefs.Any())
                    return null;

                return new PreferencesRequestDto
                {
                    UserId = userId,
                    LevelPreferences = levelPrefs,
                    CategoriePreferences = categoryPrefs,
                    IsSMSSelected = generalPref?.SendSMS ?? false,
                    IsEmailSelected = generalPref?.SendEmail ?? false
                };
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw new Exception(StringConstant.internalServerError, ex);
            }
        }

        /// <summary>  
        /// Retrieves the latest alert logs with pagination.  
        /// </summary>  
        /// <param name="pageNumber">The page number for pagination.</param>  
        /// <param name="pageSize">The number of items per page.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a tuple with the list of alert logs and total count.</returns>  
        public async Task<(List<AlertLog> Alerts, int TotalCount)> GetLatestAlertLogsAsync(int pageNumber, int pageSize)
        {
            try
            {
                // Get total count of alert logs  
                int totalCount = await _context.AlertLogs.CountAsync();

                // Get paginated alert logs ordered by creation time  
                List<AlertLog> latestAlerts = await _context.AlertLogs
                    .OrderByDescending(x => x.CreatedTime)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (latestAlerts, totalCount);
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, StringConstant.errorAccessingDatabase);
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw new Exception(StringConstant.internalServerError, ex);
            }
        }
        #endregion

        #region Private Methods
        /// <summary>
        /// Generates the HTML body for the alert email.
        /// </summary>
        private string GetAlertEmailBody(AlertRequestDto alertRequestDto, string? lakeName, string? alertLevel)
        {
            var portalUrl = _configuration["App:PortalUrl"] ?? "https://lakepulse.co";

            return $"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Lake Pulse Alert</title>
                </head>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
                    <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 0 auto; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 20px;">
                                <p style="color: #34495e; margin-bottom: 15px;">
                                    An admin posted a {alertLevel} for {lakeName}. For more information, please log into the 
                                    <a href="{portalUrl}" style="color: #3498db; text-decoration: none;">Lake Pulse Portal</a>
                                </p>
                                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                                    <p style="margin: 5px 0; color: #2c3e50;">{alertRequestDto.AlertText}</p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px; background-color: #f8f9fa; text-align: center;">
                                <p style="margin: 0; color: #7f8c8d;">&copy; {DateTime.Now.Year} Lake Pulse. All rights reserved.</p>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """;
        }
        #endregion
    }
}