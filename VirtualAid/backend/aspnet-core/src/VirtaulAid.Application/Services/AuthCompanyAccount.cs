using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Company;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{
    public class AuthCompanyAccount : ApplicationService, IAuthCompanyAccount
    {

        private readonly IRepository<Company> _companyRepository;
        private readonly IMapper _mapper;
        private readonly CompanyService _companyService;
        private readonly UserService _userService;
        private readonly EmailOtpService _emailOtpService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IUtilityService _utilityService;
        private readonly OtpService _otpService;   

        public AuthCompanyAccount(IRepository<Company> companyRepository,
            CompanyService companyService,
            UserService userService,
            EmailOtpService emailOtpService,
            OtpService otpService,
            IMapper mapper,
            IStringLocalizer<VirtaulAidResource> localizer,
            IUtilityService utilityService)
        {
            _companyRepository = companyRepository;
            _mapper = mapper;
            _companyService = companyService;
            _userService = userService;
            _emailOtpService = emailOtpService;
            _otpService = otpService;
            _localizer = localizer;
            _utilityService = utilityService;
        }


        /// <summary>
        /// Method is to registration of the company.
        /// </summary>
        /// <param name="reqCompanyRegistraionDto">Parameter dto.</param>
        /// <returns>Task Dto.</returns>
        /// <exception cref="UserFriendlyException">Email already exist.</exception>
        public async Task<ResCompanyDto> CompanyRegistrationAsync(ReqCompanyRegistrationDto reqCompanyRegistraionDto, string culture)
        {
            // Convert first letter of email to lower case by default
            reqCompanyRegistraionDto.Email = await _utilityService.ConvertFirstCharToLowerCaseAsync(reqCompanyRegistraionDto.Email);

            // Checks the company email id is already present or not.
            bool isEmailPresent = await _userService.IsSoftDeleteUserAsync(reqCompanyRegistraionDto.Email) || await _companyService.IsSoftDeleteCompanyAsync(reqCompanyRegistraionDto.Email);
            if (isEmailPresent)
            {
                throw new UserFriendlyException(_localizer["EmailExist"], StatusCodes.Status409Conflict.ToString());
            }
            Company company = _mapper.Map<Company>(reqCompanyRegistraionDto);
            // It will be used for verification by admin or super admin.
            company.IsVerified = false;

            //On true value, This will indicate that though it is not verified by admin. But still this company can access resource on our platform. 
            company.IsDeleted = false;
            Company companyResult = await _companyRepository.InsertAsync(company, autoSave: true);

            // Send OTP with registerd email id.
            if (companyResult.Id != Guid.Empty)
            {
                string otp = _emailOtpService.GenrateOtp();
                string templateName = _localizer["WelcomeTemplate"];
                if(culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                await _emailOtpService.SendEmailAsync(companyResult.Email, otp, companyResult.CompanyName, templateName);

                // We have exclude this part for now. As we are sending welcome mail now instead of sending otp mail.
                //await _otpService.AddOtpAsync(companyResult.Email, otp);
            }
            return _mapper.Map<ResCompanyDto>(companyResult);
        }

    }
}
