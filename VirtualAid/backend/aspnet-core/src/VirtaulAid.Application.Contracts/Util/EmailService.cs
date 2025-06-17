using DocumentFormat.OpenXml.Wordprocessing;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;


namespace VirtaulAid.Util
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly MailSettingsAppsettings _mailSettingsptions;
        private readonly AppAppsettings _options;
        private readonly ITemplateAppService _templateAppService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;


        public EmailService(IConfiguration config,
            IOptions<AppAppsettings> options,
            IOptions<MailSettingsAppsettings> mailSettingsptions,
            ITemplateAppService templateAppService,
            IStringLocalizer<VirtaulAidResource> localizer)
        {
            _config = config;
            _mailSettingsptions = mailSettingsptions.Value;
            _options = options.Value;
            _templateAppService = templateAppService;
            _localizer = localizer;
        }

        /// <summary>
        /// Method to send Email.
        /// </summary>
        /// <param name="toEmail">Destination Mail.</param>
        /// <param name="emailBody">Email Body in HTML string.</param>
        /// <param name="subject">Email subject.</param>
        /// <returns>Task.</returns>
        public async Task SendEmailAsync(string toEmail, string emailBody, string subject)
        {
            MimeMessage email = new MimeMessage();
            email.From.Add(new MailboxAddress(_config["MailSettings:DisplayName"], _config["MailSettings:Mail"]));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            BodyBuilder builder = new BodyBuilder
            {
                HtmlBody = emailBody
            };
            email.Body = builder.ToMessageBody();

            using SmtpClient smtp = new SmtpClient();
            smtp.Connect(_config["MailSettings:Host"], Int32.Parse(_config["MailSettings:Port"]), SecureSocketOptions.StartTls);
            smtp.Authenticate(_config["MailSettings:Username"], _config["MailSettings:Password"]);

            await smtp.SendAsync(email);
            smtp.Disconnect(true);
        }

        /// <summary>
        /// Method to send email to the admin for custom plan
        /// </summary>
        /// <param name="recipients">Details of receipients.</param>
        /// <param name="customCourseRequestDto">Course details.</param>
        /// <returns>Task.</returns>
        public async Task SendBulkEmailToAdminForCourseSubscriptionAsync(ICollection<UserDetailsDto> recipients, CustomCourseRequestDetailsDto customCourseRequestDto, string culture)
        {
            var mimeMessages = new List<MimeMessage>();
            foreach (var user in recipients)
            {

                string name = $"{user.FirstName} {user.LastName}";
                // Get the SES template content
                string templateName = _localizer["CourseSubcriptionRequestTemplate"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                var emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                // Replace placeholders with actual data
                var htmlBody = emailTemplateContent.HtmlPart.Replace("$$COURSE_NAME$$", customCourseRequestDto.Course.Name)
                    .Replace("$$COURSE_COUNT$$", customCourseRequestDto.NoOfCourses.ToString()).Replace("$$EXAM_TYPE$$", customCourseRequestDto.ExamType)
                    .Replace("$$COMPANY_NAME$$", customCourseRequestDto.Company.CompanyName).Replace("$$COMPANY_EMAIL$$", customCourseRequestDto.Company.Email)
                    .Replace("$$COMPANY_CONTACT$$", customCourseRequestDto.ContactNumber).Replace("$$COMPANY_MESSAGE$$", customCourseRequestDto.RequestMessage);

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_mailSettingsptions.DisplayName, _mailSettingsptions.Mail));
                email.To.Add(MailboxAddress.Parse(user.Email));
                email.Subject = emailTemplateContent.SubjectPart;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                email.Body = builder.ToMessageBody();

                mimeMessages.Add(email);

            }

            // sending email to the registered users.
            using var smtp = new SmtpClient();
            smtp.Connect(_mailSettingsptions.Host, _mailSettingsptions.Port, SecureSocketOptions.StartTls);
            smtp.Authenticate(_mailSettingsptions.Username, _mailSettingsptions.Password);

            foreach (var email in mimeMessages)
            {
                await smtp.SendAsync(email);
            }
            smtp.Disconnect(true);
        }

        /// <summary>
        /// Method to send email to all the admins and super admins notifying about the feedback added to the platform
        /// </summary>
        /// <param name="recipients">list of email address of the admins and super admins</param>
        /// <param name="emailBody">actual message body of the email</param>
        /// <param name="emailSubject">subject of the email</param>
        /// <returns></returns>
        public async Task SendBulkEmailToAdminForFeedbackNotification(List<string> recipients, string emailBody, string emailSubject)
        {
            var mimeMessages = new List<MimeMessage>();
            foreach(var recipient in recipients)
            {
                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_mailSettingsptions.DisplayName, _mailSettingsptions.Mail));
                email.To.Add(MailboxAddress.Parse(recipient));
                email.Subject = emailSubject;

                BodyBuilder builder = new BodyBuilder
                {
                    HtmlBody = emailBody
                };
                email.Body = builder.ToMessageBody();

                mimeMessages.Add(email);
            }

            // sending email to the registered users.
            using var smtp = new SmtpClient();
            smtp.Connect(_mailSettingsptions.Host, _mailSettingsptions.Port, SecureSocketOptions.StartTls);
            smtp.Authenticate(_mailSettingsptions.Username, _mailSettingsptions.Password);

            foreach (var email in mimeMessages)
            {
                await smtp.SendAsync(email);
            }
            smtp.Disconnect(true);
        }
    }
}
