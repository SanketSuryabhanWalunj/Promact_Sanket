using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Util
{
    public interface IEmailOtpService : ITransientDependency
    {
        /// <summary>
        /// Method to genrate 4 Digit random OTP.
        /// </summary>
        /// <returns>String OTP.</returns>
        string GenrateOtp();

        /// <summary>
        /// Method to send OTP Mail to user.
        /// </summary>
        /// <param name="ToEmail">Destination Mail.</param>
        /// <param name="OTP">Otp to send in Email.</param>
        /// <param name="name">Name of the recepient.</param>
        /// <param name="templateName">Name of the template for email.</param>
        /// <returns>Task.</returns>
        Task SendEmailAsync(string ToEmail, string OTP, string name, string templateName);

        /// <summary>
        /// Method to send acceptance or rejection mail to user.
        /// </summary>
        /// <param name="ToEmail">Destination Mail.</param>
        /// <param name="name">Name of the recepient.</param>
        /// <param name="templateName">Name of the template.</param>
        /// <returns>Task.</returns>
        Task SendEmailForAcceptanceAndRejectionAsync(string ToEmail, string name, string templateName);
    }
}
