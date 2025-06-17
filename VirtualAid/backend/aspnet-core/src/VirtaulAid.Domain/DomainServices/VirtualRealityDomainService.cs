using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.User;
using Volo.Abp.Authorization;
using Volo.Abp;
using Volo.Abp.Domain.Services;
using Microsoft.Extensions.Localization;
using VirtaulAid.Localization;
using VirtaulAid.DTOs.Course;
using Microsoft.Extensions.Options;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.Users;

namespace VirtaulAid.DomainServices
{
    public class VirtualRealityDomainService : DomainService
    {
        private readonly UserService _userService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly OtpService _otpService;
        private readonly CourseDomainService _courseDomainService;
        private readonly ContentDomainService _contentDomainService;
        private readonly CompanyService _companyService;
        private readonly AppAppsettings _appSettings;


        public VirtualRealityDomainService(UserService userService,
            IStringLocalizer<VirtaulAidResource> localizer,
            OtpService otpService,
            IOptions<AppAppsettings> options,
            CourseDomainService courseDomainService,
            ContentDomainService contentDomainService,
            CompanyService companyService)
        {
            _userService = userService;
            _localizer = localizer;
            _otpService = otpService;
            _courseDomainService = courseDomainService;
            _contentDomainService = contentDomainService;
            _companyService = companyService;
            _appSettings = options.Value;
        }

        /// <summary>
        /// Method to get authentication info for user.
        /// </summary>
        /// <param name="token">token entered.</param>
        /// <returns>Details with available virtuality lessons.</returns>
        /// <exception cref="UserFriendlyException">Exception for invalid token.</exception>
        public async Task<VRAuthInfoDto> GetAuthenticationInfoAsync(string token)
        {
            // Validate the token
            if (string.IsNullOrWhiteSpace(token) || !token.StartsWith("Bearer "))
            {
                throw new UserFriendlyException(_localizer["TokenNotValid"], StatusCodes.Status403Forbidden.ToString());
            }

            // Extract the token value
            token = token.Substring("Bearer ".Length).Trim();

            string? otpDetails = await _otpService.GetVerifiedVirtualRealityOtpAsync(token);
            if (otpDetails == null)
            {
                throw new UserFriendlyException(_localizer["TokenUnauthorized"], StatusCodes.Status401Unauthorized.ToString());
            }

            UserDetailsDto loggedInUserDetails = await _otpService.GetVirtualRealityUserDetailsByTokenAsync(token);
            List<string>? listOfVirtualRealityModules = new List<string>();

            if (loggedInUserDetails != null)
            {
                // Fetch allowed VR modules for logged in user
                listOfVirtualRealityModules = await _contentDomainService.GetListOfVirtualRealityModulesForUserAsync(loggedInUserDetails.Id.ToString());

            }
            else
            {
                throw new UserFriendlyException(_localizer["EmailIdNotExist"], StatusCodes.Status404NotFound.ToString());
            }


            return new VRAuthInfoDto
            {
                Name = "Virtual Aid VR System", // Replace with actual system name
                Modules = listOfVirtualRealityModules // Sample list of modules, replace with actual modules
            };

        }

        /// <summary>
        /// Method to generate virtual reality token for VR system.
        /// </summary>
        /// <param name="emailId">Id of the user.</param>
        /// <returns>Details with token and VR system link.</returns>
        /// <exception cref="UserFriendlyException">Exception related to account disabled.</exception>
        /// <exception cref="AbpAuthorizationException">Authorization exception.</exception>
        public async Task<VRSectionTestDto> GenerateVirtualRealityTokenAsync(string emailId)
        {
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
            }
            else
            {
                var roleName = await _otpService.GetRoleByEmailAsync(emailId);
                if (!roleName.Equals("Individual"))
                {
                    throw new AbpAuthorizationException();
                }
            }

            if (isUserEmailpresent)
            {
                var userDetails = await _userService.GetUserDetailsByEmailIdAsync(emailId);
                var existingToken = await _otpService.GetVirtualRealityOtpByEmailIdAsync(emailId);

                VRSectionTestDto vRSectionTestDto = new();
                vRSectionTestDto.EmailId = userDetails.Email;
                vRSectionTestDto.VirtualRealitySystemLink = _appSettings.VirtualRealitySystemLink;
                vRSectionTestDto.VirtualRealityOtpCode = string.Empty;

                if (existingToken != null)
                {
                    // If token is already exist, i.e not expired.
                    vRSectionTestDto.VirtualRealityOtpCode = existingToken;
                }
                else
                {
                    // If token is not exist.
                    string token = await _otpService.GenerateAlphanumericOtp();
                    await _otpService.AddVirtualRealityOtpAsync(userDetails.Email, token);
                    vRSectionTestDto.VirtualRealityOtpCode = token;
                }

                return vRSectionTestDto;
            }
            else
            {
                throw new UserFriendlyException(_localizer["EmailIdNotExist"], StatusCodes.Status404NotFound.ToString());
            }

        }

        /// <summary>
        /// Method to update the virtual reality lesson status to completed.
        /// </summary>
        /// <param name="virtualRealityCompletedModuleDto">Details of completed lesson.</param>
        /// <param name="token">Token used for verificagtion of user.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task CompleteVirtualRealityModuleAsync(VirtualRealityCompletedModuleDto virtualRealityCompletedModuleDto, string token)
        {
            // Validate the token
            if (string.IsNullOrWhiteSpace(token) || !token.StartsWith("Bearer "))
            {
                throw new UserFriendlyException(_localizer["TokenNotValid"], StatusCodes.Status403Forbidden.ToString());
            }

            // Extract the token value
            token = token.Substring("Bearer ".Length).Trim();

            var otpDetails = await _otpService.GetVerifiedVirtualRealityOtpAsync(token);
            if (otpDetails == null)
            {
                throw new UserFriendlyException(_localizer["TokenUnauthorized"], StatusCodes.Status401Unauthorized.ToString());
            }

            UserDetailsDto userDetailsDto = await _otpService.GetVirtualRealityUserDetailsByTokenAsync(token);
            var coursesInProgress = await _courseDomainService.GetAllInprogressEnrolledCoursesByUserIdAsync(userDetailsDto.Id.ToString());
            string lessonId = string.Empty;
            string courseId = string.Empty;

            for (int i = 0; i < coursesInProgress.Count; i++)
            {
                var course = coursesInProgress.ElementAt(i);
                // Extract virtual reality sections
                var virtualRealitySections = course.Modules
                    .SelectMany(module => module.Lessons)
                    .SelectMany(lesson => lesson.Contents)
                    .SelectMany(content => content.Sections)
                    .Where(section => section.FieldType == Enums.SectionType.VirtualReality && section.SectionTitle == virtualRealityCompletedModuleDto.ModuleName)
                    .ToList();

                // If there are virtual reality sections found
                if (virtualRealitySections.Any())
                {
                    // We are storing only one section in one content, one content in one lesson for VR. 
                    var virtualRealitySection = virtualRealitySections.First();
                    lessonId = virtualRealitySection.Content.LessonId.ToString();
                    courseId = course.Id.ToString();
                    break; // Exit loop as we found the module
                }
            }


            // If lessonId and courseId are not empty, update progress
            if (!string.IsNullOrEmpty(lessonId) && !string.IsNullOrEmpty(courseId))
            {
                UserCourseEnrollments userCourseEnrollment = await _courseDomainService.UpdateProgressForCourseByLessonIdAsync(userDetailsDto.Id.ToString(), courseId, lessonId, "VR");
                return; // Module completion recorded successfully
            }
            else
            {
                throw new UserFriendlyException(_localizer["ModuleNotExist"], StatusCodes.Status404NotFound.ToString());
            }
        }

        /// <summary>
        /// Method is to get the Virtual Reality token.
        /// </summary>
        /// <param name="emailId">User email id for getting token.</param>
        /// <returns>Tocken with the user email and VR link.</returns>
        public async Task<VRSectionTestDto?> GetVRTokenAsync(string emailId)
        {
            string? existingToken = await _otpService.GetVirtualRealityOtpByEmailIdAsync(emailId);
            VRSectionTestDto vRSectionTestDto = new VRSectionTestDto();

            // If token is not exist return null.
            if (existingToken == null)
            {
                return vRSectionTestDto;
            }

            vRSectionTestDto.EmailId = emailId;
            vRSectionTestDto.VirtualRealitySystemLink = _appSettings.VirtualRealitySystemLink;
            vRSectionTestDto.VirtualRealityOtpCode = existingToken;
            return vRSectionTestDto;
        }

    }
}
