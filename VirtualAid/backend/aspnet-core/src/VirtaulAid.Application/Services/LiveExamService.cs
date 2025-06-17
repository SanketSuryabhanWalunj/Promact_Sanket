using Amazon.SimpleEmail.Model;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.LiveExam;
using VirtaulAid.DTOs.User;
using VirtaulAid.Exams;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Permissions;
using VirtaulAid.Roles;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Individual, Admin, Super Admin")]
    public class LiveExamService : ApplicationService, ILiveExamService
    {
        private readonly IRepository<LiveExamDetails> _liveExamDetailRepository;
        private readonly IRepository<Course> _courseRepository;
        private readonly IRepository<UserDetail> _userDetailsRepository;
        private readonly CourseDomainService _courseDomainService;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IMapper _mapper;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IConfiguration _configuration;
        private readonly ITemplateAppService _templateAppService;
        private readonly EmailService _emailService;
        private readonly IRepository<UserDetailRoleMapping> _userRoleMappingRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IRepository<Company> _companyRepository;

        public LiveExamService(IRepository<LiveExamDetails> liveExamDetailRepository,
            IRepository<Course> courseRepository,
            IMapper mapper,
            IStringLocalizer<VirtaulAidResource> localizer,
            CourseDomainService courseDomainService,
            IRepository<UserCourseEnrollments> userCourseEnrollmentRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IRepository<UserDetail> userDetailsRepository,
            IConfiguration configuration,
            ITemplateAppService templateAppService,
            EmailService emailService,
            IRepository<UserDetailRoleMapping> userRoleMappingRepository,
            IRepository<Role> roleRepository,
            IRepository<Company> companyRepository)
        {
            _liveExamDetailRepository = liveExamDetailRepository;
            _courseRepository = courseRepository;
            _mapper = mapper;
            _localizer = localizer;
            _courseDomainService = courseDomainService;
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _userDetailsRepository = userDetailsRepository;
            _configuration = configuration;
            _templateAppService = templateAppService;
            _emailService = emailService;
            _userRoleMappingRepository = userRoleMappingRepository;
            _roleRepository = roleRepository;
            _companyRepository = companyRepository;
        }


        /// <summary>
        /// Method is for add the live exam details.
        /// </summary>
        /// <param name="reqLiveExamDetailsDto">Live exam details dto.</param>
        /// <returns>Added new live exam record.</returns>
        /// <exception cref="UserFriendlyException">Course not exist.</exception>
        [Authorize(VirtaulAidPermissions.LiveExam.Create)]
        public async Task<ResLiveExamDetailsDto> AddLiveExamDetailsAsync(ReqLiveExamDetailsDto reqLiveExamDetailsDto)
        {
            Course? courseDetails = await _courseRepository.FirstOrDefaultAsync(x => x.Id == reqLiveExamDetailsDto.CourseId);
            if (courseDetails == null)
                throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());

            reqLiveExamDetailsDto.ExamDate = DateTime.ParseExact(reqLiveExamDetailsDto.ExamDate.ToString(_localizer["LiveExamDateFormat"]), _localizer["LiveExamDateFormat"], CultureInfo.InvariantCulture);

            LiveExamDetails? existLiveExamDetails = await _liveExamDetailRepository.FirstOrDefaultAsync(x => x.CourseId == reqLiveExamDetailsDto.CourseId && x.ExamDate == reqLiveExamDetailsDto.ExamDate);
            if (existLiveExamDetails != null)
                throw new UserFriendlyException(_localizer["LiveExamExist"], StatusCodes.Status406NotAcceptable.ToString());

            LiveExamDetails liveExamDetails = _mapper.Map<LiveExamDetails>(reqLiveExamDetailsDto);
            liveExamDetails.RemaningSeatsCount = liveExamDetails.AllocatedSeatsCount;
            LiveExamDetails resLiveExamDetail = await _liveExamDetailRepository.InsertAsync(liveExamDetails, true);
            return _mapper.Map<ResLiveExamDetailsDto>(resLiveExamDetail);
        }

        /// <summary>
        /// Method is to update the live exam details.
        /// </summary>
        /// <param name="liveExamId">Live exam Id.</param>
        /// <param name="seatsCount">Updated seats count.</param>
        /// <returns>Updated live exam record.</returns>
        /// <exception cref="UserFriendlyException">Live exam not exist.</exception>
        [Authorize(VirtaulAidPermissions.LiveExam.Edit)]
        public async Task<ResLiveExamDetailsDto> UpdateLiveExamDetailsAsync(int liveExamId, int seatsCount)
        {
            LiveExamDetails liveExamDetails = await _liveExamDetailRepository.FirstOrDefaultAsync(x => x.Id == liveExamId);
            if (liveExamDetails == null)
                throw new UserFriendlyException(_localizer["LiveExamNotExist"], StatusCodes.Status404NotFound.ToString());

            if (seatsCount < (liveExamDetails.AllocatedSeatsCount - liveExamDetails.RemaningSeatsCount))
            {
                throw new UserFriendlyException(_localizer["LiveExamSeatsNotValid"], StatusCodes.Status403Forbidden.ToString());
            }
            else
            {
                liveExamDetails.RemaningSeatsCount += (seatsCount - liveExamDetails.AllocatedSeatsCount);
                liveExamDetails.AllocatedSeatsCount = seatsCount;
                LiveExamDetails resLiveExamDetail = await _liveExamDetailRepository.UpdateAsync(liveExamDetails, true);
                return _mapper.Map<ResLiveExamDetailsDto>(resLiveExamDetail);
            }
        }

        /// <summary>
        /// Method is to get the live exam schedule list.
        /// </summary>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>List of live exam details.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<List<ResLiveExamDetailsDto>> GetLiveExamScheduleListAsync(int pageNo, int pageSize)
        {
            List<LiveExamDetails> liveExamScheduleListAsync = await _liveExamDetailRepository.GetListAsync();
            List<LiveExamDetails> liveExamScheduleList = liveExamScheduleListAsync.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            return _mapper.Map<List<ResLiveExamDetailsDto>>(liveExamScheduleList);
        }

        /// <summary>
        /// Method is to get the list of perticular course.
        /// </summary>
        /// <param name="courseId">Course ID for the filter.</param>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>List of live exam details.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<List<ResLiveExamDetailsDto>> GetLiveExamListByCourseAsync(Guid courseId, int pageNo, int pageSize)
        {
            List<LiveExamDetails> liveExamScheduleListAsync = await _liveExamDetailRepository.GetListAsync(x => x.CourseId == courseId);
            List<LiveExamDetails> liveExamScheduleList = liveExamScheduleListAsync.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            return _mapper.Map<List<ResLiveExamDetailsDto>>(liveExamScheduleList);
        }

        /// <summary>
        /// Method is to get the perticular course and feature list of schedule live exam.
        /// </summary>
        /// <param name="courseId">Course ID for the filter.</param>
        /// <returns>List of live exam details.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<List<ResLiveExamDetailsDto>> GetLiveExamFeatureListByCourseAsync(Guid courseId)
        {
            List<LiveExamDetails> liveExamScheduleList = await _liveExamDetailRepository.GetListAsync(x => x.CourseId == courseId && x.ExamDate > DateTime.Today);
            return _mapper.Map<List<ResLiveExamDetailsDto>>(liveExamScheduleList);
        }

        /// <summary>
        /// Method is to use the user can select the date for live exam.
        /// </summary>
        /// <param name="courseId">Course id that user wants to give live exam.</param>
        /// <returns> List of dated with details.</returns>
        public async Task<List<ResLiveExamDetailsDto>> GetUserLiveExamListByCourseAsync(Guid courseId)
        {
            List<LiveExamDetails> liveExamScheduleList = await _liveExamDetailRepository.GetListAsync(x => x.CourseId == courseId && x.ExamDate > DateTime.Today && x.RemaningSeatsCount > 0);
            return _mapper.Map<List<ResLiveExamDetailsDto>>(liveExamScheduleList);
        }

        /// <summary>
        /// Method is to get the perticulr record of live exam details.
        /// </summary>
        /// <param name="liveExamId"> live exam details id for get the perticular record.</param>
        /// <returns>Live exam details.</returns>
        /// <exception cref="UserFriendlyException">Live exam not exist.</exception>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<ResLiveExamDetailsDto> GetLiveExamByIdAsync(int liveExamId)
        {
            LiveExamDetails liveExamDetails = await _liveExamDetailRepository.FirstOrDefaultAsync(x => x.Id == liveExamId);
            if (liveExamDetails == null)
                throw new UserFriendlyException(_localizer["LiveExamNotExist"], StatusCodes.Status404NotFound.ToString());

            return _mapper.Map<ResLiveExamDetailsDto>(liveExamDetails);
        }

        /// <summary>
        /// Method is to delete the perticular record.
        /// </summary>
        /// <param name="liveExamId">Live exam id that we want to delete.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Delete)]
        public async Task DeleteLiveExamByIdAsync(int liveExamId)
        {
            LiveExamDetails liveExamDetails = await _liveExamDetailRepository.FirstOrDefaultAsync(x => x.Id == liveExamId);
            if (liveExamDetails == null)
                throw new UserFriendlyException(_localizer["LiveExamNotExist"], StatusCodes.Status404NotFound.ToString());

            if (liveExamDetails.AllocatedSeatsCount == liveExamDetails.RemaningSeatsCount)
            {
                await _liveExamDetailRepository.DeleteDirectAsync(x => x.Id == liveExamId);
            }
            else
            {
                throw new UserFriendlyException(_localizer["LiveExamNotBeDeleted"], StatusCodes.Status403Forbidden.ToString());
            }

        }

        /// <summary>
        /// Method is to add the live exam date request.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="courseId">Course id.</param>
        /// <param name="requestedDate">Requested exam date.</param>
        /// <returns>Updated user course enrollemt record.</returns>
        /// <exception cref="UserFriendlyException">Live exam seats are full.</exception>
        [Authorize(VirtaulAidPermissions.LiveExam.Edit)]
        public async Task<UserCourseEnrollmentDto> SendLiveExamDateRequestAsync(Guid userId, Guid courseId, DateTime requestedDate, string culture)
        {
            DateTime reqDate = DateTime.ParseExact(requestedDate.ToString(_localizer["LiveExamDateFormat"]), _localizer["LiveExamDateFormat"], CultureInfo.InvariantCulture);
            LiveExamDetails liveExamDetails = await _liveExamDetailRepository.FirstOrDefaultAsync(x => x.ExamDate == reqDate && x.CourseId == courseId);
            if (liveExamDetails == null)
                throw new UserFriendlyException(_localizer["LiveExamNotExist"], StatusCodes.Status404NotFound.ToString());

            if (liveExamDetails.RemaningSeatsCount > 0)
            {
                UserCourseEnrollments userCourseEnrollment = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId.ToString(), courseId.ToString(), "Live");
                userCourseEnrollment.LiveExamDate = requestedDate;
                userCourseEnrollment.IsLiveExamDateApproved = null;
                UserCourseEnrollments updatedCourseEnrollment = await _userCourseEnrollmentRepository.UpdateAsync(userCourseEnrollment, true);
                liveExamDetails.RemaningSeatsCount = liveExamDetails.RemaningSeatsCount - 1;
                await _liveExamDetailRepository.UpdateAsync(liveExamDetails, true);

                // sending the live Exam request mail to all admins and super admins.
                UserDetail userDetail = await _userDetailsRepository.FirstAsync(x => x.Id == userId);
                Course? courseDetails = await _courseRepository.FirstOrDefaultAsync(x => x.Id == courseId);
                List<UserDetail> adminList = await GetAllAdminAsync();
                string? uiEnviremntUrl = _configuration["App:ClientUrl"].ToString();
                string logInUrl = $"{uiEnviremntUrl}/login/";
                if (userDetail.CurrentCompanyId == null)
                {
                    string templateName = _localizer["LiveExamRequestWithoutCompany"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateName = templateName + "_" + culture;
                    }
                    Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                    foreach (UserDetail admin in adminList)
                    {
                        string htmlBody = emailTemplateContent.HtmlPart.Replace("$$ADMIN$$", admin.FirstName).Replace("$$LOGIN_URL$$", logInUrl).Replace("$$INDIVIDUAL$$", $"{userDetail.FirstName} {userDetail.LastName}").Replace("$$COURSE$$", courseDetails.Name).Replace("$$DATE$$", reqDate.ToString(_localizer["LiveExamDateFormat"]));
                        await _emailService.SendEmailAsync(admin.Email, htmlBody, emailTemplateContent.SubjectPart);
                    }

                }
                else
                {
                    Company companyDetails = await _companyRepository.FirstAsync(x => x.Id == userDetail.CurrentCompanyId);
                    string templateName = _localizer["LiveExamRequestWithCompany"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateName = templateName + "_" + culture;
                    }
                    Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                    foreach (UserDetail admin in adminList)
                    {
                        string htmlBody = emailTemplateContent.HtmlPart.Replace("$$ADMIN$$", admin.FirstName).Replace("$$LOGIN_URL$$", logInUrl).Replace("$$INDIVIDUAL$$", $"{userDetail.FirstName} {userDetail.LastName}").Replace("$$COMPANY$$", companyDetails.CompanyName).Replace("$$COURSE$$", courseDetails.Name).Replace("$$DATE$$", reqDate.ToString(_localizer["LiveExamDateFormat"]));
                        await _emailService.SendEmailAsync(admin.Email, htmlBody, emailTemplateContent.SubjectPart);
                    }

                }

                return _mapper.Map<UserCourseEnrollmentDto>(updatedCourseEnrollment);
            }
            else
            {
                throw new UserFriendlyException(_localizer["LiveExamSeatsFull"], StatusCodes.Status403Forbidden.ToString());
            }
        }

        /// <summary>
        /// Method is to get the all pending live exam request of user.
        /// </summary>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>Return the list of live exam date pending user List.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<List<ResLiveExamPendingReqDto>> GetPendingLiveExamDateRequestAsync(int pageNo, int pageSize)
        {
            List<UserCourseEnrollments> pendingRequestListAsync = (await _userCourseEnrollmentRepository.WithDetailsAsync(x => x.User)).AsQueryable().Where(x => x.LiveExamDate != null).ToList();
            List<UserCourseEnrollments> pendingRequestList = pendingRequestListAsync.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionList = (await _courseSubscriptionRepository.WithDetailsAsync(x => x.Course)).AsQueryable().Where(s => pendingRequestList.Select(b => b.CourseSubscriptionId).Contains(s.Id)).ToList();
            List<ResLiveExamPendingReqDto> examPendingList = new();

            foreach (UserCourseEnrollments pendingRequest in pendingRequestList)
            {
                CourseSubscriptionMapping? courseSubscription = courseSubscriptionList.Find(x => x.Id == pendingRequest.CourseSubscriptionId);
                examPendingList.Add(new ResLiveExamPendingReqDto
                {
                    UserCourseEnrollments = _mapper.Map<UserCourseEnrollmentDto>(pendingRequest),
                    CourseDetail = _mapper.Map<ResCourseDetailDto>(courseSubscription.Course),
                });
            }

            return examPendingList;
        }

        /// <summary>
        /// Method is to Accept or reject the user live exam date.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="courseId">Course id.</param>
        /// <param name="userCourseEnrollmentId">user Course Enrollment Id.</param>
        /// <param name="isAccepted">If Accepted then true otherwise false.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Edit)]
        public async Task AcceptRejectLiveExamDateAsync(Guid userId, Guid courseId, int userCourseEnrollmentId, bool isAccepted, string culture)
        {
            UserCourseEnrollments userCourseEnrollment = await _userCourseEnrollmentRepository.FirstAsync(x => x.Id == userCourseEnrollmentId && x.UserId == userId);
            UserDetail userDetail = await _userDetailsRepository.FirstAsync(x => x.Id == userId);
            Course? courseDetails = await _courseRepository.FirstOrDefaultAsync(x => x.Id == courseId);
            Company? companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == userDetail.CurrentCompanyId);
            string? requestedDate = userCourseEnrollment.LiveExamDate?.ToString(_localizer["LiveExamDateFormat"]);
            string? uiEnviremntUrl = _configuration["App:ClientUrl"]?.ToString();
            string logInUrl = $"{uiEnviremntUrl}/login/";

            if (isAccepted)
            {
                userCourseEnrollment.IsLiveExamDateApproved = true;
                userCourseEnrollment.LiveExamDateApprovedDate = DateTime.Now;

                // send the live exam date accepted mail to user.
                string templateName = _localizer["LiveExamRequestApprovedIndividual"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                Template emailTemplateContentIndividual = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                string htmlBodyIndividual = emailTemplateContentIndividual.HtmlPart.Replace("$$LOGIN_URL$$", logInUrl).Replace("$$INDIVIDUAL$$", $"{userDetail.FirstName} {userDetail.LastName}").Replace("$$COURSE$$", courseDetails.Name).Replace("$$DATE$$", requestedDate);
                await _emailService.SendEmailAsync(userDetail.Email, htmlBodyIndividual, emailTemplateContentIndividual.SubjectPart);

                // send the live exam date accepted mail to company (if he is aligned with any company).
                if (userDetail.CurrentCompanyId != null)
                {
                    string templateNameForCompanyMail = _localizer["LiveExamRequestApprovedCompany"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateNameForCompanyMail = templateNameForCompanyMail + "_" + culture;
                    }
                    Template emailTemplateContentCompany = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateNameForCompanyMail);
                    string htmlBodyCompany = emailTemplateContentCompany.HtmlPart.Replace("$$LOGIN_URL$$", logInUrl).Replace("$$COMPANY$$", companyDetails.CompanyName).Replace("$$INDIVIDUAL$$", $"{userDetail.FirstName} {userDetail.LastName}").Replace("$$COURSE$$", courseDetails.Name).Replace("$$DATE$$", requestedDate);
                    await _emailService.SendEmailAsync(companyDetails.Email, htmlBodyCompany, emailTemplateContentCompany.SubjectPart);
                }

            }
            else
            {
                LiveExamDetails liveExamDetails = await _liveExamDetailRepository.FirstOrDefaultAsync(x => x.ExamDate == userCourseEnrollment.LiveExamDate && x.CourseId == courseId);
                liveExamDetails.RemaningSeatsCount = (liveExamDetails.RemaningSeatsCount + 1);
                await _liveExamDetailRepository.UpdateAsync(liveExamDetails, true);
                userCourseEnrollment.IsLiveExamDateApproved = false;
                userCourseEnrollment.LiveExamDate = null;

                // send the live exam date rejected mail to user.
                string templateName = _localizer["LiveExamRequestRejectedIndividual"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                Template emailTemplateContentIndividual = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                string htmlBodyIndividual = emailTemplateContentIndividual.HtmlPart.Replace("$$LOGIN_URL$$", logInUrl).Replace("$$INDIVIDUAL$$", $"{userDetail.FirstName} {userDetail.LastName}").Replace("$$COURSE$$", courseDetails.Name).Replace("$$DATE$$", requestedDate);
                await _emailService.SendEmailAsync(userDetail.Email, htmlBodyIndividual, emailTemplateContentIndividual.SubjectPart);

                // send the live exam date rejected mail to company (if he is aligned with any company).
                if (userDetail.CurrentCompanyId != null)
                {
                    string templateNameForCompanyMail = _localizer["LiveExamRequestRejectedCompany"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateNameForCompanyMail = templateNameForCompanyMail + "_" + culture;
                    }
                    Template emailTemplateContentCompany = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateNameForCompanyMail);
                    string htmlBodyCompany = emailTemplateContentCompany.HtmlPart.Replace("$$LOGIN_URL$$", logInUrl).Replace("$$COMPANY$$", companyDetails.CompanyName).Replace("$$INDIVIDUAL$$", $"{userDetail.FirstName} {userDetail.LastName}").Replace("$$COURSE$$", courseDetails.Name).Replace("$$DATE$$", requestedDate);
                    await _emailService.SendEmailAsync(companyDetails.Email, htmlBodyCompany, emailTemplateContentCompany.SubjectPart);
                }

            }

            await _userCourseEnrollmentRepository.UpdateAsync(userCourseEnrollment, true);
        }

        /// <summary>
        /// Method is to get the live exam date approved user list.
        /// </summary>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>List of user with course and enrollment details.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<List<ResLiveExamPendingReqDto>> GetApprovedUserListAsync(int pageNo, int pageSize)
        {
            List<UserCourseEnrollments> approvedRequestListAsync = (await _userCourseEnrollmentRepository.WithDetailsAsync(x => x.User)).AsQueryable().Where(x => x.LiveExamDate != null && x.IsLiveExamDateApproved == true).ToList();
            List<UserCourseEnrollments> approvedRequestList = approvedRequestListAsync.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionList = (await _courseSubscriptionRepository.WithDetailsAsync(x => x.Course)).AsQueryable().Where(s => approvedRequestList.Select(b => b.CourseSubscriptionId).Contains(s.Id)).ToList();
            List<ResLiveExamPendingReqDto> examApprovedUserList = new();

            foreach (UserCourseEnrollments approvedRequest in approvedRequestList)
            {
                CourseSubscriptionMapping? courseSubscription = courseSubscriptionList.Find(x => x.Id == approvedRequest.CourseSubscriptionId);
                examApprovedUserList.Add(new ResLiveExamPendingReqDto
                {
                    UserCourseEnrollments = _mapper.Map<UserCourseEnrollmentDto>(approvedRequest),
                    CourseDetail = _mapper.Map<ResCourseDetailDto>(courseSubscription.Course),
                });
            }

            return examApprovedUserList;
        }

        /// <summary>
        /// Method is to update the live exam marks.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="userCourseEnrollmentId">user course enrollmet id.</param>
        /// <param name="markes">Markes.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Edit)]
        public async Task AddLiveExamMarkesAsync(Guid userId, int userCourseEnrollmentId, double marks)
        {
            UserCourseEnrollments userCourseEnrollment = await _userCourseEnrollmentRepository.FirstAsync(x => x.Id == userCourseEnrollmentId && x.UserId == userId);
            userCourseEnrollment.LiveExamMarkes = marks;
            userCourseEnrollment.IsCompleted = true;
            userCourseEnrollment.IsLiveExamCompleted = true;
            userCourseEnrollment.CertificateExpirationDate = DateTime.Now.AddMonths(12);
            userCourseEnrollment.Progress = 100;
            await _userCourseEnrollmentRepository.UpdateAsync(userCourseEnrollment, true);
        }

        /// <summary>
        /// Method is to analytics on live exam date requested approved of last 2 weeks.
        /// </summary>
        /// <returns>Count of current week live exam date requested approved and pervcentage of analytics.</returns>
        [Authorize(VirtaulAidPermissions.LiveExam.Default)]
        public async Task<ResLiveExamRequestAnalytics> GetExamDateAcceptedAnalyticsAsync()
        {
            List<UserCourseEnrollments> currentWeekAcceptedList = await _userCourseEnrollmentRepository.GetListAsync(x => x.LiveExamDateApprovedDate > DateTime.Now.AddDays(-7));
            List<UserCourseEnrollments> lastWeekAcceptedList = await _userCourseEnrollmentRepository.GetListAsync(x => x.LiveExamDateApprovedDate >= DateTime.Now.AddDays(-14) && x.LiveExamDateApprovedDate < DateTime.Now.AddDays(-7));

            float percentage = (!lastWeekAcceptedList.Any())
               ? currentWeekAcceptedList.Any() ? 100 : 0
               : ((float)(currentWeekAcceptedList.Count - lastWeekAcceptedList.Count) / (float)lastWeekAcceptedList.Count) * 100;

            return new ResLiveExamRequestAnalytics
            {
                AnalyticsPercentage = percentage < 0 ?
                    percentage < (-100) ? "-100" : percentage.ToString("0")
                    : percentage > 100 ? "100" : percentage.ToString("0"),
                ExamDateAcceptedCount = currentWeekAcceptedList.Count,
            };
        }

        /// <summary>
        /// Method is for get the lis of all admin.
        /// </summary>
        /// <returns>Admin list.</returns>
        private async Task<List<UserDetail>> GetAllAdminAsync()
        {
            List<Role> roleDetailsList = await _roleRepository.GetListAsync(x => x.Name == "Admin" || x.Name == "Super Admin");
            List<UserDetailRoleMapping> userRoleMappingList = await _userRoleMappingRepository.GetListAsync(x => roleDetailsList.Select(r => r.Id).Contains(x.RoleId));
            List<UserDetail> adminList = await _userDetailsRepository.GetListAsync(x => userRoleMappingList.Select(u => u.UserId).Contains(x.Id));
            return adminList;
        }
    }
}
