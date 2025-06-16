using LakePulse.Data;
using LakePulse.Models;
using LakePulse.Services.Common;
using LakePulse.Services.Email;
using Microsoft.EntityFrameworkCore;

namespace LakePulse.Services.Alert
{
    public class DataSourceAlertService
    {
        #region Private Fields
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<DataSourceAlertService> _logger;
        private readonly IConfiguration _configuration;
        private readonly ICommonService _commonService;
        #endregion

        #region Constructor
        public DataSourceAlertService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<DataSourceAlertService> logger,
            IConfiguration configuration,
            ICommonService commonService)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
            _configuration = configuration;
            _commonService = commonService;
        }
        #endregion

        #region Public Methods
        /// <summary>  
        /// Checks for changes in data sources added within the last 24 hours, groups them by lake and data source type,  
        /// and sends notifications to users who have subscribed to the affected lakes.  
        /// </summary>  
        /// <returns>A task representing the asynchronous operation.</returns>  
        public async Task CheckAndNotifyDataSourceChangesAsync()
        {
            try
            {
                // Get all data sources added in the last 24 hours  
                DateTime last24Hours = DateTime.UtcNow.AddHours(-24);
                List<Models.DataSource> recentDataSources = await _context.DataSources
                    .Where(ds => ds.CreatedTime >= last24Hours)
                    .ToListAsync();

                if (!recentDataSources.Any())
                {
                    return;
                }

                // Group by lake and data source type  
                Dictionary<string?, Dictionary<string, int>> changesByLake = recentDataSources
                    .GroupBy(ds => ds.LakePulseId)
                    .ToDictionary(
                        g => g.Key,
                        g => g.GroupBy(ds => ds.DataSourceType)
                            .ToDictionary(
                                typeGroup => typeGroup.Key,
                                typeGroup => typeGroup.Count()
                            )
                    );

                foreach (var lakeChanges in changesByLake)
                {
                    string? lakeId = lakeChanges.Key;
                    Dictionary<string, int> changes = lakeChanges.Value;

                    // Create the notification message  
                    List<string> messageParts = new List<string>();
                    foreach (var change in changes)
                    {
                        int count = change.Value;
                        string type = change.Key;
                        if (type == "images")
                        {
                            messageParts.Add($"{count} new {(count == 1 ? "photo" : "photos")} {(count == 1 ? "was" : "were")} added to photography");
                        }
                        else
                        {
                            messageParts.Add($"{count} new {(count == 1 ? "file" : "files")} {(count == 1 ? "was" : "were")} added to {type}");
                        }
                    }
                    string notificationMessage = string.Join(", ", messageParts);

                    // Add field note  
                    FieldNote fieldNote = new FieldNote
                    {
                        Id = Guid.NewGuid(),
                        LakeId = lakeId,
                        Note = notificationMessage,
                        IsAlert = true,
                        UserName = StringConstant.LakeAdminRole,
                        UserId = string.Empty,
                        CreatedBy = StringConstant.system,
                        CreatedTime = DateTime.UtcNow,
                        LastUpdatedBy = StringConstant.system
                    };

                    await _context.FieldNotes.AddAsync(fieldNote);

                    AlertLog alertLog = new AlertLog
                    {
                        UserId = StringConstant.system,
                        LakePulseId = Int32.Parse(lakeId??"0"),
                        LevelId = 0,
                        CategoryId = 0,
                        AlertText = notificationMessage,
                        CreatedBy = StringConstant.system,
                        CreatedTime = DateTime.UtcNow
                    };
                    await _context.AlertLogs.AddAsync(alertLog);

                    // Get users who have saved this lake  
                    List<UserLake> userLakes = await _context.UserLakes
                        .Where(ul => ul.LakeId == lakeId)
                        .ToListAsync();

                    if (userLakes.Any())
                    {
                        // Get user emails  
                        List<string> userIds = userLakes.Select(ul => ul.UserId).ToList();
                        List<string> userEmails = new List<string>();

                        foreach (var userId in userIds)
                        {
                            string? email = await _context.UserRoles
                                .Where(ur => ur.UserId == userId)
                                .Select(ur => ur.UserEmail)
                                .FirstOrDefaultAsync();

                            if (!string.IsNullOrEmpty(email))
                            {
                                userEmails.Add(email);
                            }
                        }

                        if (userEmails.Any())
                        {
                            // Send email notification  
                            string lakeName = await _commonService.GetLakeNameByLakePulseId(lakeId) ?? StringConstant.unknownLake;
                            string emailSubject = StringConstant.NewDataSourceUpdates;
                            string emailBody = GetAlertEmailBody(lakeName, notificationMessage);
                            await _emailService.SendAlertEmailAsync(userEmails, emailBody, emailSubject);
                        }
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorAutomatedNotification);
                throw;
            }
        }
        #endregion

        #region Private Methods
        /// <summary>  
        /// Generates the HTML body for an alert email notification.  
        /// </summary>  
        /// <param name="lakeName">The name of the lake associated with the alert.</param>  
        /// <param name="notificationMessage">The message detailing the alert information.</param>  
        /// <returns>A string containing the HTML content of the email body.</returns>  
        private string GetAlertEmailBody(string? lakeName, string notificationMessage)
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
                                   New Data Source Updates for <strong>{lakeName}</strong>.  
                               </p>  
                               <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">  
                                   <p style="margin: 5px 0; color: #2c3e50;">{notificationMessage}</p>  
                               </div>  
                               <p style="color: #34495e; margin-bottom: 15px;">  
                                   For more information, please log into the  
                                   <a href="{portalUrl}" style="color: #3498db; text-decoration: none;">Lake Pulse Portal</a>  
                               </p>  
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