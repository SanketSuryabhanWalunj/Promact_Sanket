using Amazon.SimpleEmail.Model;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.Interfaces;
using VirtaulAid.Roles;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.BackgroundWorkers.Quartz;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid
{
    public class CertificateExpireMailScheduler : QuartzBackgroundWorkerBase
    {
        private readonly IReadOnlyRepository<UserCourseEnrollments> _courseEnrollmentRepository;
        private readonly IReadOnlyRepository<UserDetail> _userRepository;
        private readonly IReadOnlyRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IReadOnlyRepository<Course> _courseRepository;
        private readonly IReadOnlyRepository<Company> _companieRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleMappingRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IDataFilter<ISoftDelete> _softDeleteFilter;
        private readonly IConfiguration _configuration;
        private readonly ITemplateAppService _templateAppService;
        private readonly EmailService _emailService;

        public CertificateExpireMailScheduler(IRepository<UserCourseEnrollments> courseEnrollmentRepository,
            IRepository<UserDetail> userRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IRepository<Course> courseRepository,
            IRepository<Company> companieRepository,
            IRepository<UserDetailRoleMapping> userRoleMappingRepository,
            IRepository<Role> roleRepository,
            IDataFilter<ISoftDelete> softDeleteFilter,
            IConfiguration configuration,
            ITemplateAppService templateAppService,
            EmailService emailService)
        {
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _userRepository = userRepository;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _courseRepository = courseRepository;
            _companieRepository = companieRepository;
            _roleRepository = roleRepository;
            _userRoleMappingRepository = userRoleMappingRepository;
            _softDeleteFilter = softDeleteFilter;
            _configuration = configuration;
            _templateAppService = templateAppService;
            _emailService = emailService;
            JobDetail = JobBuilder.Create<CertificateExpireMailScheduler>().WithIdentity(nameof(CertificateExpireMailScheduler)).Build();
            Trigger = TriggerBuilder.Create()
                .WithIdentity(nameof(CertificateExpireMailScheduler)).WithSchedule(CronScheduleBuilder.DailyAtHourAndMinute(21, 17)).Build();
        }


        public override async Task Execute(IJobExecutionContext context)
        {
            await SendCertificateExpireMailAsync();
        }

        /// <summary>
        /// Method is for send the course certificate expire notification to individual, company(If asociated with company), admin and governor 
        /// </summary>
        /// <returns>Task.</returns>
        private async Task SendCertificateExpireMailAsync()
        {
            DateTime todaysSatrtDateTime = DateTime.Today;
            DateTime todaysEndDateTime = todaysSatrtDateTime.AddMinutes(1439);
            List<UserCourseEnrollments> certificateExpireUserList = await _courseEnrollmentRepository.GetListAsync(x => x.CertificateExpirationDate >= todaysSatrtDateTime && x.CertificateExpirationDate <= todaysEndDateTime);
            List<UserDetail> userDetailList = new();
            List<Company> companyList = new();
            using (_softDeleteFilter.Disable())
            {
                userDetailList = await _userRepository.GetListAsync(x => certificateExpireUserList.Select(a => a.UserId).Contains(x.Id));
                companyList = await _companieRepository.GetListAsync(x => userDetailList.Select(a => a.CurrentCompanyId).Contains(x.Id));
            }
            List<CourseSubscriptionMapping> courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => certificateExpireUserList.Select(a => a.CourseSubscriptionId).Contains(x.Id));
            List<Course> courseList = await _courseRepository.GetListAsync(x => courseSubscriptionList.Select(a => a.CourseId).Contains(x.Id));
            List<UserDetail> governorList = await GetAllGovernorAsync();
            List<UserDetail> adminList = await GetAllAdminAsync();
            List<UserDetail> adminAndGovernorList = new(); // Merge the governor user list and admin user list.
            adminAndGovernorList.AddRange(governorList);
            adminAndGovernorList.AddRange(adminList);

            foreach (UserCourseEnrollments courseEnrollment in certificateExpireUserList)
            {
                UserDetail userDetail = userDetailList.First(x => x.Id == courseEnrollment.UserId);
                CourseSubscriptionMapping courseSubscriptionDetails = courseSubscriptionList.First(x => x.Id == courseEnrollment.CourseSubscriptionId);
                Course courseDetails = courseList.First(x => x.Id == courseSubscriptionDetails.CourseId);
                await SendMailToIndividualAsync(userDetail.Email, userDetail.FirstName, courseDetails.Name);
                if (userDetail.CurrentCompanyId != null)
                {
                    Company company = companyList.First(x => x.Id == userDetail.CurrentCompanyId);
                    await SendMailToComapnyAsync(company.Email, $"{userDetail.FirstName} {userDetail.LastName}", courseDetails.Name, company.CompanyName, courseEnrollment.CourseEndDate.ToString("dd/MM/yyyy"));
                    foreach (UserDetail user in adminAndGovernorList)
                    {
                        await SendMailToAdminGovernorAsociatedWithCompanyAsync(user.FirstName, user.Email, $"{userDetail.FirstName} {userDetail.LastName}", company.CompanyName, courseDetails.Name, courseEnrollment.CourseEndDate.ToString("dd/MM/yyyy"));
                    }

                }
                else
                {
                    foreach (UserDetail user in adminAndGovernorList)
                    {
                        await SendMailToAdminGovernorAsync(user.FirstName, user.Email, $"{userDetail.FirstName} {userDetail.LastName}", courseDetails.Name, courseEnrollment.CourseEndDate.ToString("dd/MM/yyyy"));
                    }
                }
            }
        }

        /// <summary>
        /// Method is to send the mail to individual user for certificate expiry notification.
        /// </summary>
        /// <param name="userEmail">Individul Email.</param>
        /// <param name="userName">Individual Name.</param>
        /// <param name="courseName">Course name.</param>
        /// <returns>Task.</returns>
        private async Task SendMailToIndividualAsync(string userEmail, string userName, string courseName)
        {
            string? uiEnviremntUrl = _configuration["App:ClientUrl"].ToString();
            string logInUrl = $"{uiEnviremntUrl}/login/";
            // Get the SES template content
            Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync("CertificateExpireIndividualTemplate");
            // Replace placeholders with actual data
            string htmlBody = emailTemplateContent.HtmlPart.Replace("$$NAME$$", userName).Replace("$$LOGIN_URL$$", logInUrl).Replace("$$COURSENAME$$", courseName);

            await _emailService.SendEmailAsync(userEmail, htmlBody, emailTemplateContent.SubjectPart);
        }

        /// <summary>
        /// Method is to send the mail to company for certificate expiry notification.
        /// </summary>
        /// <param name="receiverEmail">Company email.</param>
        /// <param name="individualName">Individual name.</param>
        /// <param name="companyName">Asociated company name.</param>
        /// <param name="courseName"> Expire certificate course name.</param>
        /// <param name="date">Certificatre earned date.</param>
        /// <returns>Task.</returns>
        private async Task SendMailToComapnyAsync(string receiverEmail, string individualName, string courseName, string companyName, string date)
        {
            string? uiEnviremntUrl = _configuration["App:ClientUrl"].ToString();
            string logInUrl = $"{uiEnviremntUrl}/login/";
            // Get the SES template content
            Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync("CertificateExpireCompanyTemplate");
            // Replace placeholders with actual data
            string htmlBody = emailTemplateContent.HtmlPart.Replace("$$COMPANY$$", companyName).Replace("$$LOGIN_URL$$", logInUrl).Replace("$$COURSENAME$$", courseName).Replace("$$INDIVIDUAL$$", individualName).Replace("$$DATE$$", date);

            await _emailService.SendEmailAsync(receiverEmail, htmlBody, emailTemplateContent.SubjectPart);
        }

        /// <summary>
        /// Method is for send the mail to governor and admin for thos Individual are not asociated with company.
        /// </summary>
        /// <param name="reciverName">Admin or governor name.</param>
        /// <param name="receiverEmail">Admin or governor email.</param>
        /// <param name="individualName">Individual name.</param>
        /// <param name="courseName"> Expire certificate course name.</param>
        /// <param name="date">Certificatre earned date.</param>
        /// <returns>Task.</returns>
        private async Task SendMailToAdminGovernorAsync(string reciverName, string receiverEmail, string individualName, string courseName, string date)
        {
            // Get the SES template content
            Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync("AdminCertificateExpireUserTemplate");
            // Replace placeholders with actual data
            string htmlBody = emailTemplateContent.HtmlPart.Replace("$$RECIVERNAME$$", reciverName).Replace("$$INDIVIDUAL$$", individualName).Replace("$$COURSENAME$$", courseName).Replace("$$DATE$$", date);

            await _emailService.SendEmailAsync(receiverEmail, htmlBody, emailTemplateContent.SubjectPart);
        }

        /// <summary>
        /// Method is for send the mail to governor and admin for thos Individual are asociated with company.
        /// </summary>
        /// <param name="reciverName">Admin or governor name.</param>
        /// <param name="receiverEmail">Admin or governor email.</param>
        /// <param name="individualName">Individual name.</param>
        /// <param name="companyName">Asociated company name.</param>
        /// <param name="courseName"> Expire certificate course name.</param>
        /// <param name="date">Certificatre earned date.</param>
        /// <returns>Task.</returns>
        private async Task SendMailToAdminGovernorAsociatedWithCompanyAsync(string reciverName, string receiverEmail, string individualName, string companyName, string courseName, string date)
        {
            // Get the SES template content
            Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync("AdminCertificateExpireUserAsociatedWithCompanyTemplate");
            // Replace placeholders with actual data
            string htmlBody = emailTemplateContent.HtmlPart.Replace("$$RECIVERNAME$$", reciverName).Replace("$$INDIVIDUAL$$", individualName).Replace("$$COMPANY$$", companyName).Replace("$$COURSENAME$$", courseName).Replace("$$DATE$$", date);

            await _emailService.SendEmailAsync(receiverEmail, htmlBody, emailTemplateContent.SubjectPart);
        }

        /// <summary>
        /// Method is to get the governor list.
        /// </summary>
        /// <returns>Governor list.</returns>
        private async Task<List<UserDetail>> GetAllGovernorAsync()
        {
            Role roleDetails = await _roleRepository.GetAsync(a => a.Name.Equals("Governor"));
            List<UserDetailRoleMapping> userRoleMapping = await _userRoleMappingRepository.GetListAsync(x => x.RoleId == roleDetails.Id);
            List<UserDetail> governorList = await _userRepository.GetListAsync(x => userRoleMapping.Select(u => u.UserId).Contains(x.Id));
            return governorList;
        }

        /// <summary>
        /// Method is for get the lis of all admin.
        /// </summary>
        /// <returns>Admin list.</returns>
        private async Task<List<UserDetail>> GetAllAdminAsync()
        {
            List<Role> roleDetailsList = await _roleRepository.GetListAsync(x => x.Name == "Admin" || x.Name == "Super Admin");           
            List<UserDetailRoleMapping> userRoleMappingList = await _userRoleMappingRepository.GetListAsync(x => roleDetailsList.Select(r => r.Id).Contains(x.RoleId));
            List<UserDetail> adminList = await _userRepository.GetListAsync(x => userRoleMappingList.Select(u => u.UserId).Contains(x.Id));
            return adminList;
        }
    }
}

