using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Admin;
using VirtaulAid.DTOs.Company;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.Feedback;
using VirtaulAid.DTOs.Purchase;
using VirtaulAid.DTOs.User;
using VirtaulAid.Enums;
using VirtaulAid.Exams;
using VirtaulAid.Feedbacks;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.MultilingualObjects;
using VirtaulAid.Permissions;
using VirtaulAid.Purchases;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{

    [Authorize(Roles = "Admin, Super Admin")]
    public class AdminService : ApplicationService, IAdminService
    {
        private readonly IRepository<Company, Guid> _companyRepository;
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IDataFilter _dataFilter;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollment;
        private readonly IRepository<UserDetailRoleMapping> _userRoleMappingRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IRepository<Course> _courseRepository;
        private readonly UserService _userService;
        private readonly CompanyService _companyService;
        private readonly CourseDomainService _courseDomainService;
        private readonly IRepository<PurchaseDetail> _purchaseRepository;
        private readonly IMapper _mapper;
        private readonly IDataFilter<ISoftDelete> _softDeleteFilter;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IRepository<ExamDetail> _examDetail;
        private readonly IRepository<CustomCourseRequest> _customCourseRequestRepository;
        private readonly IRepository<ExamDetail> _examDetailRepository;
        public readonly IRepository<Feedback> _feedbackRepository;
        public readonly MultiLingualObjectManager _multiLingualObjectManager;

        public AdminService(IRepository<Company, Guid> companyRepository, IRepository<UserDetail> userRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IRepository<UserCourseEnrollments> userCourseEnrollment,
            IRepository<UserDetailRoleMapping> userRoleMappingRepository,
            IMapper mapper,
            IRepository<Course> courseRepository,
            UserService userService,
            CompanyService companyService,
            CourseDomainService courseDomainService,
            IRepository<PurchaseDetail> purchaseRepository,
            IDataFilter dataFilter,
            IDataFilter<ISoftDelete> softDeleteFilter,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<ExamDetail> examDetail,
            IRepository<CustomCourseRequest> customCourseRequestRepository,
            IRepository<ExamDetail> examDetailRepository,
            IRepository<Feedback> feedbackRepository, MultiLingualObjectManager multiLingualObjectManager)
        {
            _companyRepository = companyRepository;
            _userRepository = userRepository;
            _dataFilter = dataFilter;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _userCourseEnrollment = userCourseEnrollment;
            _userRoleMappingRepository = userRoleMappingRepository;
            _mapper = mapper;
            _courseRepository = courseRepository;
            _userService = userService;
            _softDeleteFilter = softDeleteFilter;
            _localizer = localizer;
            _examDetail = examDetail;
            _customCourseRequestRepository = customCourseRequestRepository;
            _examDetailRepository = examDetailRepository;
            _companyService = companyService;
            _courseDomainService = courseDomainService;
            _purchaseRepository = purchaseRepository;
            _feedbackRepository = feedbackRepository;
            _multiLingualObjectManager = multiLingualObjectManager;
        }

        /// <summary>
        /// Method to get company list.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of company.</returns>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<PagedResultDto<CompanyListDto>> GetCompanyListAsync(int pageNo, int pageSize, string culture)
        {
            List<Company> companyListAsync = new();
            using (_softDeleteFilter.Disable())
            {
                companyListAsync = await _companyRepository.GetListAsync();
            }

            List<Company> companyList = companyListAsync.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<CompanyListDto> companiesList = new();

            List<CustomCourseRequest> courseRequests = (await _customCourseRequestRepository.WithDetailsAsync(x => x.Course)).Where(c => c.IsFinished == false && companyList.Select(x => x.Id).Contains(c.CompanyId)).ToList();
            List<ResCustomCourseRequestDto> result = _mapper.Map<List<ResCustomCourseRequestDto>>(courseRequests);
            foreach (Company company in companyList)
            {
                CompanyListDto objectItem = _mapper.Map<CompanyListDto>(company);

                //Adding No of employees
                int noOfEmployees = await _userRepository.CountAsync(u => u.CurrentCompanyId == company.Id);
                objectItem.NoOfEmployees = noOfEmployees;

                //Adding No of Courses Purchased
                int noOfCoursesPurchased = 0;
                List<CourseSubscriptionMapping> courseSubscriptionMapping = await _courseSubscriptionRepository.GetListAsync(cs => cs.CompanysId == company.Id);
                foreach (CourseSubscriptionMapping cs in courseSubscriptionMapping)
                {
                    noOfCoursesPurchased += cs.TotalCount;
                }
                
                objectItem.NoOfCoursesPurchased = noOfCoursesPurchased;
                objectItem.CustomCourseRequests = result.Where(x => x.CompanyId == company.Id).ToList();
                
                List<Guid> courseIds = objectItem.CustomCourseRequests.Select(x => x.CourseId).ToList();
                List<Course> courseList = await GetCourseListWithTranslationsAsync(courseIds);
                objectItem.CustomCourseRequests = await GetCourseRequestTranslationsAsync(objectItem.CustomCourseRequests, courseList, culture);
                companiesList.Add(objectItem);
            }

            return new PagedResultDto<CompanyListDto>(companyListAsync.Count, companiesList);
        }


        /// <summary>
        /// Method to get company list.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>List of company.</returns>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<PagedResultDto<CompanyListDto>> GetPendingCompanyListAsync(int pageNo, int pageSize)
        {
            using (_dataFilter.Disable<ISoftDelete>())
            {
                IQueryable<Company> companyListAsync = await _companyRepository.GetQueryableAsync();
                int totalCount = companyListAsync.Where(x => (x.IsVerified == null || x.IsVerified == false) && (x.IsDeleted == false)).Count();
                List<Company> companyList = companyListAsync.Where(x => (x.IsVerified == null || x.IsVerified == false) && (x.IsDeleted == false)).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
                List<CompanyListDto> companiesList = new();
                foreach (var company in companyList)
                {
                    CompanyListDto objectItem = _mapper.Map<CompanyListDto>(company);

                    //Adding No of employees
                    int noOfEmployees = await _userRepository.CountAsync(u => u.CurrentCompanyId == company.Id);
                    objectItem.NoOfEmployees = noOfEmployees;

                    //Adding No of Courses Purchased
                    int noOfCoursesPurchased = 0;
                    List<CourseSubscriptionMapping> courseSubscriptionMapping = await _courseSubscriptionRepository.GetListAsync(cs => cs.CompanysId == company.Id);
                    foreach (CourseSubscriptionMapping cs in courseSubscriptionMapping)
                    {
                        noOfCoursesPurchased += cs.TotalCount;
                    }

                    objectItem.NoOfCoursesPurchased = noOfCoursesPurchased;
                    companiesList.Add(objectItem);
                }

                return new PagedResultDto<CompanyListDto>(totalCount, companiesList);
            }

        }

        /// <summary>
        /// Method to get employee list of a company by companyId.
        /// </summary>
        /// <param name="companyId">Company Id of a company.</param>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>List of employees.</returns>
        [Authorize(VirtaulAidPermissions.Employee.Default)]
        public async Task<PagedResultDto<UserListDto>> GetEmployeeListAsync(Guid companyId, int pageNo, int pageSize)
        {
            List<UserListDto> employeesList = new();
            List<UserDetail> employeeListAsync = new();
            using (_softDeleteFilter.Disable())
            {
                employeeListAsync = await _userRepository.GetListAsync();
            }

            int totalCount = employeeListAsync.Where(e => e.CurrentCompanyId == companyId).Count();
            List<UserDetail> employeeList = employeeListAsync.Where(e => e.CurrentCompanyId == companyId).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            foreach (UserDetail employee in employeeList)
            {
                UserListDto objectItem = _mapper.Map<UserListDto>(employee);
                objectItem.FullName = employee.FirstName + " " + employee.LastName;

                // No of courses enrolled and progress
                int courseCount = 0;
                double progress = 0;
                IQueryable<UserCourseEnrollments> userCourseEnrollmentsAsync = await _userCourseEnrollment.GetQueryableAsync();
                List<UserCourseEnrollments> userCourses = userCourseEnrollmentsAsync.Where(e => e.UserId == employee.Id).ToList();
                List<CourseSubscriptionMapping> courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => userCourses.Select(u => u.CourseSubscriptionId).Contains(x.Id));
                foreach (UserCourseEnrollments userCourse in userCourses)
                {
                    int courseSubId = userCourse.CourseSubscriptionId;
                    CourseSubscriptionMapping? courseSubscription = courseSubscriptionList.Find(e => e.Id == courseSubId);
                    if (courseSubscription != null && courseSubscription.CompanysId == companyId)
                    {
                        courseCount++;
                    }
                    progress += userCourse.Progress;
                }
                objectItem.NoOfCoursesEnrolled = courseCount;
                objectItem.Progress = courseCount == 0 ? 0 : (progress / courseCount);

                // Add the obj into the result list
                employeesList.Add(objectItem);
            }

            return new PagedResultDto<UserListDto>(totalCount, employeesList);
        }

        /// <summary>
        /// Method to get list of individual users.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>list of individual users.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<PagedResultDto<UserListDto>> GetIndividualUserListAsync(int pageNo, int pageSize)
        {
            List<UserListDto> individualsDtoList = new();
            List<UserDetail> individualListAsync = new();
            using (_softDeleteFilter.Disable())
            {
                individualListAsync = await _userRepository.GetListAsync();
            }

            IQueryable<UserDetailRoleMapping> userRoleMappings = await _userRoleMappingRepository.WithDetailsAsync(x => x.Roledetail);
            List<Guid> individualUserIds = userRoleMappings.Where(x => x.Roledetail.Name == "Individual").Select(x => x.UserId).ToList();
            int totalCount = individualListAsync.Where(e => individualUserIds.Contains(e.Id)).Count();
            List<UserDetail> individualList = individualListAsync.Where(e => individualUserIds.Contains(e.Id)).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();

            foreach (UserDetail individual in individualList)
            {
                UserListDto objectItem = _mapper.Map<UserListDto>(individual);
                objectItem.FullName = individual.FirstName + " " + individual.LastName;
                objectItem.ConsentToShareData = individual.ConsentToShareData;
                Guid? CompanyId = individual.CurrentCompanyId;
                Company company = new();
                using (_softDeleteFilter.Disable())
                {
                    company = await _companyRepository.FirstOrDefaultAsync(c => c.Id == CompanyId);
                }

                objectItem.Company = company?.CompanyName;

                // No of courses enrolled and progress
                int courseCount = 0;
                double progress = 0;
                IQueryable<UserCourseEnrollments> userCourseEnrollmentsAsync = await _userCourseEnrollment.GetQueryableAsync();
                List<UserCourseEnrollments> userCourses = userCourseEnrollmentsAsync.Where(e => e.UserId == individual.Id).ToList();
                foreach (var userCourse in userCourses)
                {
                    int courseSubId = userCourse.CourseSubscriptionId;
                    CourseSubscriptionMapping courseSubscription = await _courseSubscriptionRepository.FirstOrDefaultAsync(e => e.Id == courseSubId);
                    courseCount++;
                    progress += userCourse.Progress;
                }

                objectItem.NoOfCoursesEnrolled = courseCount;
                objectItem.Progress = courseCount == 0 ? 0 : (progress / courseCount);

                // Add the obj into the result list
                individualsDtoList.Add(objectItem);
            }

            return new PagedResultDto<UserListDto>(totalCount, individualsDtoList);
        }

        /// <summary>
        /// Method to get list of admin users.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>list of admin users.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<PagedResultDto<UserListDto>> GetAdminListAsync(int pageNo, int pageSize)
        {
            List<UserListDto> adminDtoList = new();
            using (_dataFilter.Disable<ISoftDelete>())
            {
                IQueryable<UserDetailRoleMapping> userRoleMappings = await _userRoleMappingRepository.WithDetailsAsync(x => x.Roledetail);
                List<Guid> adminUserIds = userRoleMappings.Where(x => x.Roledetail.Name == "Admin").Select(x => x.UserId).ToList();
                IQueryable<UserDetail> adminListAsync = await _userRepository.GetQueryableAsync();
                List<UserDetail> adminList = adminListAsync.Where(e => adminUserIds.Contains(e.Id)).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();

                foreach (UserDetail admin in adminList)
                {
                    UserListDto adminItem = _mapper.Map<UserListDto>(admin);
                    adminItem.FullName = $"{admin.FirstName} {admin.LastName}";
                    adminDtoList.Add(adminItem);
                }

                return new PagedResultDto<UserListDto>(adminUserIds.Count, adminDtoList);
            }
        }

        /// <summary>
        /// Method to get company profile by companyId.
        /// </summary>
        /// <param name="companyId">Company Id of a company</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Company profile object</returns>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<CompanyProfileDto> GetCompanyProfileAsync(Guid companyId, string culture)
        {
            Company company = new();
            using (_softDeleteFilter.Disable())
            {
                company = await _companyRepository.FirstAsync(c => c.Id == companyId);
            }
            CompanyProfileDto result = _mapper.Map<CompanyProfileDto>(company);
            result.Status = company.IsDeleted ? "InActive" : "Active";

            //No. of courses purchased
            IQueryable<CourseSubscriptionMapping> coursesPurchasedAsync = await _courseSubscriptionRepository.GetQueryableAsync();
            List<CourseSubscriptionMapping> coursesPurchasedList = coursesPurchasedAsync.Where(c => c.CompanysId == companyId).ToList();
            int coursesPurchasedCount = 0;
            foreach (CourseSubscriptionMapping coursePurchasedItem in coursesPurchasedList)
            {
                coursesPurchasedCount += coursePurchasedItem.TotalCount;
            }
            result.CoursesPurchased = coursesPurchasedCount;

            //No. of employees
            IQueryable<UserDetail> noOfEmployeesAsync = await _userRepository.GetQueryableAsync();
            int noOfEmployees = noOfEmployeesAsync.Where(e => e.CurrentCompanyId == companyId).Count();
            result.EmployeesEnrolled = noOfEmployees;

            //For custom course request
            List<CustomCourseRequest> courseRequests = (await _customCourseRequestRepository.WithDetailsAsync(x => x.Course)).Where(c => c.IsFinished == false && c.CompanyId == companyId).ToList();
            List<ResCustomCourseRequestDto> courseRequestResult = _mapper.Map<List<ResCustomCourseRequestDto>>(courseRequests);

            result.CustomCourseRequests = courseRequestResult.Where(x => x.CompanyId == company.Id).ToList();


            List<Guid> courseIds = result.CustomCourseRequests.Select(x => x.CourseId).ToList();
            List<Course> courseList = await GetCourseListWithTranslationsAsync(courseIds);
            result.CustomCourseRequests = await GetCourseRequestTranslationsAsync(result.CustomCourseRequests, courseList, culture);

            return result;
        }


        /// <summary>
        /// Method is to get individual profile
        /// </summary>
        /// <param name="userId">User Id of a user</param>
        /// <returns>Individual profile object</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<UserProfileDto> GetIndividualProfileAsync(Guid userId)
        {
            UserDetail individualUser = new();
            Company company = new();
            using (_softDeleteFilter.Disable())
            {
                individualUser = await _userRepository.FirstOrDefaultAsync(e => e.Id == userId);
                if (individualUser.CurrentCompanyId != null)
                    company = await _companyRepository.FirstOrDefaultAsync(c => c.Id == individualUser.CurrentCompanyId);
            }

            UserProfileDto result = _mapper.Map<UserProfileDto>(individualUser);
            result.FullName = $"{individualUser.FirstName} {individualUser.LastName}";
            result.Status = individualUser.IsDeleted ? "InActive" : "Active";
            result.CompanyName = company.CompanyName ?? null;

            // No of courses individual is enrolled in and no of certificates
            int coursesEnrolledIn = 0;
            int noOfCertificates = 0;

            IQueryable<UserCourseEnrollments> userCourseEnrolledAsync = await _userCourseEnrollment.GetQueryableAsync();
            List<UserCourseEnrollments> userCoursesEnrolled = userCourseEnrolledAsync.Where(u => u.UserId == userId).ToList();
            foreach (UserCourseEnrollments course in userCoursesEnrolled)
            {
                coursesEnrolledIn++;
                if (course.Progress == 100)
                {
                    if (course.CertificateExpirationDate != null && course.CertificateExpirationDate > DateTime.Today)
                    {
                        noOfCertificates++;
                    }
                }
            }
            result.NoOfCoursesEnrolled = coursesEnrolledIn;
            result.NoOfCertificate = noOfCertificates;

            return result;
        }

        /// <summary>
        /// Method is to get list of courses enrolled by an individual
        /// </summary>
        /// <param name="userId">User Id of a user</param>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of courses enrolled by user</returns>
        [Authorize(VirtaulAidPermissions.UserEnrollment.Default)]
        public async Task<PagedResultDto<CourseEnrolledByUserDto>> GetCoursesEnrolledByIndividualAsync(Guid userId, int pageNo, int pageSize, string culture)
        {
            List<CourseEnrolledByUserDto> coursesList = new List<CourseEnrolledByUserDto>();
            IQueryable<UserCourseEnrollments> courseListAsync = await _userCourseEnrollment.GetQueryableAsync();
            int totalCount = courseListAsync.Where(c => c.UserId == userId).Count();
            List<UserCourseEnrollments> courseEnrollmentsList = courseListAsync.Where(c => c.UserId == userId).Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => courseEnrollmentsList.Select(c => c.CourseSubscriptionId).Contains(x.Id));
            IQueryable<Course>? list = (await _courseRepository.WithDetailsAsync(x => x.Translations)).AsQueryable();
            List<Course> courseList = list.Where(x => courseSubscriptionList.Select(c => c.CourseId).Contains(x.Id)).ToList();

            foreach (UserCourseEnrollments courseEnrollments in courseEnrollmentsList)
            {
                CourseSubscriptionMapping? courseSubscription = courseSubscriptionList.Find(c => c.Id == courseEnrollments.CourseSubscriptionId);
                if (courseSubscription == null)
                {
                    throw new UserFriendlyException(_localizer["CourseSubscriptionIdNotExist"], StatusCodes.Status404NotFound.ToString());
                }

                Course? courseObj = courseList.Find(c => c.Id == courseSubscription.CourseId);
                if (courseObj == null)
                {
                    throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());
                }

                CourseEnrolledByUserDto objectItem = new()
                {
                    Id = courseObj.Id,
                    Name = courseObj.Name,
                    Progress = courseEnrollments.Progress,
                    CourseEnrolledDate = courseEnrollments.EnrolledDate,
                    CertificateExpirationDate = courseEnrollments.CertificateExpirationDate,
                    ExamType = courseEnrollments.ExamType,
                };

                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseObj, culture, true);
                if(translationForCourse != null)
                {
                    objectItem.Language = translationForCourse.Language;
                    objectItem.Name = translationForCourse.Name;
                }

                ExamDetail examObject = await _examDetail.FirstOrDefaultAsync(ed => ed.CourseId == courseObj.Id);
                if (examObject == null)
                {
                    throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());
                }
                objectItem.ExamId = examObject.Id;
                coursesList.Add(objectItem);
            }

            return new PagedResultDto<CourseEnrolledByUserDto>(totalCount, coursesList);
        }

        /// <summary>
        /// Method to get courses purchased by company.
        /// </summary>
        /// <param name="companyId">Company Id of a company.</param>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of courses purchased by company.</returns>
        [Authorize(VirtaulAidPermissions.CourseSubscription.Default)]
        public async Task<PagedResultDto<CoursePurchasedByCompanyDto>> GetCoursesPurchasedByCompanyAsync(Guid companyId, int pageNo, int pageSize, string culture)
        {
            ICollection<CourseSubscriptionMapping> allSubscriptionsForCompany = await _courseDomainService.GetAllSubscriptionByCompanyIdAsync(companyId.ToString());
            ICollection<UserCourseEnrollments> allUserCourseEnrollments = await _courseDomainService.GetAllUserCourseEnrollmentsByCompanyIdAsync(allSubscriptionsForCompany);
            List<SubscribedCourseDto> subscribedCourseDtos = new();
            ICollection<UserDetail> employees = await _userService.GetEmployeeListByCompanyIdAsync((companyId));
            List<Guid> employeeIds = employees.Select(x => x.Id).ToList();
            List<UserCourseEnrollments> userCourseEnrollmentsByEmployees = (await _userCourseEnrollment.WithDetailsAsync(x => x.CourseSubscriptionMapping.UserDetail, y => y.CourseSubscriptionMapping.Course)).Where(x => x.CourseSubscriptionMapping.UserId != null && employeeIds.Contains((Guid)x.CourseSubscriptionMapping.UserId)).ToList();
            foreach (CourseSubscriptionMapping subscription in allSubscriptionsForCompany)
            {
                SubscribedCourseDto subscribedCourseDto = new();
                ResCourseDetailDto courseDetail = ObjectMapper.Map<Course, ResCourseDetailDto>(subscription.Course);
                subscribedCourseDto.ResCourseDetail = courseDetail;
                subscribedCourseDto.ResCourseDetail.EnrolledDate = subscription.PurchasedDate;
                subscribedCourseDto.ResCourseDetail.ExpirationDate = subscription.ExpirationDate;
                subscribedCourseDto.ResCourseDetail.ExamType = subscription.ExamType;
                ExamDetail examDetail = await _examDetailRepository.GetAsync(x => x.CourseId == courseDetail.Id);
                int examDetailId = examDetail.Id;
                subscribedCourseDto.ResCourseDetail.ExamDetailId = examDetailId;
                IEnumerable<UserDetail> userDetails = allUserCourseEnrollments.Where(x => x.CourseSubscriptionId == subscription.Id).Select(x => x.User);
                IList<EmployeeDetailsDto> employeeDetailsDtos = ObjectMapper.Map<IList<UserDetail>, IList<EmployeeDetailsDto>>(userDetails.ToList());

                // same course purchased by employee personally.
                List<UserDetail> employeeWithCourseBySelf = userCourseEnrollmentsByEmployees.Where(x => x.CourseSubscriptionMapping.CourseId == subscription.CourseId).Select(x => x.CourseSubscriptionMapping.UserDetail).ToList();
                foreach (UserDetail employee in employeeWithCourseBySelf)
                {
                    EmployeeDetailsDto employeeDto = ObjectMapper.Map<UserDetail, EmployeeDetailsDto>(employee);
                    employeeDto.IsPersonalCourse = true;
                    int index = employeeDetailsDtos.ToList().FindIndex(x => x.Id == employeeDto.Id);
                    if (index == -1)
                    {
                        employeeDetailsDtos.Add(employeeDto);
                    }
                }

                foreach (EmployeeDetailsDto employee in employeeDetailsDtos)
                {
                    UserCourseEnrollments? courseEnrollment = allUserCourseEnrollments.FirstOrDefault(x => x.UserId == employee.Id);
                    employee.EnrolledDate = courseEnrollment != null ? courseEnrollment.EnrolledDate : null;
                    employee.Progress = courseEnrollment != null ? courseEnrollment.Progress : 0;
                    employee.CertificateExpirationDate = courseEnrollment != null ? courseEnrollment.CertificateExpirationDate : null;
                }
                subscribedCourseDto.CourseSubscriptionMappingId = subscription.Id;
                subscribedCourseDto.TotalSubscriptionCount = subscription.TotalCount;
                subscribedCourseDto.RemainingSubscriptionCount = subscription.RemainingCount;
                subscribedCourseDto.EmployeeDetails = employeeDetailsDtos;
                subscribedCourseDto.EmployeeDetails = subscribedCourseDto.EmployeeDetails.DistinctBy(x => x.Email).ToList();

                // We are merging same course subscription into one.
                int existSubscribedCourseIndex = subscribedCourseDtos.FindIndex(x => x.ResCourseDetail.Name == courseDetail.Name && x.ResCourseDetail.ExamType == subscription.ExamType);
                if (existSubscribedCourseIndex != -1)
                {
                    subscribedCourseDtos[existSubscribedCourseIndex].CourseSubscriptionMappingId = subscribedCourseDto.CourseSubscriptionMappingId;
                    subscribedCourseDtos[existSubscribedCourseIndex].TotalSubscriptionCount += subscribedCourseDto.TotalSubscriptionCount;
                    subscribedCourseDtos[existSubscribedCourseIndex].RemainingSubscriptionCount += subscribedCourseDto.RemainingSubscriptionCount;

                    DateTime prePurchasedDate = subscribedCourseDtos[existSubscribedCourseIndex].ResCourseDetail.EnrolledDate;
                    DateTime preExpiredDate = subscribedCourseDtos[existSubscribedCourseIndex].ResCourseDetail.ExpirationDate;
                    subscribedCourseDtos[existSubscribedCourseIndex].ResCourseDetail = subscribedCourseDto.ResCourseDetail;
                    if (prePurchasedDate > subscribedCourseDto.ResCourseDetail.EnrolledDate) // check the wich one is latest puchase date and assigning it.
                        subscribedCourseDtos[existSubscribedCourseIndex].ResCourseDetail.EnrolledDate = prePurchasedDate;

                    if (preExpiredDate > subscribedCourseDto.ResCourseDetail.ExpirationDate) // check the wich one is latest puchase expired date and assigning it.
                        subscribedCourseDtos[existSubscribedCourseIndex].ResCourseDetail.ExpirationDate = preExpiredDate;

                    subscribedCourseDtos[existSubscribedCourseIndex].EmployeeDetails = subscribedCourseDtos[existSubscribedCourseIndex].EmployeeDetails.Concat(subscribedCourseDto.EmployeeDetails).ToList();
                    subscribedCourseDtos[existSubscribedCourseIndex].EmployeeDetails = subscribedCourseDtos[existSubscribedCourseIndex].EmployeeDetails.DistinctBy(x => x.Email).ToList();
                }
                else
                {
                    subscribedCourseDtos.Add(subscribedCourseDto);
                }
            }

            List<CoursePurchasedByCompanyDto> resultList = new List<CoursePurchasedByCompanyDto>();

            List<Guid> courseIds = subscribedCourseDtos.Select(x => x.ResCourseDetail.Id).ToList();
            List<Course> courseList = await GetCourseListWithTranslationsAsync(courseIds);
            foreach (SubscribedCourseDto item in subscribedCourseDtos)
            {
                ResCourseDetailDto course = item.ResCourseDetail;
                Course? courseObj = courseList.FirstOrDefault(x => x.Id == course.Id);
                CourseSubscriptionMapping? courseSubscription = allSubscriptionsForCompany.FirstOrDefault(x => x.Id == item.CourseSubscriptionMappingId);
                if (courseSubscription != null)
                {
                    CoursePurchasedByCompanyDto result = _mapper.Map<CoursePurchasedByCompanyDto>(courseSubscription);
                    result.Name = course.Name;
                    if(courseObj != null)
                    {
                        CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseObj, culture, true);
                        if (translationForCourse != null)
                        {
                            result.Name = translationForCourse.Name;
                            result.Language = translationForCourse.Language;
                        }
                    }
                    result.ExamType = course.ExamType;
                    result.Price = course.Price;
                    result.ExamType = course.ExamType;
                    result.PurchasedAmount = item.TotalSubscriptionCount;
                    result.EnrolledAmount = item.RemainingSubscriptionCount;
                    resultList.Add(result);
                }
            }

            return new PagedResultDto<CoursePurchasedByCompanyDto>(subscribedCourseDtos.Count, resultList);
        }

        /// <summary>
        /// Method is to return all the available courses.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of courses.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<PagedResultDto<ResAllCourseDto>> GetAllCoursesAsync(int pageNo, int pageSize, string culture)
        {
            IQueryable<Course> allCoursesQueryAsync = (await _courseRepository.WithDetailsAsync(x => x.Translations)).AsQueryable();
            int totalCount = allCoursesQueryAsync.Count();
            List<Course> allCourses = allCoursesQueryAsync.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<ResAllCourseDto> result = new List<ResAllCourseDto>();
            foreach(Course course in allCourses)
            {
                ResAllCourseDto courseDto = _mapper.Map<ResAllCourseDto>(course);
                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                if(translationForCourse != null)
                {
                    courseDto.Language = translationForCourse.Language;
                    courseDto.Name = translationForCourse.Name;
                    courseDto.ShortDescription = translationForCourse.ShortDescription;
                    courseDto.ExamTypes = translationForCourse.ExamTypes;
                }
                result.Add(courseDto);
            }
            return new PagedResultDto<ResAllCourseDto>(totalCount, result);
        }

        /// <summary>
        /// Method to get admin details by id.
        /// </summary>
        /// <param name="adminId">Id of the admin.</param>
        /// <returns>Admin details.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<UserDetailsDto> GetAdminDetailsByIdAsync(Guid adminId)
        {
            UserDetail adminDetails = await _userService.GetAdminDetailsByIdAsync(adminId);
            return ObjectMapper.Map<UserDetail, UserDetailsDto>(adminDetails);
        }

        /// <summary>
        /// Method to update admin details.
        /// </summary>
        /// <param name="userDetailDto">User details.</param>
        /// <returns>User details.</returns>
        [Authorize(VirtaulAidPermissions.User.Edit)]
        public async Task<UserDetailsDto> UpdateAdminDetailsAsync(UserDetailsDto userDetailDto)
        {
            UserDetail userDetailObject = ObjectMapper.Map<UserDetailsDto, UserDetail>(userDetailDto);
            UserDetail userDetails = await _userService.UpdateUserDetailsAsync(userDetailObject);
            return ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
        }

        /// <summary>
        /// Method to activate or inactivate user by id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="isDeleted">If true then user will be soft delete and vice varsa.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Updated user details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        [Authorize(VirtaulAidPermissions.User.Edit)]
        public async Task<UserDetailsDto> UpdateActivateOrInactivateUserByIdAsync(Guid userId, bool isDeleted, string culture)
        {
            UserDetail userDetails = await _userService.ActivateOrInactivateUserByIdAsync(userId, isDeleted, culture);
            return ObjectMapper.Map<UserDetail, UserDetailsDto>(userDetails);
        }

        /// <summary>
        /// Method to enable or disable the company.
        /// </summary>
        /// <param name="companyId">Company Id of a company.</param>
        /// <param name="isActive">boolean value to set the status of the company.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Object that specifies the id and status of the company.</returns>
        /// <exception cref="UserFriendlyException">If company does not exist.</exception>
        [Authorize(VirtaulAidPermissions.Company.Edit)]
        public async Task<CompanyStatusDto> PutActivateOrInactivateCompanyByIdAsync(Guid companyId, bool isActive, string culture)
        {
            Company company = await _userService.EnableOrDisableCompanyByIdAsync(companyId, isActive, culture);
            CompanyStatusDto result = _mapper.Map<CompanyStatusDto>(company);
            return result;
        }

        /// <summary>
        /// Method to accept or reject company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="isActive">True if accpeted, otherwise false.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Updated company details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        [Authorize(VirtaulAidPermissions.Company.Edit)]
        public async Task<CompanyDto> AcceptOrRejectCompanyByIdAsync(Guid companyId, bool isActive, string culture)
        {
            Company companyDetails = await _companyService.AcceptOrRejectCompanyByIdAsync(companyId, isActive, culture);
            return ObjectMapper.Map<Company, CompanyDto>(companyDetails);
        }

        /// <summary>
        /// Method is to get purchase history by company id.
        /// </summary>
        /// <param name="companyId"> company Id.</param>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>List of purchase list by company.</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<PagedResultDto<ResPurchaseDto>> GetPurchaseListByCompanyIdAsync(Guid companyId, int pageNo, int pageSize)
        {
            List<PurchaseDetail> listPurchase = await _purchaseRepository.GetListAsync(x => x.CompanyId == companyId);
            if (listPurchase == null)
                return new PagedResultDto<ResPurchaseDto>(0, new List<ResPurchaseDto>());

            List<PurchaseDetail> companyPurchaseList = listPurchase.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<ResPurchaseDto> result = _mapper.Map<List<ResPurchaseDto>>(companyPurchaseList);
            return new PagedResultDto<ResPurchaseDto>(listPurchase.Count, result);
        }

        /// <summary>
        /// Method is to get purchase history by user id.
        /// </summary>
        /// <param name="userId"> user Id.</param>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>List of purchase list by user.</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<PagedResultDto<ResPurchaseDto>> GetPurchaseListByUserIdAsync(Guid userId, int pageNo, int pageSize)
        {
            List<PurchaseDetail> purchaseList = await _purchaseRepository.GetListAsync(x => x.UserId == userId);
            if (purchaseList == null)
                return new PagedResultDto<ResPurchaseDto>(0, new List<ResPurchaseDto>());

            List<PurchaseDetail> userPurchaseList = purchaseList.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<ResPurchaseDto> result = _mapper.Map<List<ResPurchaseDto>>(userPurchaseList);
            return new PagedResultDto<ResPurchaseDto>(purchaseList.Count, result);
        }

        /// <summary>
        /// Method is to get all purchase history.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>All purchase list.</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<PagedResultDto<ResPurchaseDto>> GetAllPurchaseListAsync(int pageNo, int pageSize)
        {
            List<PurchaseDetail> totalPurchaseList = await _purchaseRepository.GetListAsync();
            if (totalPurchaseList == null)
                return new PagedResultDto<ResPurchaseDto>(0, new List<ResPurchaseDto>());

            List<PurchaseDetail> purchaseList = totalPurchaseList.Skip((pageNo - 1) * pageSize).Take(pageSize).ToList();
            List<ResPurchaseDto> result = _mapper.Map<List<ResPurchaseDto>>(purchaseList);
            return new PagedResultDto<ResPurchaseDto>(totalPurchaseList.Count, result);
        }

        /// <summary>
        /// Method to get all the course request, which are pending
        /// </summary>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the course requests which are pending</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<List<ResCustomCourseRequestDto>> GetAllPendingCourseRequestAsync(string culture)
        {
            List<CustomCourseRequest> courseRequests = (await _customCourseRequestRepository.WithDetailsAsync(x => x.Course)).Where(c => c.IsFinished == false).ToList();
            List<ResCustomCourseRequestDto> result = new List<ResCustomCourseRequestDto>();
            foreach(CustomCourseRequest courseRequest in courseRequests)
            {
                Course? course = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == courseRequest.CourseId);
                ResCustomCourseRequestDto courseDto = _mapper.Map<ResCustomCourseRequestDto>(courseRequest);
                if (course != null)
                {
                    var translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                    if (translationForCourse != null)
                    {
                        courseDto.Course.Language = translationForCourse.Language;
                        courseDto.Course.Name = translationForCourse.Name;
                        courseDto.Course.ShortDescription = translationForCourse.ShortDescription;
                        courseDto.Course.ExamTypes = translationForCourse.ExamTypes;
                    }
                }
                result.Add(courseDto);
            }
            return result;
        }

        /// <summary>
        /// Method to accept or reject the course request.
        /// </summary>
        /// <param name="requestId">Id of the request</param>
        /// <param name="status">status of the request</param>
        /// <returns>request object</returns>
        /// <exception cref="UserFriendlyException">If request does not exists</exception>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<ResCustomCourseRequestDto> AcceptOrRejectCourseRequestAsync(Guid requestId, string status)
        {
            CustomCourseRequest request = await _customCourseRequestRepository.FirstOrDefaultAsync(c => c.Id == requestId);
            ResCustomCourseRequestDto result = new();
            if (request != null)
            {
                request.Status = status;
                request.IsFinished = true;
                request.ResponseDate = DateTime.Now;
                CustomCourseRequest courseRequest = await _customCourseRequestRepository.UpdateAsync(request);
                result = _mapper.Map<ResCustomCourseRequestDto>(courseRequest);
            }
            else
            {
                throw new UserFriendlyException(_localizer["RequestNotExists"], StatusCodes.Status404NotFound.ToString());
            }
            return result;
        }

        /// <summary>
        /// Method to get all feedbacks from users
        /// </summary>
        /// <returns>list of feedbacks</returns>
        public async Task<List<ResFeedbackDto>> GetAllFeedbacksAsync()
        {
            List<Feedback> allFeedbacks = await _feedbackRepository.GetListAsync();
            List<ResFeedbackDto> result = _mapper.Map<List<ResFeedbackDto>>(allFeedbacks);
            return result;
        }

        /// <summary>
        /// Method to update the status of the Feedback
        /// </summary>
        /// <param name="feedbackId">Id of the feedback</param>
        /// <param name="isDone">status of the feedback which has to be updated</param>
        /// <returns>updated feedback object with status</returns>
        /// <exception cref="UserFriendlyException">throws execption when feedback with provided id does not exist</exception>
        public async Task<ResUpdateFeedbackStatusDto> UpdateFeedbackStatus(Guid feedbackId, bool isDone)
        {
            Feedback feedback = await _feedbackRepository.FirstOrDefaultAsync(x => x.Id == feedbackId);
            if (feedback == null)
            {
                throw new UserFriendlyException(_localizer["FeedbackNotFound"], StatusCodes.Status404NotFound.ToString());
            }
            if (isDone == true)
            {
                feedback.Status = FeedbackStatus.Done.ToString();
            }
            else
            {
                feedback.Status = FeedbackStatus.ToDo.ToString();
            }
            Feedback updatedFeedback = await _feedbackRepository.UpdateAsync(feedback, true);
            ResUpdateFeedbackStatusDto result = _mapper.Map<ResUpdateFeedbackStatusDto>(updatedFeedback);
            return result;
        }

        /// <summary>
        /// Method to get course list with translations
        /// </summary>
        /// <param name="courseIds">id's of the courses which is to be fetched from the database.</param>
        /// <returns>A list of course</returns>
        private async Task<List<Course>> GetCourseListWithTranslationsAsync(List<Guid> courseIds)
        {
            return (await _courseRepository.WithDetailsAsync(x => x.Translations)).Where(x => courseIds.Contains(x.Id)).ToList();
        }


        /// <summary>
        /// Method to get the translations for the CustomCourseRequest's
        /// </summary>
        /// <param name="courseRequestList">list of course request objects done by the companies</param>
        /// <param name="courseList">list of the courses which are requested</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>list of course request objectes translated into the language which is asked for</returns>
        private async Task<List<ResCustomCourseRequestDto>> GetCourseRequestTranslationsAsync(List<ResCustomCourseRequestDto> courseRequestList, List<Course> courseList, string culture)
        {
            foreach (ResCustomCourseRequestDto courseRequest in courseRequestList)
            {
                Course? course = courseList.FirstOrDefault(x => x.Id == courseRequest.CourseId);
                if (course != null)
                {
                    CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                    if (translationForCourse != null)
                    {
                        courseRequest.Course.Language = translationForCourse.Language;
                        courseRequest.Course.Name = translationForCourse.Name;
                        courseRequest.Course.ShortDescription = translationForCourse.ShortDescription;
                        courseRequest.Course.ExamTypes = translationForCourse.ExamTypes;
                    }
                }
            }
            return courseRequestList;
        }
    }
}
