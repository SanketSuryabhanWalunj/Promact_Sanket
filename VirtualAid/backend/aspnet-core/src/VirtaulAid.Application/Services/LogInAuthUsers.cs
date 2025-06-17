using Amazon.Runtime.Internal.Util;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Microsoft.IdentityModel.Tokens;
using Quartz.Impl.Triggers;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Company;
using VirtaulAid.DTOs.LogIn;
using VirtaulAid.DTOs.User;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Authorization;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Localization;
using Volo.Abp.Users;

namespace VirtaulAid.Services
{
    public class LogInAuthUsers : ApplicationService, ILogInAuthUsers
    {
        private readonly UserService _userService;
        private readonly EmailOtpService _emailOtpService;
        private readonly OtpService _otpService;
        private readonly IRepository<Company> _companyRepository;
        private readonly IRepository<UserDetailRoleMapping> _userDetailsRoleMappingRepository;
        private readonly CompanyService _companyService;
        private readonly IUtilityService _utilityService;
        private readonly IConfiguration _configuration;
        private readonly ICurrentUser _currentUser;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;

        public LogInAuthUsers(UserService userService,
            EmailOtpService emailOtpService,
            OtpService otpService,
            IRepository<Company> companyRepository,
            IRepository<UserDetailRoleMapping> userDetailsRoleMappingRepository,
            IConfiguration configuration,
            ICurrentUser currentUser,
            IStringLocalizer<VirtaulAidResource> localizer,
            CompanyService companyService,
            IUtilityService utilityService)
        {
            _userService = userService;
            _emailOtpService = emailOtpService;
            _otpService = otpService;
            _companyRepository = companyRepository;
            _userDetailsRoleMappingRepository = userDetailsRoleMappingRepository;
            _configuration = configuration;
            _currentUser = currentUser;
            _localizer = localizer;
            _companyService = companyService;
            _utilityService = utilityService;
        }

        /// <summary>
        /// Method is to genrate Otp share otp via mail and stored otp with mailId for Individual and company.
        /// </summary>
        /// <param name="emailId">user mail id.</param>
        /// <returns>Task bool.</returns>
        /// <exception cref="UserFriendlyException">Email id is not exist.</exception>
        public async Task<bool> GenerateOtpAsync(string emailId, string culture)
        {

            // Convert first letter of email to lower case by default
            emailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(emailId);

            // Checks the user email id is already present or not.
            bool isUserEmailpresent = await _userService.IsUserEmailPresentAsync(emailId);
            bool isCompanyEmailPresent = await _companyService.IsCompanyEmailPresentAsync(emailId);
            if ((!isUserEmailpresent) && (!isCompanyEmailPresent))
            {
                bool isSoftdeleteUser = await _userService.IsSoftDeleteUserAsync(emailId);
                bool isSoftdeleteCompany = await _companyService.IsSoftDeleteCompanyAsync(emailId);
                if ((isSoftdeleteUser) || (isSoftdeleteCompany))
                {
                    throw new UserFriendlyException(_localizer["AccountDisabled"], StatusCodes.Status403Forbidden.ToString());
                }

                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status404NotFound.ToString());
            }else
            {
                string roleName = await _otpService.GetRoleByEmailAsync(emailId);
                if (!roleName.Equals("Company") && !roleName.Equals("Individual"))
                {
                    throw new AbpAuthorizationException();
                }
            }
            string name = string.Empty;
            if (isUserEmailpresent)
            {
                UserDetail userDetails = await _userService.GetUserDetailsByEmailIdAsync(emailId);
                name = $"{userDetails.FirstName} {userDetails.LastName}";
            }
            else if (isCompanyEmailPresent)
            {
                Company companyDetails = await _companyService.GetCompanyDetailsByEmailIdAsync(emailId);
                name = $"{companyDetails.CompanyName}";
            }
            // Genrate otp, send via mail and stored otp with mail.
            string otp = _emailOtpService.GenrateOtp();
            string templateName = _localizer["DesignedLoginTemplate"];
            if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
            {
                templateName = templateName + "_" + culture;
            }
            string reversedOtp = string.Empty;
            if(culture == "ar")
            {
                char[] charArray = otp.ToCharArray();
                Array.Reverse(charArray);
                reversedOtp = new string(charArray);
                await _emailOtpService.SendEmailAsync(emailId, reversedOtp, name, templateName);
            }
            else
            {
                await _emailOtpService.SendEmailAsync(emailId, otp, name, templateName);
            }
            await _otpService.AddOtpAsync(emailId, otp);
            return true;
        }

        /// <summary>
        /// Method is to genrate Otp share otp via mail and store otp for the admin.
        /// </summary>
        /// <param name="emailId">user mail id.</param>
        /// <returns>Task bool.</returns>
        /// <exception cref="UserFriendlyException">Email id does not exist.</exception>
        public async Task<bool> GenerateOtpForAdminAsync(string emailId, string culture)
        {
            // Convert first letter of email to lower case by default
            emailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(emailId);

            bool isUserEmailPresent = await _userService.IsUserEmailPresentAsync(emailId);
            bool isCompanyEmailPresent = await _companyService.IsCompanyEmailPresentAsync(emailId);
            if ((isUserEmailPresent) || (isCompanyEmailPresent))
            {
                string roleName = await _otpService.GetRoleByEmailAsync(emailId);
                if (!roleName.Equals("Admin") && !roleName.Equals("Super Admin") && !roleName.Equals("Governor"))
                {
                    throw new AbpAuthorizationException();
                }
            }
            else if (!isUserEmailPresent)
            {
                bool isSoftdeleteUser = await _userService.IsSoftDeleteUserAsync(emailId);
                if (isSoftdeleteUser)
                    throw new UserFriendlyException(_localizer["AccountDisabled"], StatusCodes.Status403Forbidden.ToString());

                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status409Conflict.ToString());
            }

            UserDetail userDetails = await _userService.GetUserDetailsByEmailIdAsync(emailId);
            string name = $"{userDetails.FirstName} {userDetails.LastName}";

            // Genrate otp, send via mail and stored otp with mail.
            string otp = _emailOtpService.GenrateOtp();
            string templateName = _localizer["DesignedLoginTemplate"];
            if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
            {
                templateName = templateName + "_" + culture;
            }
            await _emailOtpService.SendEmailAsync(emailId, otp, name, templateName);
            await _otpService.AddOtpAsync(emailId, otp);
            return true;
        }

        /// <summary>
        /// Method is to verify Otp and authorize the User.
        /// </summary>
        /// <param name="reqLogInDto">LogIn dto include email and OTP.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException">Manage the condition.</exception>
        public async Task<AuthenticatedUserDto> LogInByOtpAsync(ReqLogInDto reqLogInDto)
        {
            try
            {
                // Convert first letter of email to lower case by default
                reqLogInDto.EmailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(reqLogInDto.EmailId);

                string roleName = await _otpService.GetRoleByEmailAsync(reqLogInDto.EmailId);
                if (roleName == null)
                {
                    throw new UserFriendlyException(_localizer["AccountLock"], StatusCodes.Status400BadRequest.ToString());
                }

                string storedOtp = await _otpService.GetOtpAsync(reqLogInDto.EmailId);
                if (storedOtp == null)
                {
                    throw new UserFriendlyException(_localizer["OtpNotFound"], StatusCodes.Status404NotFound.ToString());
                }
                if (storedOtp != reqLogInDto.OtpCode)
                {
                    throw new UserFriendlyException(_localizer["OtpNotMatched"], StatusCodes.Status409Conflict.ToString());
                }

                if (!roleName.Equals("Company") && !roleName.Equals("Individual"))
                {
                    throw new AbpAuthorizationException();
                }

                // Autherisation Code 
                string token = await UserGenerateWerxAccessTokenAsync(reqLogInDto.EmailId);
                UserDetailsDto userDetailsDto = new();
                CompanyDto companyDetails = new();
                userDetailsDto = null;
                companyDetails = null;
                if (roleName.Equals("Company"))
                {
                    Company company = await _companyService.GetCompanyDetailsByEmailIdAsync(reqLogInDto.EmailId);
                    companyDetails = ObjectMapper.Map<Company, CompanyDto>(company);
                }
                else if (roleName.Equals("Individual"))
                {
                    UserDetail userDetails = await _userService.GetUserDetailsByEmailIdAsync(reqLogInDto.EmailId);
                    string companyName = string.Empty;
                    if (userDetails != null && userDetails.CurrentCompanyId != null && userDetails.CurrentCompanyId != Guid.Empty)
                    {
                        bool isCompanyExist = await _companyService.IsCompanyExistByCompanyId(userDetails.CurrentCompanyId.ToString());
                        if (isCompanyExist)
                        {
                            Company companyDetail = await _companyRepository.FirstOrDefaultAsync(x => x.Id == userDetails.CurrentCompanyId);
                            if (companyDetail != null)
                            {
                                companyName = companyDetail.CompanyName;
                            }
                        }
                    }

                    userDetailsDto = ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
                    userDetailsDto.CurrentCompanyName = companyName;
                }

                UserRoleDto userRoleDto = new();
                userRoleDto.Name = roleName;

                AuthenticatedUserDto authenticatedUser = new();
                authenticatedUser.Email = reqLogInDto.EmailId;
                authenticatedUser.Token = token;
                authenticatedUser.UserDetails = userDetailsDto;
                authenticatedUser.Company = companyDetails;

                List<UserRoleDto> userRoles = new();
                userRoles.Add(userRoleDto);
                authenticatedUser.Roles = userRoles;
                await _userService.AddLogdetailsAsync(reqLogInDto.EmailId); // Save the logged In details.

                return authenticatedUser;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Method is to verify Otp and authorize the admin.
        /// </summary>
        /// <param name="reqLogInDto">LogIn dto include email and OTP.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException">Manage the condition.</exception>
        public async Task<AuthenticatedUserDto> LogInByOtpForAdminAsync(ReqLogInDto reqLogInDto)
        {
            try
            {

                // Convert first letter of email to lower case by default
                reqLogInDto.EmailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(reqLogInDto.EmailId);

                string roleName = await _otpService.GetRoleByEmailAsync(reqLogInDto.EmailId);
                if (roleName == null)
                {
                    throw new UserFriendlyException(_localizer["AccountLock"], StatusCodes.Status400BadRequest.ToString());
                }

                string storedOtp = await _otpService.GetOtpAsync(reqLogInDto.EmailId);
                if (storedOtp == null)
                {
                    throw new UserFriendlyException(_localizer["OtpNotFound"], StatusCodes.Status404NotFound.ToString());
                }

                if (storedOtp != reqLogInDto.OtpCode)
                {
                    throw new UserFriendlyException(_localizer["OtpNotMatched"], StatusCodes.Status409Conflict.ToString());
                }

                if (!roleName.Equals("Admin") && !roleName.Equals("Super Admin") && !roleName.Equals("Governor"))
                {
                    throw new AbpAuthorizationException();
                }
                // Autherisation Code 
                string token = await AdminGenerateWerxAccessTokenAsync(reqLogInDto.EmailId);
                UserDetail user = await _userService.GetUserDetailsByEmailIdAsync(reqLogInDto.EmailId);
                UserDetailsDto userDetails = ObjectMapper.Map<UserDetail, UserDetailsDto>(user);

                UserRoleDto userRoleDto = new();
                userRoleDto.Name = roleName;

                AuthenticatedUserDto authenticatedUser = new();
                authenticatedUser.Email = reqLogInDto.EmailId;
                authenticatedUser.Token = token;
                authenticatedUser.UserDetails = userDetails;
                List<UserRoleDto> userRoles = new List<UserRoleDto>();
                userRoles.Add(userRoleDto);
                authenticatedUser.Roles = userRoles;
                await _userService.AddLogdetailsAsync(reqLogInDto.EmailId); // Save the logged In details.

                return authenticatedUser;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Method to get the current logged in details.
        /// </summary>
        /// <param name="isAdminPlatform">True if it is admin platform otherwise false.</param>
        /// <returns>User details.</returns>
        [Authorize]
        public async Task<AuthenticatedUserDto> MeAsync(bool isAdminPlatform)
        {
            try
            {
                if (isAdminPlatform)
                {
                    if (!_currentUser.IsAuthenticated)
                    {
                        throw new AbpAuthorizationException();
                    }
                    string roleName = await _otpService.GetRoleByEmailAsync(_currentUser.Email);
                    if (roleName == null)
                    {
                        throw new UserFriendlyException(_localizer["AccountLock"], StatusCodes.Status400BadRequest.ToString());
                    }

                    if (!roleName.Equals("Admin") && !roleName.Equals("Super Admin") && !roleName.Equals("Governor"))
                    {
                        throw new AbpAuthorizationException();
                    }

                    UserDetail user = await _userService.GetUserDetailsByEmailIdAsync(_currentUser.Email);
                    UserDetailsDto userDetails = ObjectMapper.Map<UserDetail, UserDetailsDto>(user);

                    List<UserRoleDto> userRoles = new List<UserRoleDto>();
                    UserRoleDto userRoleDto = new();
                    userRoleDto.Name = roleName;
                    userRoles.Add(userRoleDto);

                    AuthenticatedUserDto authenticatedUser = new();
                    authenticatedUser.Email = _currentUser.Email;
                    authenticatedUser.Token = string.Empty;
                    authenticatedUser.Roles = userRoles;
                    authenticatedUser.UserDetails = userDetails;

                    return authenticatedUser;
                }
                else
                {
                    if (!_currentUser.IsAuthenticated)
                    {
                        throw new AbpAuthorizationException();
                    }
                    string roleName = await _otpService.GetRoleByEmailAsync(_currentUser.Email);
                    if (roleName == null)
                    {
                        throw new UserFriendlyException(_localizer["AccountLock"], StatusCodes.Status400BadRequest.ToString());
                    }

                    if (!roleName.Equals("Company") && !roleName.Equals("Individual"))
                    {
                        throw new AbpAuthorizationException();
                    }
                    UserDetailsDto userDetailsDto = new();
                    CompanyDto companyDetails = new();
                    userDetailsDto = null;
                    companyDetails = null;
                    if (roleName.Equals("Company"))
                    {
                        Company company = await _companyService.GetCompanyDetailsByEmailIdAsync(_currentUser.Email);
                        companyDetails = ObjectMapper.Map<Company, CompanyDto>(company);
                    }
                    else if (roleName.Equals("Individual"))
                    {
                        UserDetail userDetails = await _userService.GetUserDetailsByEmailIdAsync(_currentUser.Email);
                        string companyName = string.Empty;
                        if (userDetails != null && userDetails.CurrentCompanyId != null && userDetails.CurrentCompanyId != Guid.Empty)
                        {
                            bool isCompanyExist = await _companyService.IsCompanyExistByCompanyId(userDetails.CurrentCompanyId.ToString());
                            if (isCompanyExist)
                            {
                                Company companyDetail = await _companyRepository.FirstOrDefaultAsync(x => x.Id == userDetails.CurrentCompanyId);
                                if (companyDetail != null)
                                {
                                    companyName = companyDetail.CompanyName;
                                }
                            }
                        }

                        userDetailsDto = ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
                        userDetailsDto.CurrentCompanyName = companyName;
                    }

                    UserRoleDto userRoleDto = new();
                    userRoleDto.Name = roleName;

                    List<UserRoleDto> userRoles = new();
                    userRoles.Add(userRoleDto);

                    AuthenticatedUserDto authenticatedUser = new();
                    authenticatedUser.Email = _currentUser.Email;
                    authenticatedUser.Token = string.Empty;
                    authenticatedUser.UserDetails = userDetailsDto;
                    authenticatedUser.Company = companyDetails;
                    authenticatedUser.Roles = userRoles;

                    return authenticatedUser;
                }
                
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Generate Access token for user and company.
        /// </summary>
        /// <param name="userEmail">Current user email.</param>
        /// <returns>Generated Token.</returns>
        private async Task<string> UserGenerateWerxAccessTokenAsync(string userEmail)
        {
            SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF32.GetBytes(_configuration["ApiAccessToken:ApiAccessTokenKey"]));
            SigningCredentials credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Checks the user email id is already present or not.
            bool isUserEmailpresent = await _userService.IsUserEmailPresentAsync(userEmail);
            bool isCompanyEmailPresent = await _companyService.IsCompanyEmailPresentAsync(userEmail);
            if ((!isUserEmailpresent) && (!isCompanyEmailPresent))
            {
                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status409Conflict.ToString());
            }
            string name = string.Empty;
            string id = string.Empty;
            string userName = string.Empty;
            string surname = string.Empty;
            string phonenumber = string.Empty;
            string phoneNumberVerified = string.Empty;
            string email = string.Empty;
            string emailVerified = string.Empty;
            string tenantId = Guid.Empty.ToString();
            List<string> roles = new();
            if (isUserEmailpresent)
            {
                UserDetail userDetails = await _userService.GetUserDetailsByEmailIdAsync(userEmail);
                userName = $"{userDetails.FirstName} {userDetails.LastName}";
                id = userDetails.Id.ToString();
                name = userDetails.FirstName;
                surname = userDetails.LastName;
                phonenumber = userDetails.ContactNumber ?? string.Empty;
                phoneNumberVerified = "false"; // we are not adding this as we don't use this for now.
                email = userDetails.Email;
                emailVerified = "false"; // we are not adding this as we don't use this for now.
                List<UserDetailRoleMapping> rolesList = (await _userDetailsRoleMappingRepository.WithDetailsAsync(x => x.Roledetail)).Where<UserDetailRoleMapping>(x => x.UserId == userDetails.Id).ToList();

                foreach (UserDetailRoleMapping item in rolesList)
                {
                    roles.Add(item.Roledetail.Name);
                }
            }
            else if (isCompanyEmailPresent)
            {
                Company companyDetails = await _companyService.GetCompanyDetailsByEmailIdAsync(userEmail);
                name = $"{companyDetails.CompanyName}";
                id = companyDetails.Id.ToString();
                userName = companyDetails.CompanyName;
                surname = companyDetails.CompanyName;
                phonenumber = companyDetails.ContactNumber ?? string.Empty;
                phoneNumberVerified = "false"; // we are not adding this as we don't use this for now.
                email = companyDetails.Email;
                emailVerified = "false";
                roles.Add("Company");
            }



            var claims = new List<Claim>
            {
                new Claim("Id", id),
                new Claim("UserName", userName),
                new Claim("Name", name),
                new Claim("Surname", surname),
                new Claim("PhoneNumber", phonenumber),
                new Claim("PhoneNumberVerified", phoneNumberVerified),
                new Claim("Email", email),
                new Claim("EmailVerified", emailVerified),
                new Claim("TenantId", tenantId),
                new Claim("UserEmail", userEmail),
                // Add other user claims as needed
            };


            // Add roles as multiple claims (if needed)
            foreach (string role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            JwtSecurityToken token = new JwtSecurityToken(_configuration["ApiAccessToken:ApiAccessTokenIssuer"],
              _configuration["ApiAccessToken:ApiAccessTokenAudience"],
              claims,
              expires: DateTime.Now.AddDays(int.Parse(_configuration["App:TokenExpirationInDays"])),
              signingCredentials: credentials);
            try
            {
                string st = new JwtSecurityTokenHandler().WriteToken(token);
                return st;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        /// <summary>
        /// Generate Access token for admin, super admin, governor.
        /// </summary>
        /// <param name="userEmail">Current user email.</param>
        /// <returns>Generated Token.</returns>
        private async Task<string> AdminGenerateWerxAccessTokenAsync(string userEmail)
        {
            SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF32.GetBytes(_configuration["ApiAccessToken:ApiAccessTokenKey"]));
            SigningCredentials credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // Checks the user email id is already present or not.
            bool isUserEmailpresent = await _userService.IsUserEmailPresentAsync(userEmail);
            if (!isUserEmailpresent)
            {
                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status409Conflict.ToString());
            }

            UserDetail userDetails = await _userService.GetUserDetailsByEmailIdAsync(userEmail);
            string phonenumber = userDetails.ContactNumber ?? string.Empty;
            string tenantId = Guid.Empty.ToString();
            List<UserDetailRoleMapping> rolesList = (await _userDetailsRoleMappingRepository.WithDetailsAsync(x => x.Roledetail)).Where<UserDetailRoleMapping>(x => x.UserId == userDetails.Id).ToList();
            List<string> roles = new();
            foreach (UserDetailRoleMapping item in rolesList)
            {
                roles.Add(item.Roledetail.Name);
            }

            var claims = new List<Claim>
            {
                new Claim("Id", userDetails.Id.ToString()),
                new Claim("UserName", $"{userDetails.FirstName} {userDetails.LastName}"),
                new Claim("Name", userDetails.FirstName),
                new Claim("Surname",  userDetails.LastName),
                new Claim("PhoneNumber", phonenumber),
                new Claim("PhoneNumberVerified", "false"), // we are not verifying this as we don't use this for now.
                new Claim("Email", userDetails.Email),
                new Claim("EmailVerified", "false"), // we are not verifying this as we don't use this for now.
                new Claim("TenantId", tenantId),
                new Claim("UserEmail", userEmail),
                // Add other user claims as needed
            };

            // Add roles as multiple claims (if needed)
            foreach (string role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            JwtSecurityToken token = new JwtSecurityToken(_configuration["ApiAccessToken:ApiAccessTokenIssuer"],
              _configuration["ApiAccessToken:ApiAccessTokenAudience"],
              claims,
              expires: DateTime.Now.AddDays(int.Parse(_configuration["App:TokenExpirationInDays"])),
              signingCredentials: credentials);
            try
            {
                string st = new JwtSecurityTokenHandler().WriteToken(token);
                return st;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

    }
}
