using LakePulse.DTOs.Alert;

namespace LakePulse.Services.Email
{
    public interface IEmailService
    {
        /// <summary>
        /// Sends an alert email to the specified recipients with the provided email body and subject.
        /// </summary>
        /// <param name="recipients">A list of email addresses to send the alert to.</param>
        /// <param name="emailBody">The content of the email.</param>
        /// <param name="emailSubject">The subject of the email.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task SendAlertEmailAsync(List<string> recipients, string emailBody, string emailSubject);
    }
}