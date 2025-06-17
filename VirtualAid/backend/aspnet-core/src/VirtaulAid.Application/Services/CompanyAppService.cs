using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using VirtaulAid.DTOs.Company;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System.IO;
using VirtaulAid.DomainServices;
using VirtaulAid.Util;
using VirtaulAid.Permissions;
using Microsoft.Extensions.Localization;
using VirtaulAid.Localization;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using VirtaulAid.Courses;
using System.Linq;
using VirtaulAid.Users;
using VirtaulAid.DTOs.User;

namespace VirtaulAid.Services
{

    [Authorize(Roles = "Company, Individual, Admin, Super Admin")]
    public class CompanyAppService : ApplicationService
    {
        private readonly IRepository<Company, Guid> _dataRepository;
        private readonly IUtilityService _utilityService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly CompanyService _companyService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionMapping;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollments;
        private readonly IRepository<Course> _courseRepository;

        public CompanyAppService(IRepository<Company, Guid> dataRepository,
            IUtilityService utilityService,
             IStringLocalizer<VirtaulAidResource> localizer,
            CompanyService companyService,
            IMapper mapper,
            IConfiguration config,
            IRepository<CourseSubscriptionMapping> courseSubscriptionMapping,
            IRepository<UserCourseEnrollments> userCourseEnrollments,
            IRepository<Course> courseRepository)
        {
            _dataRepository = dataRepository;
            _utilityService = utilityService;
            _localizer = localizer;
            _companyService = companyService;
            _mapper = mapper;
            _config = config;
            _courseSubscriptionMapping = courseSubscriptionMapping;
            _userCourseEnrollments = userCourseEnrollments;
            _courseRepository = courseRepository;
        }

        /// <summary>
        /// Method to update company.
        /// </summary>
        /// <param name="company">Company details.</param>
        /// <returns>Updated company details.</returns>
        [Authorize(VirtaulAidPermissions.Company.Edit)]
        public async Task<UpdateCompanyDto> CompanyUpdateAsync(UpdateCompanyDto company)
        {

            if (company.Id == Guid.Empty)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                // Verify company is exist or not with company id.
                var companyDetails = await _dataRepository.FirstOrDefaultAsync(x => x.Id == company.Id);

                if (companyDetails != null)
                {
                    // Email cannot be updated.
                    if (companyDetails.Email != company.Email)
                    {
                        throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status404NotFound.ToString());
                    }
                    else
                    {
                        companyDetails.CompanyName = company.CompanyName;
                        companyDetails.ContactNumber = company.ContactNumber;
                        companyDetails.Address1 = company.Address1;
                        companyDetails.Address2 = company.Address2;
                        companyDetails.Address3 = company.Address3;
                        companyDetails.Country = company.Country;
                        companyDetails.State = company.State;
                        companyDetails.City = company.City;
                        companyDetails.Postalcode = company.Postalcode;
                        // Update existing company.
                        companyDetails = await _dataRepository.UpdateAsync(companyDetails, true);
                        company = ObjectMapper.Map<Company, UpdateCompanyDto>(companyDetails);

                    }
                }
                else
                {
                    throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
                }

                return company;
            }
        }

        /// <summary>
        /// Method to get company details by company id.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>Company details.</returns>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<CompanyDto> GetCompanyByCompanyIdAsync(Guid companyId)
        {
            Company company = await _dataRepository.GetAsync(x => x.Id == companyId);
            return ObjectMapper.Map<Company, CompanyDto>(company);
        }

        /// <summary>
        /// Method to get list of company.
        /// </summary>
        /// <returns>List of company.</returns>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<ICollection<CompanyDto>> GetAllCompanyListAsync()
        {
            ICollection<Company> companies = await _dataRepository.GetListAsync();
            return ObjectMapper.Map<ICollection<Company>, ICollection<CompanyDto>>(companies);
        }

        /// <summary>
        /// Method to get company details by email.
        /// </summary>
        /// <param name="emailId">Company's email id.</param>
        /// <returns>Company details.</returns>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<CompanyDto> GetCompanyByEmailIdAsync(string emailId)
        {
            // Convert first letter of email to lower case by default
            emailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(emailId);

            Company company = await _dataRepository.GetAsync(x => x.Email == emailId);
            return ObjectMapper.Map<Company, CompanyDto>(company);
        }

        /// <summary>
        /// Method to delete company by email.
        /// </summary>
        /// <param name="emailId">Company's email id.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.Company.Delete)]
        public async Task DeleteCompanyByEmailIdAsync(string emailId)
        {
            // Convert first letter of email to lower case by default
            emailId = await _utilityService.ConvertFirstCharToLowerCaseAsync(emailId);

            Company company = await _dataRepository.GetAsync(x => x.Email == emailId);
            await _dataRepository.DeleteAsync(company,true);
        }


        /// <summary>
        /// Method to upload profile image file over s3 for company.
        /// </summary>
        /// <param name="formFile">Image File.</param>
        /// <param name="email">Email id of the company.</param>
        /// <returns>Task</returns>
        [Authorize]
        public async Task UploadProfileImageForCompanyAsync(IFormFile formFile, string email)
        {
            // Convert first letter of email to lower case by default
            var currentLoggedInEmail = await _utilityService.ConvertFirstCharToLowerCaseAsync(email); ;
            bool isEmailpresent = await _companyService.IsCompanyEmailPresentAsync(currentLoggedInEmail);
            if (isEmailpresent)
            {
                FileInfo fileInfo = new FileInfo(formFile.FileName);
                if ((fileInfo.Extension != ".JPEG" && fileInfo.Extension != ".JPG" && fileInfo.Extension != ".jpeg" && fileInfo.Extension != ".jpg") || fileInfo.Extension.Length == 0)
                {
                    throw new UserFriendlyException(_localizer["PhotoFormatSupported"], StatusCodes.Status409Conflict.ToString());
                }

                var companyDetails = await _dataRepository.FirstOrDefaultAsync(x => x.Email == currentLoggedInEmail);
                var fileName = $"profiles/{companyDetails.CompanyName}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                var filePath = await _utilityService.UploadAsync(formFile, fileName);
                companyDetails.ProfileImage = filePath;
                await _dataRepository.UpdateAsync(companyDetails,true);
            }
            else
            {
                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status404NotFound.ToString());
            }
        }

        /// <summary>
        /// Method to add and edit the public profile details for the company.
        /// </summary>
        /// <param name="ProfileImage">Profile Image file of the company</param>
        /// <param name="email">Email id of the company</param>
        /// <returns>url of the image stored in s3.</returns>
        /// <exception cref="UserFriendlyException">throws the error when company does not exists, or something goes wrong</exception>
        [Authorize]
        public async Task<string> AddEditProfileImageForCompanyAsync(IFormFile ProfileImage, string email)
        {
            Company company = await _dataRepository.FirstOrDefaultAsync(x => x.Email == email);
            if (company == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                if(ProfileImage != null)
                {
                    string fileType = ProfileImage.ContentType.Split('/')[1].ToLower();
                    if (fileType.Equals("jpg") || fileType.Equals("jpeg") || fileType.Equals("png"))
                    {
                        var fileName = $"profiles/{company.CompanyName}_{company.Email}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                        var filePath = await _utilityService.UploadAsync(ProfileImage, fileName);
                        company.ProfileImage = $"https://{_config.GetSection("AWS").GetSection("Bucket").Value}.s3.{_config.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                        await _dataRepository.UpdateAsync(company);
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
        /// Method to upload and edit Banner Image for company.
        /// </summary>
        /// <param name="BannerImage">Banner Image file of the company</param>
        /// <param name="email">Email id of the company</param>
        /// <returns>url of the image stored in s3.</returns>
        /// <exception cref="UserFriendlyException">throws the error when company not exist, image format is not supported, or something goes wrong.</exception>
        [Authorize]
        public async Task<string> AddEditBannerImageForCompanyAsync(IFormFile BannerImage, string email)
        {
            Company company = await _dataRepository.FirstOrDefaultAsync(x => x.Email == email);
            if (company == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                if (BannerImage != null)
                {
                    string fileType = BannerImage.ContentType.Split('/')[1].ToLower();
                    if (fileType.Equals("jpg") || fileType.Equals("jpeg") || fileType.Equals("png"))
                    {
                        var fileName = $"banners/{company.CompanyName}_{company.Email}_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}";
                        var filePath = await _utilityService.UploadAsync(BannerImage, fileName);
                        company.BannerImage = $"https://{_config.GetSection("AWS").GetSection("Bucket").Value}.s3.{_config.GetSection("AWS").GetSection("Region").Value}.amazonaws.com/{filePath}";
                        await _dataRepository.UpdateAsync(company);
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
        /// Method to add and edit details of public profile of the company.
        /// </summary>
        /// <param name="req">req object which has all the details.</param>
        /// <returns>Object with updated details.</returns>
        /// <exception cref="UserFriendlyException">throws the error when company not exists</exception>
        [Authorize]
        public async Task<ReqCompanyProfileDto> AddEditPublicProfileDetailsForCompanyAsync(ReqCompanyProfileDto req)
        {
            Company company = await _dataRepository.FirstOrDefaultAsync(x => x.Email == req.Email);
            if (company == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                company.Bio = req.Bio;
                company.Slogan = req.Slogan;
                company.NoOfEmployees = req.NoOfEmployees;
                company.ContactNumber = req.ContactNumber;
                await _dataRepository.UpdateAsync(company);
                ReqCompanyProfileDto result = _mapper.Map<ReqCompanyProfileDto>(company);
                return result;
            }
        }

        /// <summary>
        /// Method to get public profile details of company.
        /// </summary>
        /// <param name="companyId">required company id</param>
        /// <returns>Returns object that has public profile details</returns>
        /// <exception cref="UserFriendlyException">throws the error when company not exists</exception>
        public async Task<ResCompanyProfileDto> GetPublicProfileDetailsOfCompanyAsync(Guid companyId, bool isPreviewRequest = false)
        {
            Company company = await _dataRepository.FirstOrDefaultAsync(x => x.Id == companyId);
            if(company == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                ResCompanyProfileDto result = new();
                if(company.PublishData == true || isPreviewRequest)
                {
                    result = _mapper.Map<ResCompanyProfileDto>(company);
                    List<CourseEmployeeDataDto> courseEmployeeDataList = new();
                    List<int> courseSubscriptionIds = (await _courseSubscriptionMapping.GetListAsync(x => x.CompanysId == companyId)).Select(x => x.Id).ToList();
                    List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollments.GetListAsync(x => courseSubscriptionIds.Contains(x.CourseSubscriptionId) && x.IsCompleted);
                    foreach(var courseSubscriptionId in courseSubscriptionIds)
                    {
                        List<UserCourseEnrollments> userCourseEnrollmentsForParticularId = userCourseEnrollments.Where(x => x.CourseSubscriptionId == courseSubscriptionId).ToList();
                        CourseSubscriptionMapping courseSubscriptionMapping = await _courseSubscriptionMapping.FirstOrDefaultAsync(x => x.Id == courseSubscriptionId);
                        
                        //This flag is for representing if the same course with same exam type is repeated
                        bool flag = true;
                        foreach(var item in courseEmployeeDataList) 
                        { 
                            if(item.CourseId == courseSubscriptionMapping.CourseId && item.ExamType == courseSubscriptionMapping.ExamType)
                            {
                                item.NoOfEmployees += userCourseEnrollmentsForParticularId.Count();
                                flag = false;
                            }
                        }

                        if (flag)
                        {
                            CourseEmployeeDataDto courseEmployeeData = new();
                            if (courseSubscriptionMapping != null)
                            {
                                courseEmployeeData.CourseId = courseSubscriptionMapping.CourseId;
                                courseEmployeeData.ExamType = courseSubscriptionMapping.ExamType;
                                courseEmployeeData.NoOfEmployees = userCourseEnrollmentsForParticularId.Count();
                                Course course = await _courseRepository.FirstOrDefaultAsync(x => x.Id == courseSubscriptionMapping.CourseId);
                                if (course != null)
                                {
                                    courseEmployeeData.CourseName = course.Name;
                                }
                            }
                            courseEmployeeDataList.Add(courseEmployeeData);
                        }
                    }
                    result.CourseEmployeeData = courseEmployeeDataList;
                }
                return result;
            }
        }

        /// <summary>
        /// Method to update PublishData property for Company
        /// </summary>
        /// <param name="companyId">company id of the company</param>
        /// <param name="publishData">publish data boolean value, which has to be updated for the company</param>
        /// <returns>object which returns the id and updated publish data value for the company</returns>
        /// <exception cref="UserFriendlyException">throws the execption when company does not exist</exception>
        public async Task<ResPublishDataDto> UpdatePublishDataForCompanyAsync(Guid companyId, bool publishData)
        {
            Company company = await _dataRepository.FirstOrDefaultAsync(x => x.Id == companyId);
            if (company != null)
            {
                company.PublishData = publishData;
                await _dataRepository.UpdateAsync(company, true);
                ResPublishDataDto result = _mapper.Map<ResPublishDataDto>(company);
                return result;
            }
            throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
        }

    }
}
