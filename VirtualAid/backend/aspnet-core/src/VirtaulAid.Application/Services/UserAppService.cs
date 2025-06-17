using AutoMapper;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;
using VirtaulAid.Exams;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Otps;
using VirtaulAid.Permissions;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.ObjectExtending;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Company, Individual, Admin, Super Admin, Governor")]
    public class UserAppService : ApplicationService
    {
        private readonly ITemplateAppService _templateAppService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly UserService _userService;
        private readonly IRepository<Company> _companyRepository;
        private readonly IUtilityService _utilityService;
        private readonly IRepository<UserDetailRoleMapping> _userRoleRepository;
        private readonly EmailOtpService _emailOtpService;
        private readonly OtpService _otpService;
        private readonly CompanyService _companyService;
        private readonly AppAppsettings _options;
        private readonly MailSettingsAppsettings _mailSettingsptions;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRepository<UserDetail> _userDetailRepository;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionMappingRepository;
        private readonly IRepository<Course> _courseRepository;
        private readonly ExamDomainService _examDomainService;
        private readonly IRepository<ExamDetail> _examDetailRepository;
        private readonly VirtualRealityDomainService _virtualRealityDomainService;


        public UserAppService(UserService userService,
            IRepository<Company> companyRepository,
            IUtilityService utilityService,
            IRepository<UserDetailRoleMapping> userRoleRepository,
            EmailOtpService emailOtpService,
            OtpService otpService,
            CompanyService companyService,
            IOptions<AppAppsettings> options,
            IOptions<MailSettingsAppsettings> mailSettingsptions,
            IHttpContextAccessor httpContextAccessor,
            ITemplateAppService templateAppService,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<UserDetail> userDetailRepository,
            IConfiguration config,
            IMapper mapper,
            IRepository<UserCourseEnrollments> userCourseEnrollmentRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionMappingRepository,
            IRepository<Course> courseRepository,
            ExamDomainService examDomainService,
            IRepository<ExamDetail> examDetailRepository,
            VirtualRealityDomainService virtualRealityDomainService)
        {
            _userService = userService;
            _companyRepository = companyRepository;
            _utilityService = utilityService;
            _userRoleRepository = userRoleRepository;
            _emailOtpService = emailOtpService;
            _otpService = otpService;
            _companyService = companyService;
            _mailSettingsptions = mailSettingsptions.Value;
            _options = options.Value;
            _httpContextAccessor = httpContextAccessor;
            _templateAppService = templateAppService;
            _localizer = localizer;
            _userDetailRepository = userDetailRepository;
            _config = config;
            _mapper = mapper;
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
            _courseSubscriptionMappingRepository = courseSubscriptionMappingRepository;
            _courseRepository = courseRepository;
            _examDomainService = examDomainService;
            _examDetailRepository = examDetailRepository;
            _virtualRealityDomainService = virtualRealityDomainService;
        }


        /// Method to get user details by user id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>User details.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<UserDetailsDto> GetUserDetailsByIdAsync(Guid userId)
        {
            var userDetails = await _userService.GetUserDetailsByIdAsync(userId);
            var companyName = string.Empty;
            if (userDetails != null && userDetails.CurrentCompanyId != null && userDetails.CurrentCompanyId != Guid.Empty)
            {
                var isCompanyExist = await _companyService.IsCompanyExistByCompanyId(userDetails.CurrentCompanyId.ToString());
                if (isCompanyExist)
                {
                    var companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == userDetails.CurrentCompanyId);
                    if (companyDetails != null)
                    {
                        companyName = companyDetails.CompanyName;
                    }
                }
            }

            var userDetailsDto = ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
            userDetailsDto.CurrentCompanyName = companyName;
            return userDetailsDto;
        }

        /// <summary>
        /// Method to get user details by email id.
        /// </summary>
        /// <returns>User details.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<UserDetailsDto> GetUserDetailsByEmailIdAsync(string emailId)
        {
            // Convert first letter of email to lower case by default
            emailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(emailId);

            var userDetails = await _userService.GetUserDetailsByEmailIdAsync(emailId);
            var companyName = string.Empty;
            if (userDetails != null && userDetails.CurrentCompanyId != null && userDetails.CurrentCompanyId != Guid.Empty)
            {
                var isCompanyExist = await _companyService.IsCompanyExistByCompanyId(userDetails.CurrentCompanyId.ToString());
                if (isCompanyExist)
                {
                    var companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == userDetails.CurrentCompanyId);
                    if (companyDetails != null)
                    {
                        companyName = companyDetails.CompanyName;
                    }
                }
            }

            var userDetailsDto = ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
            userDetailsDto.CurrentCompanyName = companyName;
            return userDetailsDto;
        }

        /// <summary>
        /// Method to get employee list by company id.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>List of the user.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ICollection<UserDetailsDto>> GetEmployeeListByCompanyIdAsync(Guid companyId)
        {
            var userDetailsList = await _userService.GetEmployeeListByCompanyIdAsync(companyId);
            return ObjectMapper.Map<ICollection<UserDetail>, ICollection<UserDetailsDto>>(userDetailsList);
        }

        /// <summary>
        /// Method to update user details.
        /// </summary>
        /// <param name="userDetailDto">User details.</param>
        /// <returns>User details.</returns>
        [Authorize(VirtaulAidPermissions.User.Edit)]
        public async Task<UserDetailsDto> UpdateUserDetailsAsync(UserDetailsDto userDetailDto)
        {
            var userDetailObject = ObjectMapper.Map<UserDetailsDto, UserDetail>(userDetailDto);
            var userDetails = await _userService.UpdateUserDetailsAsync(userDetailObject);
            return ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
        }

        /// <summary>
        /// Method to update consent data for the user.
        /// </summary>
        /// <param name="isConsentProvided">User Consent</param>
        /// <returns>String</returns>
        [Authorize(VirtaulAidPermissions.User.Edit)]
        public async Task<string> ProvideConsentToShareData(bool isConsentProvided)
        {
            var userEmail = await GetCurrentUserEmail();
            if (userEmail != null)
            {
                var currentUser = await _userDetailRepository.FirstOrDefaultAsync(x => x.Email == userEmail);
                currentUser.ConsentToShareData = isConsentProvided;
                await _userDetailRepository.UpdateAsync(currentUser, autoSave: true);

                if (isConsentProvided)
                {
                    return "Consent Received.";
                }
                else
                {
                    return "Consent not provided.";
                }
            }
            throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
        }

        /// <summary>
        /// Method to get the loggedin user's email
        /// </summary>
        /// <returns>string</returns>
        private async Task<string> GetCurrentUserEmail()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                // Handle the case when HttpContext is not available.
                return null;
            }
            var user = httpContext.User;
            var emailClaim = user.FindFirst("UserEmail");

            if (emailClaim != null)
            {
                return emailClaim.Value;
            }
            return null;
        }

        /// <summary>
        /// Method to add user details.
        /// </summary>
        /// <param name="userDetailDto">User details object.</param>
        /// <returns>created user details.</returns>
        [Authorize(VirtaulAidPermissions.User.Create)]
        public async Task<UserDetailsDto> AddUserDetailsAsync(UserDetailsDto userDetailDto)
        {

            // Convert first letter of email to lower case by default
            userDetailDto.Email = await _utilityService.ConvertFirstCharToLowerCaseAsync(userDetailDto.Email);
            var userDetailObject = ObjectMapper.Map<UserDetailsDto, UserDetail>(userDetailDto);
            var userDetails = await _userService.AddUserDetailsAsync(userDetailObject);
            if (userDetails.Id != Guid.Empty)
            {
                // Add the user details and role mapping.
                ReqUserRoleDto reqUserRoleDto = new();
                reqUserRoleDto.RoleId = await _userService.GetRoleIdAsync("Individual");
                reqUserRoleDto.UserId = userDetails.Id;
                UserDetailRoleMapping userDetailRoleMapping = ObjectMapper.Map<ReqUserRoleDto, UserDetailRoleMapping>(reqUserRoleDto);
                var UserRoleResult = await _userRoleRepository.InsertAsync(userDetailRoleMapping, autoSave: true);

                // Send OTP with registerd email id.
                if (UserRoleResult.Id != Guid.Empty)
                {
                    string OTP = _emailOtpService.GenrateOtp();
                    string name = $"{userDetails.FirstName} {userDetails.LastName}";
                    await _emailOtpService.SendEmailAsync(userDetails.Email, OTP, name, _localizer["WelcomeTemplate"]);
                    await _otpService.AddOtpAsync(userDetails.Email, OTP);
                }
            }
            return ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
        }

        /// <summary>
        /// Method to upload file over s3 and create new user mentioned in the file.
        /// </summary>
        /// <param name="formFile">File.</param>
        /// <returns>Task</returns>
        [Authorize(VirtaulAidPermissions.Employee.Create)]
        public async Task UploadFileAsync(IFormFile formFile)
        {
            var currentLoggedInEmail = await _userService.GetCurrentLoggedInEmailAsync();
            var companyDetail = await _companyRepository.FirstOrDefaultAsync(x => x.Email == currentLoggedInEmail);
            if (companyDetail != null)
            {
                var fileName = $"bulkuploadEmployee_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}_{companyDetail.CompanyName}";
                var recordsFromFile = await _utilityService.ExtractDataFromFileAsync(formFile, companyDetail.Id.ToString());
                var emails = recordsFromFile.Where(x => !string.IsNullOrWhiteSpace(x.Email)).Select(x => x.Email).ToList();
                var duplicateEmailsCount = emails.Count - emails.Distinct().ToList().Count;
                var inValidRecords = recordsFromFile.Where(x => string.IsNullOrEmpty(x.FirstName)
                || string.IsNullOrEmpty(x.LastName) || string.IsNullOrEmpty(x.Email) || string.IsNullOrEmpty(x.ContactNumber)).ToList();
                if (inValidRecords.Count > 0 || duplicateEmailsCount > 0)
                {
                    var message = duplicateEmailsCount == 0 ? $"Please filled the required fields. There are {inValidRecords.Count} invalid records." :
                        $"Please filled the required fields. There are {inValidRecords.Count} invalid records. Also there are {duplicateEmailsCount} duplicate emails.";
                    throw new UserFriendlyException(message);
                }

                var filePath = await _utilityService.UploadAsync(formFile, fileName);
                var newUserDetailsList = ObjectMapper.Map<ICollection<BulkUserUploadDto>, ICollection<UserDetail>>(recordsFromFile);
                if (recordsFromFile != null && recordsFromFile.Count > 0)
                {
                    await _userService.AddBulkEmployeeByCompanyIdAsync(newUserDetailsList);
                    await SendBulkEmailAsync(newUserDetailsList.ToList());
                }
            }

        }

        /// <summary>
        /// Method to upload profile image file over s3.
        /// </summary>
        /// <param name="formFile">Image File.</param>
        /// <param name="email">Email id of the user.</param>
        /// <returns>Task</returns>
        [Authorize]
        public async Task UploadProfileImageForUserAsync(IFormFile formFile, string email)
        {
            // Convert first letter of email to lower case by default
            var currentLoggedInEmail = await _utilityService.ConvertFirstCharToLowerCaseAsync(email); ;
            bool isEmailpresent = await _userService.IsUserEmailPresentAsync(currentLoggedInEmail);
            if (isEmailpresent)
            {
                FileInfo fileInfo = new FileInfo(formFile.FileName);
                if ((fileInfo.Extension != ".JPEG" && fileInfo.Extension != ".JPG" && fileInfo.Extension != ".jpeg" && fileInfo.Extension != ".jpg") || fileInfo.Extension.Length == 0)
                {
                    throw new UserFriendlyException(_localizer["PhotoFormatSupported"], StatusCodes.Status406NotAcceptable.ToString());
                }
                var userDetails = await _userDetailRepository.FirstOrDefaultAsync(x => x.Email == currentLoggedInEmail);
                var fileName = $"profiles/{userDetails.FirstName}_{userDetails.LastName}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";


                var filePath = await _utilityService.UploadAsync(formFile, fileName);
                userDetails.ProfileImage = filePath;
                await _userDetailRepository.UpdateAsync(userDetails);
            }
            else
            {
                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status404NotFound.ToString());
            }

        }

        /// <summary>
        /// Method to upload general file over s3.
        /// </summary>
        /// <param name="formFile">File.</param>
        /// <param name="fileName">File name.</param>
        /// <param name="folder">Folder name.</param>
        /// <returns>Task</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<string> UploadGeneralFileAsync(IFormFile formFile, string fileName, string folder)
        {
            var path = $"{folder}/{fileName}";
            var filePath = await _utilityService.UploadAsync(formFile, path);
            return filePath;
        }

        /// <summary>
        /// Method to get all uploaded files paths.
        /// </summary>
        /// <returns>List of the file paths.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ICollection<string>> GetAllFilesPathAsync()
        {
            var files = await _utilityService.GetAllFilesPathAsync();
            return files;
        }

        /// <summary>
        /// Method to send email in bulk.
        /// </summary>
        /// <param name="recipientEmails">List of emails.</param>
        /// <returns>Task.</returns>
        private async Task SendBulkEmailAsync(ICollection<UserDetail> recipients)
        {
            var mimeMessages = new List<MimeMessage>();
            var otps = new List<Otp>();
            foreach (var user in recipients)
            {
                // We have exclude this part for now. As we are sending welcome mail now instead of sending otp mail.
                //string OTP = _emailOtpService.GenrateOtp();

                string? uiEnviremntUrl = _options.ClientUrl;
                string logInUrl = $"{uiEnviremntUrl}/login";

                string name = $"{user.FirstName} {user.LastName}";
                // Get the SES template content
                var emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync("WelcomeTemplate");
                // Replace placeholders with actual data
                var htmlBody = emailTemplateContent.HtmlPart.Replace("$$NAME$$", name).Replace("$$LOGIN_URL$$", logInUrl);

                var email = new MimeMessage();
                email.From.Add(new MailboxAddress(_mailSettingsptions.DisplayName, _mailSettingsptions.Mail));
                email.To.Add(MailboxAddress.Parse(user.Email));
                email.Subject = emailTemplateContent.SubjectPart;

                var builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                email.Body = builder.ToMessageBody();

                mimeMessages.Add(email);

                // We have exclude this part for now. As we are sending welcome mail now instead of sending otp mail.
                //var otp = new Otp();
                //otp.EmailId = user.Email;
                //// Encryption of Otp
                //byte[] bytesToEncode = Encoding.UTF8.GetBytes(OTP);
                //string base64EncodedString = Convert.ToBase64String(bytesToEncode);
                //OTP = base64EncodedString;
                //otp.OtpCode = OTP;
                //otps.Add(otp);

            }

            // We have exclude this part for now. As we are sending welcome mail now instead of sending otp mail.
            //await _otpService.AddOtpRangeAsync(otps);

            // sending email to the registered users.
            using var smtp = new SmtpClient();
            smtp.Connect(_mailSettingsptions.Host, _mailSettingsptions.Port, SecureSocketOptions.StartTls);
            smtp.Authenticate(_mailSettingsptions.Username, _mailSettingsptions.Password);

            foreach (var email in mimeMessages)
            {
                await smtp.SendAsync(email);
            }
            smtp.Disconnect(true);
        }

        /// <summary>
        /// Method to upload and edit Profile Image for user.
        /// </summary>
        /// <param name="ProfileImage">Profile Image file of the user</param>
        /// <param name="email">Email id of the user</param>
        /// <returns>url of the image stored in s3.</returns>
        /// <exception cref="UserFriendlyException">throws the error when user not exist, image format is not supported, or something goes wrong.</exception>
        public async Task<string> AddEditProfileImageForUserAsync(IFormFile ProfileImage, string email)
        {
            UserDetail userDetail = await _userDetailRepository.FirstOrDefaultAsync(x => x.Email == email);
            if (userDetail == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                if (ProfileImage != null)
                {
                    string fileType = ProfileImage.ContentType.Split('/')[1].ToLower();
                    if (fileType.Equals("jpg") || fileType.Equals("jpeg") || fileType.Equals("png"))
                    {
                        var fileName = $"profiles/{userDetail?.FirstName}_{userDetail?.LastName}_{userDetail?.Email}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                        var filePath = await _utilityService.UploadAsync(ProfileImage, fileName);
                        userDetail.ProfileImage = $"https://{_config.GetSection("AWS").GetSection("Bucket").Value}.s3.{_config.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                        await _userDetailRepository.UpdateAsync(userDetail);
                        return $"https://{_config.GetSection("AWS").GetSection("Bucket").Value}.s3.{_config.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                    }
                    else
                    {
                        throw new UserFriendlyException(_localizer["ImageFormatNotSupported"], StatusCodes.Status406NotAcceptable.ToString());
                    }
                }
            }
            throw new UserFriendlyException(_localizer["SomethingWentWrong"], StatusCodes.Status500InternalServerError.ToString());
        }

        /// <summary>
        /// Method to upload and edit Banner Image for user.
        /// </summary>
        /// <param name="BannerImage">Banner Image file of the user</param>
        /// <param name="email">Email id of the user</param>
        /// <returns>url of the image stored in s3.</returns>
        /// <exception cref="UserFriendlyException">throws the error when user not exist, image format is not supported, or something goes wrong.</exception>
        public async Task<string> AddEditBannerImageForUserAsync(IFormFile BannerImage, string email)
        {
            UserDetail userDetail = await _userDetailRepository.FirstOrDefaultAsync(x => x.Email == email);
            if (userDetail == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                if (BannerImage != null)
                {
                    string fileType = BannerImage.ContentType.Split('/')[1].ToLower();
                    if (fileType.Equals("jpg") || fileType.Equals("jpeg") || fileType.Equals("png"))
                    {
                        var fileName = $"banners/{userDetail?.FirstName}_{userDetail?.LastName}_{userDetail?.Email}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                        var filePath = await _utilityService.UploadAsync(BannerImage, fileName);
                        userDetail.BannerImage = $"https://{_config.GetSection("AWS").GetSection("Bucket").Value}.s3.{_config.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                        await _userDetailRepository.UpdateAsync(userDetail);
                        return $"https://{_config.GetSection("AWS").GetSection("Bucket").Value}.s3.{_config.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                    }
                    else
                    {
                        throw new UserFriendlyException(_localizer["ImageFormatNotSupported"], StatusCodes.Status406NotAcceptable.ToString());
                    }
                }
            }
            throw new UserFriendlyException(_localizer["SomethingWentWrong"], StatusCodes.Status500InternalServerError.ToString());
        }

        /// <summary>
        /// Method to get public profile details of user.
        /// </summary>
        /// <param name="userId">user id of the user</param>
        /// <returns>public profile details object for user</returns>
        /// <exception cref="UserFriendlyException">throws the error when user not exists.</exception>
        public async Task<ResUserProfileDto> GetPublicProfileDetailsOfUserAsync(Guid userId, bool isPreviewRequest = false)
        {
            UserDetail user = await _userDetailRepository.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                ResUserProfileDto result = new();
                if (user.PublishData == true || isPreviewRequest)
                {
                    result = _mapper.Map<ResUserProfileDto>(user);
                }
                return result;
            }
        }

        /// <summary>
        /// Method to get all the courses completed by user.
        /// </summary>
        /// <param name="userId">user Id of the user.</param>
        /// <returns>list of courses finished by user</returns>
        /// <exception cref="UserFriendlyException">throws the error when user doesn't exist.</exception>
        public async Task<List<ResFinishedCourseDto>> GetAllCoursesFinishedByUserAsync(Guid userId)
        {
            UserDetail user = await _userDetailRepository.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                List<UserCourseEnrollments> coursesFinishedByUser = await _userCourseEnrollmentRepository.GetListAsync(x => x.UserId == userId && x.IsCompleted);
                List<CourseSubscriptionMapping> subscriptionMappingList = await _courseSubscriptionMappingRepository.GetListAsync(x => coursesFinishedByUser.Select(c => c.CourseSubscriptionId).Contains(x.Id));
                List <ResFinishedCourseDto> resultList = new();
                foreach (UserCourseEnrollments item in coursesFinishedByUser)
                {
                    CourseSubscriptionMapping? mapping = subscriptionMappingList.Find(x => x.Id == item.CourseSubscriptionId);
                    if (mapping != null)
                    {
                        ResFinishedCourseDto finishedCourse = new();
                        finishedCourse.ExamType = mapping.ExamType;
                        finishedCourse.Name = (await _courseRepository.FirstOrDefaultAsync(x => x.Id == mapping.CourseId)).Name;
                        finishedCourse.CourseId = mapping.CourseId;
                        int examDetailId = (await _examDetailRepository.FirstOrDefaultAsync(x => x.CourseId == mapping.CourseId)).Id;
                        string percentage = await _examDomainService.GetExamPercentageAsync(userId, examDetailId, item.ExamType);
                        finishedCourse.Percentage = percentage;
                        resultList.Add(finishedCourse);
                    }
                }
                return resultList;
            }
        }

        /// <summary>
        /// Method to update PublishData property for User
        /// </summary>
        /// <param name="userId">user id of the user</param>
        /// <param name="publishData">publish data boolean value, which has to be updated for the user</param>
        /// <returns>object which returns the id and updated publish data value for the user</returns>
        /// <exception cref="UserFriendlyException">throws the execption when user does not exist</exception>
        public async Task<ResPublishDataDto> UpdatePublishDataForUserAsync(Guid userId, bool publishData)
        {
            UserDetail user = await _userDetailRepository.FirstOrDefaultAsync(x => x.Id == userId);
            if (user != null)
            {
                user.PublishData = publishData;
                await _userDetailRepository.UpdateAsync(user, true);
                ResPublishDataDto result = _mapper.Map<ResPublishDataDto>(user);
                return result;
            }
            throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
        }

        /// <summary>
        /// Method is to get the Virtual Reality Token.
        /// </summary>
        /// <param name="emailId">User email if for getting record.</param>
        /// <returns>Token with the user emailid and VR link.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<VRSectionTestDto?> GetVirtualRealityTokenAsync(string emailId)
        {
            VRSectionTestDto? result = await _virtualRealityDomainService.GetVRTokenAsync(emailId);
            return result;
        }
    }
}
