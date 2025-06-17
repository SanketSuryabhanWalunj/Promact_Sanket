using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Threading.Tasks;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Admin;
using VirtaulAid.DTOs.User;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Localization;

namespace VirtaulAid.Services
{
    public class AuthUserAccount : ApplicationService, IAuthUserAccount
    {
        private readonly IRepository<UserDetail> _UserRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleRepository;
        private readonly IMapper _mapper;
        private readonly IUtilityService _utilityService;
        private readonly UserService _userService;
        private readonly CompanyService _companyService;
        private readonly EmailOtpService _emailOtpService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly OtpService _otpService;

        public AuthUserAccount(IRepository<UserDetail> userRepository,
            IRepository<UserDetailRoleMapping> userRoleRepository,
            UserService userService,
            CompanyService companyService,
            EmailOtpService emailOtpService,
            OtpService otpService,
            IStringLocalizer<VirtaulAidResource> localizer,
            IMapper mapper,
            IUtilityService utilityService)
        {
            _UserRepository = userRepository;
            _userRoleRepository = userRoleRepository;
            _mapper = mapper;
            _utilityService = utilityService;
            _userService = userService;
            _companyService = companyService;
            _emailOtpService = emailOtpService;
            _localizer = localizer;
            _otpService = otpService;
        }

        /// <summary>
        /// Method is to registration of the user.
        /// </summary>
        /// <param name="reqUserRegistraionDto">Paramiter dto.</param>
        /// <returns>Task Dto.</returns>
        /// <exception cref="UserFriendlyException">Email already exist.</exception>
        public async Task<ResUserRoleDto> UserRegistrationAsync(ReqUserRegistraionDto reqUserRegistraionDto, string culture)
        {
            // Convert first letter of email to lower case by default
            reqUserRegistraionDto.Email = await _utilityService.ConvertFirstCharToLowerCaseAsync(reqUserRegistraionDto.Email);

            // Checks the user email id is already present or not.
            bool isEmailpresent = await _userService.IsSoftDeleteUserAsync(reqUserRegistraionDto.Email) || await _companyService.IsSoftDeleteCompanyAsync(reqUserRegistraionDto.Email);
            if (isEmailpresent)
            {
                throw new UserFriendlyException(_localizer["EmailExist"], StatusCodes.Status409Conflict.ToString());
            }
            UserDetail userDetail = _mapper.Map<UserDetail>(reqUserRegistraionDto);
            userDetail.IsActive = true;
            UserDetail userResult = await _UserRepository.InsertAsync(userDetail,autoSave: true);
            if(userResult.Id!=Guid.Empty)
            {
                // Add the user details and role mapping.
                ReqUserRoleDto reqUserRoleDto = new ReqUserRoleDto();   
                reqUserRoleDto.RoleId = await _userService.GetRoleIdAsync("Individual");
                reqUserRoleDto.UserId = userResult.Id;
                UserDetailRoleMapping userDetailRoleMapping = _mapper.Map<UserDetailRoleMapping>(reqUserRoleDto);
                var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);

                // Send OTP with registerd email id.
                if (userRoleResult.Id!=Guid.Empty)
                {
                    string otp = _emailOtpService.GenrateOtp();
                    string name = $"{userResult.FirstName} {userResult.LastName}";
                    string templateName = _localizer["WelcomeTemplate"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateName = templateName + "_" + culture;
                    }
                    await _emailOtpService.SendEmailAsync(userResult.Email, otp, name, templateName);

                    // We have exclude this part for now. As we are sending welcome mail now instead of sending otp mail.
                    //await _otpService.AddOtpAsync(userResult.Email, otp);                  
                }
            } 
            return _mapper.Map<ResUserRoleDto>(userResult);
        }

        /// <summary>
        /// Method is to registration of the user as an admin.
        /// </summary>
        /// <param name="AdminRegistrationDto">Admin with details for registration.</param>
        /// <returns>Admin details.</returns>
        /// <exception cref="UserFriendlyException">Email already exist.</exception>
        public async Task<ResUserRoleDto> AdminRegistrationAsync(AdminRegistrationDto adminRegistrationDto, string culture)
        {
            // Convert first letter of email to lower case by default
            adminRegistrationDto.Email = await _utilityService.ConvertFirstCharToLowerCaseAsync(adminRegistrationDto.Email);

            // Checks the user email id is already present or not.
            bool isEmailpresent = await _userService.IsSoftDeleteUserAsync(adminRegistrationDto.Email) || await _companyService.IsSoftDeleteCompanyAsync(adminRegistrationDto.Email);
            if (isEmailpresent)
            {
                throw new UserFriendlyException(_localizer["EmailExist"], StatusCodes.Status409Conflict.ToString());
            }
            var userDetail = _mapper.Map<UserDetail>(adminRegistrationDto);
            userDetail.IsActive = true;
            var userResult = await _UserRepository.InsertAsync(userDetail,autoSave: true);
            if(userResult.Id!=Guid.Empty)
            {
                // Add the user details and role mapping.
                var reqUserRoleDto = new ReqUserRoleDto();   
                reqUserRoleDto.RoleId = await _userService.GetRoleIdAsync("Admin");
                reqUserRoleDto.UserId = userResult.Id;
                var userDetailRoleMapping = _mapper.Map<UserDetailRoleMapping>(reqUserRoleDto);
                var userRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);

                // Send OTP with registerd email id.
                if (userRoleResult.Id!=Guid.Empty)
                {
                    string otp = _emailOtpService.GenrateOtp();
                    string name = $"{userResult.FirstName} {userResult.LastName}";
                    string templateName = _localizer["WelcomeTemplate"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateName = templateName + "_" + culture;
                    }
                    await _emailOtpService.SendEmailAsync(userResult.Email, otp, name, templateName);

                    // We have exclude this part for now. As we are sending welcome mail now instead of sending otp mail.
                    //await _otpService.AddOtpAsync(userResult.Email, otp);                 
                }
            } 
            return _mapper.Map<ResUserRoleDto>(userResult);
        }

    }
}
