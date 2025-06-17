using NPOI.SS.Formula.Functions;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Net.Mime;

namespace AITrainer.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        /// <summary>
        /// Sends an email using the specified SMTP server and credentials.
        /// </summary>
        /// <param name="sentFrom">The email address of the sender.</param>
        /// <param name="recipient">The email address of the recipient.</param>
        /// <param name="subject">The subject of the email.</param>
        /// <param name="body">The body content of the email.</param>
        public async Task<bool> SendEmailAsync(string recipient, string subject, string body)
        {
            try
            {

                string smtpClient = _configuration["Email:conSMTPClient"];
                int port = int.Parse(_configuration["Email:conSMTPPort"]);
                bool ssl = bool.Parse(_configuration["Email:conSMTPSSL"]);
                string username = _configuration["Email:conSMTPUsername"];
                string password = _configuration["Email:conSMTPPassword"];
                string from = _configuration["Email:conSMTPFrom"];

                // Configure the client:
                using (SmtpClient client = new SmtpClient(smtpClient))
                {
                    client.Port = port;
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.UseDefaultCredentials = false;

                    NetworkCredential credentials = new NetworkCredential(username, password);
                    client.EnableSsl = ssl;
                    client.Credentials = credentials;

                    // Create the message:
                    var mail = new MailMessage();
                    mail.From = new MailAddress(from);
                    mail.To.Add(recipient);
                    mail.Subject = subject;
                    mail.Body = body;
                    mail.IsBodyHtml = true;


                    await client.SendMailAsync(mail);

                }
                Console.WriteLine("Email send Successfully");
                return true;
            }
            catch (Exception ex)
            {
                // Log the exception message and inner exception message if it exists
                Console.WriteLine("Exception occurred while sending email:");
                Console.WriteLine($"Exception Message: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception Message: {ex.InnerException.Message}");
                }

                return false;
            }

        }
    }
}
