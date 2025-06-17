using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Util
{
    public interface IEmailService : ITransientDependency
    {
        /// <summary>
        /// Method to send Email.
        /// </summary>
        /// <param name="ToEmail">Destination Mail.</param>
        /// <param name="EmailBody">Email Body in HTML string.</param>
        /// <returns>Task.</returns>
        Task SendEmailAsync(string toEmail, string emailBody, string subject);

        /// <summary>
        /// Method to send email to the admin for custom plan
        /// </summary>
        /// <param name="recipients">Details of receipients.</param>
        /// <param name="customCourseRequestDto">Course details.</param>
        /// <returns>Task.</returns>
        Task SendBulkEmailToAdminForCourseSubscriptionAsync(ICollection<UserDetailsDto> recipients, CustomCourseRequestDetailsDto customCourseRequestDto, string culture);
    }
}
