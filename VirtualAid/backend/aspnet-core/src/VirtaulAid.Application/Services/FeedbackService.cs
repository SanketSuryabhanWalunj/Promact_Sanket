using Amazon.SimpleEmail.Model;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Localization;
using Stripe;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Feedback;
using VirtaulAid.Enums;
using VirtaulAid.Feedbacks;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{
    public class FeedbackService : ApplicationService, IFeedbackService
    {
        private readonly IRepository<Feedback> _feedbackRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IUtilityService _utilityService;
        private readonly IRepository<UserDetail> _userDetailRepository;
        private readonly IRepository<Company> _companyRepository;
        private readonly IMapper _mapper;
        private readonly EmailService _emailService;
        private readonly ITemplateAppService _templateAppService;
        private readonly IConfiguration _configuration;
        private readonly AdminReportDomainService _adminReportDomainService;

        public FeedbackService(IRepository<Feedback> feedbackRepository, IStringLocalizer<VirtaulAidResource> localizer, IUtilityService utilityService, IRepository<UserDetail> userDetailRepository, IRepository<Company> companyRepository, IMapper mapper, EmailService emailService, ITemplateAppService templateAppService, IConfiguration configuration, AdminReportDomainService adminReportDomainService)
        {
            _feedbackRepository = feedbackRepository;
            _localizer = localizer;
            _utilityService = utilityService;
            _userDetailRepository = userDetailRepository;
            _companyRepository = companyRepository;
            _mapper = mapper;
            _emailService = emailService;
            _templateAppService = templateAppService;
            _configuration = configuration;
            _adminReportDomainService = adminReportDomainService;
        }

        /// <summary>
        /// Method to add feedback
        /// </summary>
        /// <param name="req">feedback object</param>
        /// <returns>feedback object</returns>
        /// <exception cref="UserFriendlyException">throws exception when feedback provider details does not exist</exception>
        public async Task<ResFeedbackDto> AddFeedback([FromForm]ReqAddFeedbackDto req, string culture)
        {
            Feedback feedback = new();
            feedback.Message = req.Message.Replace(',', ' ');

            UserDetail user = null;
            Company company = null;

            if(req.UserId != null)
            {
                feedback.UserId = req.UserId;
                user = await _userDetailRepository.FirstOrDefaultAsync(x => x.Id == req.UserId);
                if(user == null)
                {
                    throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
                }
                feedback.FeedbackProviderName = $"{user.FirstName} {user.LastName}";
                feedback.FeedbackProviderEmail = user.Email;
            }
            else if(req.CompanyId != null)
            {
                feedback.CompanyId = req.CompanyId;
                company = await _companyRepository.FirstOrDefaultAsync(x => x.Id == req.CompanyId);
                if (company == null)
                {
                    throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
                }
                feedback.FeedbackProviderName = company.CompanyName;
                feedback.FeedbackProviderEmail = company.Email;
            }

            if(req.Platform == "UserPlatform")
            {
                feedback.Platform = PlatformOptions.UserPlatform.ToString();
            } 
            else if(req.Platform == "AdminPlatform")
            {
                feedback.Platform = PlatformOptions.AdminPlatform.ToString();
            }

            if(req.Category == "Suggestion")
            {
                feedback.Category = FeedbackCategories.Suggestion.ToString();
            }
            else if(req.Category == "BugReport")
            {
                feedback.Category= FeedbackCategories.BugReport.ToString();
            }


            List<string> ScreenShots = new List<string>();
            if (req.FormFiles != null)
            {
                foreach (var (formFile, i) in req?.FormFiles.Select((Value, i) => (Value, i)))
                {
                    FileInfo fileInfo = new FileInfo(formFile.FileName);
                    if ((fileInfo.Extension != ".JPEG" && fileInfo.Extension != ".JPG" && fileInfo.Extension != ".PNG" && fileInfo.Extension != ".jpeg" && fileInfo.Extension != ".jpg" && fileInfo.Extension != ".png") || fileInfo.Extension.Length == 0)
                    {
                        throw new UserFriendlyException(_localizer["ImageFormatNotSupported"], StatusCodes.Status406NotAcceptable.ToString());
                    }
                    string fileName = null;
                    if (user != null)
                    {
                        fileName = $"feedbackImages/{user?.FirstName}_{user?.LastName}_{user?.Email}_ss_{i}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                    }
                    else if (company != null)
                    {
                        fileName = $"feedbackImages/{company?.CompanyName}_{company?.Email}_ss_{i}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                    }
                    var filePath = await _utilityService.UploadAsync(formFile, fileName);
                    string screenShot = $"https://{_configuration.GetSection("AWS").GetSection("Bucket").Value}.s3.{_configuration.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                    ScreenShots.Add(screenShot);
                }
            }
            feedback.ScreenShots = ScreenShots;

            Feedback feedbackResult = new();
            feedbackResult = await _feedbackRepository.InsertAsync(feedback, true);

            //Send Email to all the admins notifying about the feedback received
            string? uiEnviremntUrl = _configuration["App:ClientUrl"]?.ToString();
            string logInUrl = $"{uiEnviremntUrl}/login/";
            string templateName = _localizer["FeedbackNotificationToAdminTemplate"];
            if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
            {
                templateName = templateName + "_" + culture;
            }
            Template feedbackNotificationToAdminTemplate = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
            string htmlBody = feedbackNotificationToAdminTemplate.HtmlPart.Replace("$$LOGIN_URL$$", logInUrl).Replace("$$FEEDBACKPROVIDERNAME$$", $"{feedback.FeedbackProviderName}");
            IList<UserDetail> admins = await _adminReportDomainService.GetAdminAndSuperAdminListAsync();
            List<string> emailsOfAdmins = admins.Select(x => x.Email).ToList();

            await _emailService.SendBulkEmailToAdminForFeedbackNotification(emailsOfAdmins, htmlBody, feedbackNotificationToAdminTemplate.SubjectPart);

            ResFeedbackDto result = _mapper.Map<ResFeedbackDto>(feedbackResult);
            return result;
        }
    }
}
