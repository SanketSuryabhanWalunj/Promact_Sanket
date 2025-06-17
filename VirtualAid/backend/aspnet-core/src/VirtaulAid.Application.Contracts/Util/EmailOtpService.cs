using Amazon.SimpleEmail.Model;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using MimeKit;
using Serilog;
using System;
using System.Threading.Tasks;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;

namespace VirtaulAid.Util
{
    public class EmailOtpService : IEmailOtpService
    {
        private readonly IConfiguration _configuration;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly ITemplateAppService _templateAppService;

        public EmailOtpService(IConfiguration configuration,
            IStringLocalizer<VirtaulAidResource> localizer, ITemplateAppService templateAppService)
        {
            _configuration = configuration;
            _localizer = localizer;
            _templateAppService = templateAppService;
        }

        /// <summary>
        /// Method to genrate 4 Digit random OTP.
        /// </summary>
        /// <returns>String OTP.</returns>
        public string GenrateOtp()
        {
            int _min = 100000;
            int _max = 999999;
            Random _rdm = new Random();
            return (_rdm.Next(_min, _max)).ToString();
        }

        /// <summary>
        /// Method to send OTP Mail to user.
        /// </summary>
        /// <param name="ToEmail">Destination Mail.</param>
        /// <param name="OTP">Otp to send in Email.</param>
        /// <param name="name">Name of the recepient.</param>
        /// <param name="templateName">Name of the template for email.</param>
        /// <returns>Task.</returns>
        public async Task SendEmailAsync(string ToEmail, string OTP, string name, string templateName)
        {
            try
            {
                // Note: We have removed otp integration in url. As we are sending welcome mail now instead of otp mail.
                Log.Information("Sending Mail...");
                string? uiEnviremntUrl = _configuration["App:ClientUrl"].ToString();
                string logInUrl = $"{uiEnviremntUrl}/login";

                // Get the SES template content
                Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);

                string htmlBody = string.Empty;

                if (templateName.Contains(_localizer["DesignedLoginTemplate"]))
                {
                    // Replace placeholders with actual data
                    htmlBody = emailTemplateContent.HtmlPart.Replace("$$NAME$$", name).Replace("$$OTP$$", OTP).Replace("$$LOGIN_URL$$", logInUrl);

                }
                else if (templateName.Contains(_localizer["WelcomeTemplate"]))
                {
                    // Replace placeholders with actual data
                    htmlBody = emailTemplateContent.HtmlPart.Replace("$$NAME$$", name).Replace("$$LOGIN_URL$$", logInUrl);
                }

                MimeMessage email = new MimeMessage();
                email.From.Add(new MailboxAddress(_configuration["MailSettings:DisplayName"], _configuration["MailSettings:Mail"]));
                email.To.Add(MailboxAddress.Parse(ToEmail));
                email.Subject = emailTemplateContent.SubjectPart;

                BodyBuilder builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                email.Body = builder.ToMessageBody();
                Log.Information($"Host: {_configuration["MailSettings:Host"]} and Port: {Int32.Parse(_configuration["MailSettings:Port"])}");
                Log.Information($"Username: {_configuration["MailSettings:Username"]} and Password: {_configuration["MailSettings:Password"]}");
                using SmtpClient smtp = new SmtpClient();
                smtp.Connect(_configuration["MailSettings:Host"], Int32.Parse(_configuration["MailSettings:Port"]), SecureSocketOptions.StartTls);
                smtp.Authenticate(_configuration["MailSettings:Username"], _configuration["MailSettings:Password"]);
                
                await smtp.SendAsync(email);
                smtp.Disconnect(true);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Method to send acceptance or rejection mail to user.
        /// </summary>
        /// <param name="ToEmail">Destination Mail.</param>
        /// <param name="name">Name of the recepient.</param>
        /// <param name="templateName">Name of the template.</param>
        /// <returns>Task.</returns>
        public async Task SendEmailForAcceptanceAndRejectionAsync(string ToEmail, string name, string templateName)
        {
            try
            {
                string? uiEnviremntUrl = _configuration["App:ClientUrl"].ToString();
                string logInUrl = $"{uiEnviremntUrl}/login/";
                // Get the SES template content
                Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                // Replace placeholders with actual data
                string htmlBody = emailTemplateContent.HtmlPart.Replace("$$NAME$$", name).Replace("$$LOGIN_URL$$", logInUrl);

                MimeMessage email = new MimeMessage();
                email.From.Add(new MailboxAddress(_configuration["MailSettings:DisplayName"], _configuration["MailSettings:Mail"]));
                email.To.Add(MailboxAddress.Parse(ToEmail));
                email.Subject = emailTemplateContent.SubjectPart;

                BodyBuilder builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                email.Body = builder.ToMessageBody();

                using SmtpClient smtp = new SmtpClient();
                smtp.Connect(_configuration["MailSettings:Host"], Int32.Parse(_configuration["MailSettings:Port"]), SecureSocketOptions.StartTls);
                smtp.Authenticate(_configuration["MailSettings:Username"], _configuration["MailSettings:Password"]);

                await smtp.SendAsync(email);
                smtp.Disconnect(true);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
