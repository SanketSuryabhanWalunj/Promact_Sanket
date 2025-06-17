using Amazon;
using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using LakePulse.Boathouse.Email;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Services.Email;

namespace LakePulse.Services.Boathouse
{
    public class BoathouseService : IBoathouseService
    {
        #region Private Fields
        private readonly string _recipientAddress;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        #endregion

        #region Constructor
        public BoathouseService(IConfiguration configuration,
            IEmailService emailService)
        {
            _configuration = configuration;
            _recipientAddress = _configuration["Email:Recipient"];
            _emailService = emailService;
        }
        #endregion

        #region Public Methods
        /// <summary>  
        /// Sends an email asynchronously using the Amazon Simple Email Service (SES).  
        /// </summary>  
        /// <param name="boathouseEmailDto">  
        /// The data transfer object containing email details such as subject, recipient email, sender name, and message.  
        /// </param>  
        /// <returns>A Task representing the asynchronous operation.</returns>  
        public async Task SendBoathouseEmailAsync(BoathouseEmailDto boathouseEmailDto)
        {         
            try
            {
                List<string> toAddresses = _recipientAddress.Split(',').Select(r => r.Trim()).ToList();
                await _emailService.SendAlertEmailAsync(toAddresses, GetBoathouseEmailBody(boathouseEmailDto), boathouseEmailDto.Subject);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(StringConstant.errorSendingEmail, ex);
            }
        }
        
        #endregion

        #region Private Methods
        /// <summary>  
        /// Generates the HTML body for the boathouse email.  
        /// </summary>  
        /// <param name="boathouseEmailDto">  
        /// The data transfer object containing email details such as name, email, and message.  
        /// </param>  
        /// <returns>A string representing the HTML content of the email body.</returns>  
        private string GetBoathouseEmailBody(BoathouseEmailDto boathouseEmailDto)
        {
            return $"""  
               <!DOCTYPE html>  
               <html lang="en">  
               <head>  
               <meta charset="UTF-8">  
               <meta http-equiv="X-UA-Compatible" content="IE=edge">  
               <meta name="viewport" content="width=device-width, initial-scale=1.0">  
               <title>Email Template</title>  
               </head>  
               <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">  
               <!-- Content -->  
               <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">  
                   <tr>  
                       <td style="padding: 0 20px;">  
                           <p style="margin-bottom: 20px; color: #666;">Hello ,</p>  
                           <p style="color: #666;">Greetings!</p>  
                           <p style="color: #666;">Name:- {boathouseEmailDto.Name} </p>
                           <p style="color: #666;">Email:- {boathouseEmailDto.Email}. </p> 
                           <p style="color: #666;">Message:- {boathouseEmailDto.Message}. </p>  
                           </td>  
                   </tr></br>  
                   <tr >  
                       <td style="padding: 0 20px;">        
                       <p style=" padding-top: 10px ;color: #666;"> Regards,</p>  
                       <h3 style="margin-bottom: 20px; color: #666;"> Lake Pulse Team</h3>  
                       </td>  
                   </tr>  
               </table>  

               <!-- Footer -->  
               <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">  
                   <tr>  
                       <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">  
                           <p style="margin: 0; color: #666;">&copy; 2025 Lake Pulse. All rights reserved.</p>  
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
