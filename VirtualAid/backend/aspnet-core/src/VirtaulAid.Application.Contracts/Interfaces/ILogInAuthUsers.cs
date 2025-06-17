using System.Threading.Tasks;
using VirtaulAid.DTOs.LogIn;
using VirtaulAid.DTOs.User;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Interfaces
{
    public interface ILogInAuthUsers : ITransientDependency
    {

        /// <summary>
        /// Method is to genrate Otp share otp via mail and stored otp with mailId.
        /// </summary>
        /// <param name="EmailId">user mail id.</param>
        /// <returns>Task bool.</returns>
        /// <exception cref="UserFriendlyException">Email id is not exist.</exception>
        Task<bool> GenerateOtpAsync(string emailId, string culture);

        /// <summary>
        /// Method is to verify Otp and authorize the User.
        /// </summary>
        /// <param name="reqLogInDto">LogIn dto include email and OTP.</param>
        /// <returns>Task AuthenticatedUserDto.</returns>
        /// <exception cref="UserFriendlyException">Manage the condition.</exception>
        Task<AuthenticatedUserDto> LogInByOtpAsync(ReqLogInDto reqLogInDto);


        /// <summary>
        /// Method is to verify Otp and authorize the admin.
        /// </summary>
        /// <param name="reqLogInDto">LogIn dto include email and OTP.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException">Manage the condition.</exception>
        Task<AuthenticatedUserDto> LogInByOtpForAdminAsync(ReqLogInDto reqLogInDto);

    }
}
