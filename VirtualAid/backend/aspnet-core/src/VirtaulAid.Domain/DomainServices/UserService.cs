using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.Employee;
using VirtaulAid.Roles;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using MimeKit;
using Microsoft.Extensions.Options;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.Interfaces;
using Microsoft.Extensions.Localization;
using VirtaulAid.Localization;
using DocumentFormat.OpenXml.EMMA;
using System.Text.RegularExpressions;

namespace VirtaulAid.DomainServices
{
    public class UserService : DomainService
    {
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IDataFilter _dataFilter;
        private readonly IRepository<LoggedInUser> _loggedInUserRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleMappingRepository;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;
        private readonly EmailOtpService _emailOtpService;
        private readonly IDataFilter<ISoftDelete> _softDeleteFilter;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollment;
        private readonly IRepository<TerminatedEmployee> _terminatedEmployeesRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly AppAppsettings _options;
        private readonly ITemplateAppService _templateAppService;
        private readonly MailSettingsAppsettings _mailSettingsptions;

        public IRepository<Company> _companyRepository { get; }
        public IHttpContextAccessor _httpContextAccessor { get; }

        public UserService(IRepository<UserDetail> userRepository,
            IRepository<Role> roleRepository,
            IDataFilter dataFilter,
            IRepository<Company> companyRepository,
            IRepository<LoggedInUser> loggedInUserRepository,
            IRepository<UserDetailRoleMapping> userRoleMappingRepository,
            IHttpContextAccessor httpContextAccessor,
             IRepository<UserCourseEnrollments> userCourseEnrollmentRepository,
            IDataFilter<ISoftDelete> softDeleteFilter,
            EmailOtpService emailOtpService,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IRepository<UserCourseEnrollments> userCourseEnrollment,
            IRepository<TerminatedEmployee> terminatedEmployeesRepository,
            IOptions<AppAppsettings> options,
            IOptions<MailSettingsAppsettings> mailSettingsptions,
            IStringLocalizer<VirtaulAidResource> localizer,
            ITemplateAppService templateAppService
            )
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _dataFilter = dataFilter;
            _companyRepository = companyRepository;
            _userRoleMappingRepository = userRoleMappingRepository;
            _httpContextAccessor = httpContextAccessor;
            _loggedInUserRepository = loggedInUserRepository;
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
            _softDeleteFilter = softDeleteFilter;
            _emailOtpService = emailOtpService;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _userCourseEnrollment = userCourseEnrollment;
            _terminatedEmployeesRepository = terminatedEmployeesRepository;
            _localizer = localizer;
            _options = options.Value;
            _templateAppService = templateAppService;
            _mailSettingsptions = mailSettingsptions.Value;
        }

        /// <summary>
        /// Method is to check Email Id is present or Not.
        /// </summary>
        /// <param name="email">email id to check.</param>
        /// <returns>Task Bool.</returns>
        public async Task<bool> IsUserEmailPresentAsync(string email)
        {
            UserDetail result = await _userRepository.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
            return !(result == null);
        }

        /// <summary>
        /// Method is to check user Email Id is present or Not, using soft delete.
        /// </summary>
        /// <param name="email">email id to check.</param>
        /// <returns>Task Bool.</returns>
        public async Task<bool> IsSoftDeleteUserAsync(string email)
        {
            using (_dataFilter.Disable<ISoftDelete>())
            {
                UserDetail result = await _userRepository.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
                return !(result == null);
            }
        }

        /// <summary>
        /// Method to check whether a uesr exist or not based on id.
        /// </summary>
        /// <param name="userId">User id to check.</param>
        /// <returns>True if exist otherwise false.</returns>
        public async Task<bool> IsUserExistByIdAsync(string userId)
        {
            UserDetail result = await _userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(userId));
            return (result != null);
        }

        /// <summary>
        /// Method is to get the Role Guid.
        /// </summary>
        /// <param name="role">Role Name.</param>
        /// <returns>Task Guid.</returns>
        public async Task<Guid> GetRoleIdAsync(string role)
        {
            Role result = await _roleRepository.FirstAsync(x => x.Name == role);
            return result.Id;
        }

        /// <summary>
        /// Method to get user details by user id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>User details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        public async Task<UserDetail> GetUserDetailsByIdAsync(Guid userId)
        {
            UserDetail user = new();
            using (_softDeleteFilter.Disable())
            {
                user = await _userRepository.FirstOrDefaultAsync(x => x.Id == userId);
            }
            if (user == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                return user;
            }
        }

        /// <summary>
        /// Method to get the user details based on email id.
        /// </summary>
        /// <param name="emailId">Email id of the user.</param>
        /// <returns>User details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        public async Task<UserDetail> GetUserDetailsByEmailIdAsync(string emailId)
        {
            UserDetail user = new();
            using (_softDeleteFilter.Disable())
            {
                user = await _userRepository.FirstOrDefaultAsync(x => x.Email == emailId);
            }
            if (user == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                return user;
            }
        }

        /// <summary>
        /// Method to get employee list for a company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>List of employees.</returns>
        public async Task<ICollection<UserDetail>> GetEmployeeListByCompanyIdAsync(Guid companyId)
        {
            return await _userRepository.GetListAsync(x => x.CurrentCompanyId == companyId);
        }

        /// <summary>
        /// Method to get admin details by id.
        /// </summary>
        /// <param name="adminId">Id of the admin.</param>
        /// <returns>Admin details.</returns>
        public async Task<UserDetail> GetAdminDetailsByIdAsync(Guid adminId)
        {
            UserDetail adminDetails = await _userRepository.FirstOrDefaultAsync(x => x.Id == adminId);
            UserDetailRoleMapping roleDetails = (await _userRoleMappingRepository.WithDetailsAsync(x => x.Roledetail)).FirstOrDefault(x => x.UserId == adminId && (x.Roledetail.Name == "Admin" || x.Roledetail.Name == "Super Admin"));
            if (roleDetails == null)
            {
                throw new UserFriendlyException(_localizer["AdminNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            return adminDetails;
        }

        /// <summary>
        /// Method to update the user details.
        /// </summary>
        /// <param name="userDetail">User details which will be going to update.</param>
        /// <returns>Updated user details.</returns>
        /// <exception cref="UserFriendlyException"> User does not exist.</exception>
        public async Task<UserDetail> UpdateUserDetailsAsync(UserDetail userDetail)
        {
            UserDetail updatedUserDetail = new();
            if (userDetail.Id != Guid.Empty)
            {
                updatedUserDetail = await _userRepository.FirstOrDefaultAsync(x => x.Id == userDetail.Id);
                if (updatedUserDetail != null)
                {
                    if (updatedUserDetail.Email != userDetail.Email)
                    {
                        throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status404NotFound.ToString());
                    }

                    updatedUserDetail.FirstName = userDetail.FirstName;
                    updatedUserDetail.LastName = userDetail.LastName;
                    updatedUserDetail.Bio = userDetail.Bio;
                    updatedUserDetail.Designation = userDetail.Designation;
                    updatedUserDetail.Address1 = userDetail.Address1;
                    updatedUserDetail.Address2 = userDetail.Address2;
                    updatedUserDetail.Address3 = userDetail.Address3;
                    updatedUserDetail.City = userDetail.City;
                    updatedUserDetail.Country = userDetail.Country;
                    updatedUserDetail.State = userDetail.State;
                    updatedUserDetail.Postalcode = userDetail.Postalcode;
                    updatedUserDetail.Latitude = userDetail.Latitude;
                    updatedUserDetail.Longitude = userDetail.Longitude;
                    updatedUserDetail.ContactNumber = userDetail.ContactNumber;
                    updatedUserDetail = await _userRepository.UpdateAsync(updatedUserDetail);

                    return updatedUserDetail;
                }
            }
            throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
        }

        /// <summary>
        /// Method to activate or inactivate user by id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="isDeleted">If true then user will be soft delete and vice varsa.</param>
        /// <returns>Updated user details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        public async Task<UserDetail> ActivateOrInactivateUserByIdAsync(Guid userId, bool isDeleted, string culture)
        {
            if (userId != Guid.Empty)
            {
                UserDetail userDetails = new();
                using (_softDeleteFilter.Disable())
                {
                    userDetails = await _userRepository.FirstAsync(x => x.Id == userId);
                }

                if (userDetails.IsDeleted != isDeleted)
                {
                    userDetails.IsDeleted = isDeleted;
                    userDetails = await _userRepository.UpdateAsync(userDetails, true);
                    if (userDetails.IsDeleted)
                    {
                        List<UserCourseEnrollments> courseEnrollmentList = await _userCourseEnrollmentRepository.GetListAsync(x => x.UserId == userId && x.ExpirationDate >= DateTime.Now);
                        foreach (UserCourseEnrollments courseEnrollment in courseEnrollmentList)
                        {
                            courseEnrollment.ExpirationDate = DateTime.Now;
                        }
                        await _userCourseEnrollmentRepository.UpdateManyAsync(courseEnrollmentList, true);

                        List<CourseSubscriptionMapping> courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => x.UserId == userId && x.ExpirationDate >= DateTime.Now);
                        foreach (CourseSubscriptionMapping courseSubscription in courseSubscriptionList)
                        {
                            courseSubscription.ExpirationDate = DateTime.Now;
                        }

                        await _courseSubscriptionRepository.UpdateManyAsync(courseSubscriptionList, true);

                        string templateName = _localizer["DisableAccountEmailTemplate"];
                        if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                        {
                            templateName = templateName + "_" + culture;
                        }
                        await _emailOtpService.SendEmailForAcceptanceAndRejectionAsync(userDetails.Email, userDetails.FirstName, templateName);
                    }
                    else
                    {
                        string templateName = _localizer["EnabledAccountEmailTemplate"];
                        if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                        {
                            templateName = templateName + "_" + culture;
                        }
                        await _emailOtpService.SendEmailForAcceptanceAndRejectionAsync(userDetails.Email, userDetails.FirstName, templateName);
                    }

                    return userDetails;
                }

            }

            throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
        }

        /// <summary>
        /// Method to enable or disable the company by its Id
        /// </summary>
        /// <param name="companyId">Required company Id</param>
        /// <param name="disable">boolean value for company status</param>
        /// <returns>Company object with changes status</returns>
        /// <exception cref="UserFriendlyException">If company does not exists</exception>
        public async Task<Company> EnableOrDisableCompanyByIdAsync(Guid companyId, bool disable, string culture)
        {
            Company company = new();
            using (_softDeleteFilter.Disable())
            {
                company = await _companyRepository.FirstOrDefaultAsync(c => c.Id == companyId);
            }
            if (company == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            if (disable)
            {
                // Expiring the courses purchased by company and assigned to employees.
                IQueryable<CourseSubscriptionMapping> allCoursesSubscriptions = await _courseSubscriptionRepository.GetQueryableAsync();
                IQueryable<CourseSubscriptionMapping> allCoursesSubscriptionsByCompany = allCoursesSubscriptions.Where(cs => cs.CompanysId == companyId);
                List<int> subscriptionIds = new List<int>();
                foreach (CourseSubscriptionMapping courseSubscription in allCoursesSubscriptionsByCompany)
                {
                    subscriptionIds.Add(courseSubscription.Id);
                }

                IQueryable<UserCourseEnrollments> allUserCourseEnrollments = await _userCourseEnrollment.GetQueryableAsync();
                List<UserCourseEnrollments> userCourseEnrollmentOfEmployeesOfCompany = new List<UserCourseEnrollments>();
                foreach (int i in subscriptionIds)
                {
                    List<UserCourseEnrollments> courseEnrollments = allUserCourseEnrollments.Where(ce => ce.CourseSubscriptionId == i).ToList();
                    userCourseEnrollmentOfEmployeesOfCompany.AddRange(courseEnrollments);
                }

                foreach (UserCourseEnrollments courseEnrollment in userCourseEnrollmentOfEmployeesOfCompany)
                {
                    courseEnrollment.Expired = true;
                }

                //Setting the current company id to null for the employees of company
                List<UserDetail> allEmployeesOfCompany = await _userRepository.GetListAsync(u => u.CurrentCompanyId == companyId);
                List<UserDetail> listOfEmployee = new();
                foreach (var employee in allEmployeesOfCompany)
                {
                    listOfEmployee.Add(employee);
                    DateTime? joiningDate = employee.JoiningDate;
                    TerminatedEmployee terminatedEmployee = new TerminatedEmployee
                    {
                        CompanyId = companyId,
                        UserId = employee.Id,
                        JoiningDate = joiningDate,
                        TerminationDate = DateTime.Now,
                        EmployeeEmail = employee.Email,
                        EmployeeName = employee.FirstName + " " + employee.LastName
                    };
                    await _terminatedEmployeesRepository.InsertAsync(terminatedEmployee, true);
                    employee.CurrentCompanyId = null;
                }
                string templateName = _localizer["DisableAccountEmailTemplate"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                //Sending email to the employees
                await SendBulkEmailAsync(listOfEmployee, templateName);
                //sending email to company
                await _emailOtpService.SendEmailForAcceptanceAndRejectionAsync(company.Email, company.CompanyName, templateName);
            }
            else
            {
                string templateName = _localizer["EnabledAccountEmailTemplate"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                //sending email to company
                await _emailOtpService.SendEmailForAcceptanceAndRejectionAsync(company.Email, company.CompanyName, templateName);
            }
            company.IsDeleted = disable;
            return company;
        }

        /// <summary>
        /// Method to send email in bulk to the users
        /// </summary>
        /// <param name="recipients">list of users</param>
        /// <param name="emailTemplate">template which needs to be sent</param>
        /// <returns>Task.</returns>
        private async Task SendBulkEmailAsync(ICollection<UserDetail> recipients, string emailTemplate)
        {
            List<MimeMessage> mimeMessages = new();
            foreach (var user in recipients)
            {
                string name = $"{user.FirstName} {user.LastName}";
                // Get the SES template content
                Amazon.SimpleEmail.Model.Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(emailTemplate);
                // Replace placeholders with actual data
                string htmlBody = emailTemplateContent.HtmlPart.Replace("$$NAME$$", name);

                MimeMessage email = new MimeMessage();
                email.From.Add(new MailboxAddress(_mailSettingsptions.DisplayName, _mailSettingsptions.Mail));
                email.To.Add(MailboxAddress.Parse(user.Email));
                email.Subject = "Account Info";

                BodyBuilder builder = new BodyBuilder
                {
                    HtmlBody = htmlBody
                };
                email.Body = builder.ToMessageBody();

                mimeMessages.Add(email);
            }
            using var smtp = new SmtpClient();
            smtp.Connect(_mailSettingsptions.Host, _mailSettingsptions.Port, SecureSocketOptions.StartTls);
            smtp.Authenticate(_mailSettingsptions.Username, _mailSettingsptions.Password);

            foreach (MimeMessage email in mimeMessages)
            {
                await smtp.SendAsync(email);
            }
            smtp.Disconnect(true);
        }

        /// <summary>
        /// Method to create new user.
        /// </summary>
        /// <param name="userDetail">User details which will be created.</param>
        /// <returns>Details of newly created user.</returns>
        public async Task<UserDetail> AddUserDetailsAsync(UserDetail userDetail)
        {
            UserDetail userAlreadyExist = await _userRepository.FirstOrDefaultAsync(x => x.Email.Equals(userDetail.Email));
            if (userAlreadyExist == null)
            {
                UserDetail createdUserDetail = await _userRepository.InsertAsync(userDetail, true);
                return createdUserDetail;
            }
            else
            {
                throw new UserFriendlyException(_localizer["UserExist"], StatusCodes.Status409Conflict.ToString());
            }

        }

        /// <summary>
        /// Method to create user in bulk
        /// </summary>
        /// <param name="userDetailsList">List of the user.</param>
        /// <returns>Task</returns>
        public async Task AddBulkEmployeeByCompanyIdAsync(ICollection<UserDetail> userDetailsList)
        {
            try
            {
                IEnumerable<string> emailList = userDetailsList.Select(x => x.Email);
                List<UserDetail> existingUserDetailList = await _userRepository.GetListAsync(x => emailList.Contains(x.Email));
                IEnumerable<string> existingEmailList = existingUserDetailList.Select(x => x.Email);
                emailList = emailList.Where(x => !existingEmailList.Contains(x)).ToList();
                List<UserDetail> newUserList = userDetailsList.Where(x => emailList.Contains(x.Email)).ToList();
                if (newUserList.Count > 0)
                {
                    newUserList.ForEach(x => x.JoiningDate = DateTime.Now);
                    // Todo: Here we have to send email to every new user with otp. It is pending.
                    await _userRepository.InsertManyAsync(newUserList, true);
                    List<UserDetail> newUserDetailsList = await _userRepository.GetListAsync(x => emailList.Contains(x.Email));
                    string roleName = "Individual";
                    Role role = await _roleRepository.FirstOrDefaultAsync(x => x.Name.Equals(roleName));
                    if (role != null)
                    {
                        List<UserDetailRoleMapping> userRoleMappings = new List<UserDetailRoleMapping>();
                        foreach (UserDetail userDetail in newUserDetailsList)
                        {
                            UserDetailRoleMapping userRoleMapping = new UserDetailRoleMapping();
                            userRoleMapping.UserId = userDetail.Id;
                            userRoleMapping.RoleId = role.Id;
                            userRoleMappings.Add(userRoleMapping);
                        }

                        if (userRoleMappings.Count > 0)
                        {
                            await _userRoleMappingRepository.InsertManyAsync(userRoleMappings);
                        }
                    }
                    else
                    {
                        throw new UserFriendlyException(_localizer["NoRoleAdded"], StatusCodes.Status404NotFound.ToString());
                    }
                }               
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Method to get current logged in user.
        /// </summary>
        /// <returns></returns>
        public async Task<string> GetCurrentLoggedInEmailAsync()
        {
            HttpContext httpContext = _httpContextAccessor.HttpContext;

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

            return null; // Email claim not found
        }

        /// <summary>
        /// Method is to save the logedIn log.
        /// </summary>
        /// <param name="email">Iogging user Email.</param>
        /// <returns>Task Empty.</returns>
        public async Task AddLogdetailsAsync(string email)
        {
            LoggedInUser loggedIndetails = new LoggedInUser
            {
                LoggedIn = DateTime.Now,
            };
            UserDetail userDetais = await _userRepository.FirstOrDefaultAsync(x => x.Email == email);
            if (userDetais == null)
            {
                Company companyDetails = await _companyRepository.FirstAsync(x => x.Email == email);
                loggedIndetails.CompanyId = companyDetails.Id;
            }
            else
            {
                loggedIndetails.UserId = userDetais.Id;
            }
            await _loggedInUserRepository.InsertAsync(loggedIndetails, true);
        }

    }
}
