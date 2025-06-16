using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Amazon.Runtime;

namespace LakePulse.Services.Email
{
    public class EmailService : IEmailService
    {
        #region Private Fields
        private readonly string _senderAddress;
        private readonly string _awsRegion;
        private readonly IConfiguration _configuration;
        #endregion

        #region Constructor
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _senderAddress = _configuration["Email:Sender"];
            _awsRegion = _configuration["AWS:Region"];
        }
        #endregion

        #region Public Methods
        /// <summary>  
        /// Sends an alert email to a list of recipients using AWS Simple Email Service (SES).  
        /// </summary>  
        /// <param name="recipients">The list of email addresses to send the email to.</param>  
        /// <param name="emailBody">The HTML content of the email body.</param>  
        /// <param name="emailSubject">The subject of the email.</param>  
        /// <exception cref="InvalidOperationException">Thrown when there is an error sending the email.</exception>  
        public async Task SendAlertEmailAsync(List<string> recipients, string emailBody, string emailSubject)
        {
            // Below code for the local server email sending hard coded credentials repace with your own credentials like BasicAWSCredentials("Access_key", "Secret_key")
            // Comment the code after local testing. 
            // BasicAWSCredentials credentials = new BasicAWSCredentials("Access_key", "Secret_key");
            // AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(credentials, RegionEndpoint.GetBySystemName(_awsRegion));

            // Below code for the server email sending.
            using AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(RegionEndpoint.GetBySystemName(_awsRegion));

            var sendRequest = new SendEmailRequest
            {
                Source = _senderAddress,
                Destination = new Destination
                {
                    BccAddresses = recipients,
                },
                Message = new Message
                {
                    Subject = new Content(emailSubject),
                    Body = new Body
                    {
                        Html = new Content
                        {
                            Charset = "UTF-8",
                            Data = emailBody
                        }
                    }
                }
            };

            try
            {
                var response = await client.SendEmailAsync(sendRequest);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error sending alert email", ex);
            }
        }

        #endregion

    }
}