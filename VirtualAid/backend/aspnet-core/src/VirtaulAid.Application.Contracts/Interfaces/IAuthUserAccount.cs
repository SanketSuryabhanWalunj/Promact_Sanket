using System;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Admin;
using VirtaulAid.DTOs.User;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface IAuthUserAccount: IApplicationService
    {
        /// <summary>
        /// Method is to registration of the user.
        /// </summary>
        /// <param name="reqUserRegistraionDto">Paramiter dto.</param>
        /// <returns>Task Dto.</returns>
        Task<ResUserRoleDto> UserRegistrationAsync(ReqUserRegistraionDto reqUserRegistraionDto, string culture);


        /// <summary>
        /// Method is to registration of the user as an admin.
        /// </summary>
        /// <param name="AdminRegistrationDto">Admin with details for registration.</param>
        /// <returns>Admin details.</returns>
        /// <exception cref="UserFriendlyException">Email already exist.</exception>
        Task<ResUserRoleDto> AdminRegistrationAsync(AdminRegistrationDto adminRegistrationDto, string culture);
    }
}
