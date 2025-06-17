using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using VirtaulAid.Carts;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;
using VirtaulAid.Exams;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.MultilingualObjects;
using VirtaulAid.Permissions;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Company, Individual, Admin, Super Admin, Governor")]
    public class CourseService : ApplicationService, ICourseService
    {
        private readonly IRepository<Course> _courses;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IRepository<UserCourseEnrollments> _courseEnrollmentRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IRepository<Module> _module;
        private readonly IRepository<Cart> _cartRepository;
        private readonly CourseDomainService _courseDomainService;
        private readonly CompanyService _companyService;
        private readonly UserService _userService;
        private readonly MultiLingualObjectManager _multiLingualObjectManager;
        public AppAppsettings _options { get; }
        private readonly IMapper _mapper;
        private readonly IRepository<ExamDetail> _examDetailRepository;
        private readonly VirtualRealityDomainService _virtualRealityDomainService;
        private readonly IRepository<Course> _courseRepository;
        private readonly IRepository<Lesson> _lessonRepository;

        public CourseService(IRepository<Course> courses,
            IMapper mapper,
            IRepository<Module> module,
            IRepository<Cart> cartRepository,
            CourseDomainService courseDomainService,
            CompanyService companyService,
            UserService userService,
            IOptions<AppAppsettings> options,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IRepository<UserCourseEnrollments> courseEnrollmentRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<ExamDetail> examDetailRepository,
            IRepository<Course> courseRepository,
            VirtualRealityDomainService virtualRealityDomainService,
            MultiLingualObjectManager multiLingualObjectManager,
            IRepository<Lesson> lessonRepository)
        {
            _courses = courses;
            _mapper = mapper;
            _module = module;
            _cartRepository = cartRepository;
            _courseDomainService = courseDomainService;
            _companyService = companyService;
            _userService = userService;
            _options = options.Value;
            _courseDomainService = courseDomainService;
            _companyService = companyService;
            _userService = userService;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _localizer = localizer;
            _examDetailRepository = examDetailRepository;
            _virtualRealityDomainService = virtualRealityDomainService;
            _multiLingualObjectManager = multiLingualObjectManager;
            _courseRepository = courseRepository;
            _lessonRepository = lessonRepository;
        }

        /// <summary>
        /// Method is to return all the available courses.
        /// </summary>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List<ResAllCourseDto></returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<List<ResAllCourseDto>> GetAllCoursesAsync(string culture)
        {
            bool check = await AuthorizationService.IsGrantedAsync(VirtaulAidPermissions.Course.Default);
            await AuthorizationService.CheckAsync(VirtaulAidPermissions.Course.Default);

            //List<Course> allCourses = await _courses.ToListAsync();
            List<ResAllCourseDto> result = new();
            List<Course> allCourses = (await _courses.WithDetailsAsync(x => x.Translations)).ToList();
            foreach(var course in allCourses)
            {
                var courseDto = _mapper.Map<ResAllCourseDto>(course);

                var translation = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                if (translation != null)
                {
                    courseDto.Name = translation.Name;
                    courseDto.ShortDescription = translation.ShortDescription;
                    courseDto.Language = translation.Language;
                }
                result.Add(courseDto);
            }
            //List<ResAllCourseDto> result = _mapper.Map<List<ResAllCourseDto>>(allCourses);
            return result;
        }

        /// <summary>
        /// This method returns course details for the courseId provided.
        /// </summary>
        /// <param name="courseId">Guid</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List<ResCourseDetailDto></returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<ResCourseDetailDto> GetCourseDetailAsync(Guid courseId, string culture)
        {
            Course? course = (await _courses.WithDetailsAsync(x => x.Translations)).FirstOrDefault(c => c.Id == courseId);

            //check if the course exists or not
            if (course == null)
            {
                throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            ResCourseDetailDto courseDetailDto = _mapper.Map<ResCourseDetailDto>(course);
            CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
            if(translationForCourse != null)
            {
                courseDetailDto.Language = translationForCourse.Language;
                courseDetailDto.Name = translationForCourse.Name;
                courseDetailDto.Description = translationForCourse.Description;
                courseDetailDto.ShortDescription = translationForCourse.ShortDescription;
                courseDetailDto.LearningOutcomes = translationForCourse.LearningOutcomes;
            }

            List<ModuleDto> moduleDtoList = new List<ModuleDto>();

            List<Module> modules = (await _module.WithDetailsAsync(x => x.Translations)).Where(x => x.CourseId == courseId).ToList();
            foreach(Module module in modules)
            {
                ModuleDto moduleDto = _mapper.Map<ModuleDto>(module);
                var translationForModule = await _multiLingualObjectManager.FindTranslationAsync<Module, ModuleTranslation>(module, culture, true);
                if(translationForModule != null)
                {
                    moduleDto.Language = translationForModule.Language;
                    moduleDto.Name = translationForModule.Name;
                }
                List<Lesson> lessons = (await _lessonRepository.WithDetailsAsync(x => x.Translations)).Where(x => x.ModuleId == module.Id).ToList();
                List<LessonDto> lessonDtoList = new();
                foreach(Lesson lesson in lessons)
                {
                    LessonDto lessonDto = _mapper.Map<LessonDto>(lesson);
                    LessonTranslation translationForLesson = await _multiLingualObjectManager.FindTranslationAsync<Lesson, LessonTranslation>(lesson, culture, true);
                    if(translationForLesson != null)
                    {
                        lessonDto.Language = translationForLesson.Language;
                        lessonDto.Name = translationForLesson.Name;
                    }
                    lessonDtoList.Add(lessonDto);
                }
                moduleDto.Lessons = lessonDtoList;
                moduleDtoList.Add(moduleDto);
            }
            courseDetailDto.Modules = moduleDtoList;

            return courseDetailDto;
        }

        /// <summary>
        /// Method is to create a new course.
        /// </summary>
        /// <param name="req">ReqAddCourseDto</param>
        /// <returns>string</returns>
        [Authorize(VirtaulAidPermissions.Course.Create)]
        public async Task<string> PostCourseAsync(ReqAddCourseDto req)
        {
            Course newCourse = _mapper.Map<Course>(req);
            await _courses.InsertAsync(newCourse, autoSave: true);
            return _localizer["CourseSavedSuccess"];
        }

        /// <summary>
        /// Method is to create a module, which is required in the course detail Api
        /// </summary>
        /// <param name="req">Details of Module to be added</param>
        /// <returns>string</returns>
        [Authorize]
        public async Task<string> AddModule(ReqAddModuleDto req)
        {
            Module newModule = _mapper.Map<Module>(req);
            await _module.InsertAsync(newModule, autoSave: true);
            return _localizer["ModuleAddedSuccess"];
        }

        /// <summary>
        /// Method to get all subscribed courses done by company.
        /// </summary>
        /// <param name="companyId">id of the company.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of subscribed Courses with employoee details.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<ICollection<SubscribedCourseDto>> GetAllSubscribedCoursesByCompanyIdAsync(string companyId, string culture)
        {
            ICollection<CourseSubscriptionMapping> allSubscriptionsForCompany = await _courseDomainService.GetAllSubscriptionByCompanyIdAsync(companyId);
            ICollection<UserCourseEnrollments> allUserCourseEnrollments = await _courseDomainService.GetAllUserCourseEnrollmentsByCompanyIdAsync(allSubscriptionsForCompany);
            List<SubscribedCourseDto> subscribedCourseDtos = new();
            ICollection<UserDetail> employees = await _userService.GetEmployeeListByCompanyIdAsync(Guid.Parse(companyId));
            List<Guid> employeeIds = employees.Select(x => x.Id).ToList();
            List<UserCourseEnrollments> userCourseEnrollmentsByEmployees = (await _courseEnrollmentRepository.WithDetailsAsync(x => x.CourseSubscriptionMapping.UserDetail, y => y.CourseSubscriptionMapping.Course)).Where(x => x.CourseSubscriptionMapping.UserId != null && employeeIds.Contains((Guid)x.CourseSubscriptionMapping.UserId)).ToList();
            foreach (var subscription in allSubscriptionsForCompany)
            {
                SubscribedCourseDto subscribedCourseDto = new();
                ResCourseDetailDto courseDetail = ObjectMapper.Map<Course, ResCourseDetailDto>(subscription.Course);
                Course? course = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == subscription.Course.Id);
                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                if(translationForCourse != null )
                {
                    courseDetail.Language = translationForCourse.Language;
                    courseDetail.Name = translationForCourse.Name;
                    courseDetail.Description = translationForCourse.Description;
                    courseDetail.ShortDescription = translationForCourse.ShortDescription;
                    courseDetail.LearningOutcomes = translationForCourse.LearningOutcomes;
                }
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
            return subscribedCourseDtos;
        }

        /// <summary>
        /// Method to update subscribed courses done by company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="examtype">Exam type.</param>
        /// <param name="requiredTotalCount">count of the subscriptions.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.Course.Edit)]
        public async Task UpdateSubscribedCoursesByCompanyIdAsync(string companyId, string courseId, string examtype, int requiredTotalCount)
        {
            ICollection<CourseSubscriptionMapping> allSubscriptionsForCompany = await _courseDomainService.GetAllSubscriptionByCompanyIdAsync(companyId);
            ICollection<UserCourseEnrollments> allUserCourseEnrollments = await _courseDomainService.GetAllUserCourseEnrollmentsByCompanyIdAsync(allSubscriptionsForCompany);
            List<SubscribedCourseDto> subscribedCourseDtos = new();
            ICollection<UserDetail> employees = await _userService.GetEmployeeListByCompanyIdAsync(Guid.Parse(companyId));
            List<Guid> employeeIds = employees.Select(x => x.Id).ToList();
            List<UserCourseEnrollments> userCourseEnrollmentsByEmployees = (await _courseEnrollmentRepository.WithDetailsAsync(x => x.CourseSubscriptionMapping.UserDetail, y => y.CourseSubscriptionMapping.Course)).Where(x => x.CourseSubscriptionMapping.UserId != null && employeeIds.Contains((Guid)x.CourseSubscriptionMapping.UserId)).ToList();

            List<CourseSubscriptionMapping> courseSubscriptionMappingsToBeUpdate = new List<CourseSubscriptionMapping>();
            var allSubscriptionsGroupedByCourse = allSubscriptionsForCompany.GroupBy(
            ce => new { ce.CourseId, ce.ExamType });

            foreach (var group in allSubscriptionsGroupedByCourse)
            {
                if (group.Key.CourseId.ToString() == courseId && group.Key.ExamType == examtype)
                {
                    int remainingCount = 0;
                    int totalCount = 0;
                    foreach (var subscription in group)
                    {
                        remainingCount += subscription.RemainingCount;
                        totalCount += subscription.TotalCount;
                    }

                    if (requiredTotalCount > totalCount)
                    {
                        int incrementCount = requiredTotalCount - totalCount;
                        group.First().TotalCount += incrementCount;
                        group.First().RemainingCount += incrementCount;
                        courseSubscriptionMappingsToBeUpdate.Add(group.First());
                    }
                    else if (requiredTotalCount < totalCount)
                    {
                        // It will be count which will be reduced from total count.
                        int decrementCount = totalCount - requiredTotalCount;

                        if ((remainingCount > 0 && remainingCount < decrementCount) || decrementCount < 0)
                        {
                            throw new UserFriendlyException(_localizer["CountMisMatched"], StatusCodes.Status409Conflict.ToString());
                        }

                        foreach (var subscription in group)
                        {
                            if (decrementCount > 0 && subscription.RemainingCount > 0)
                            {
                                if (subscription.RemainingCount <= decrementCount)
                                {
                                    decrementCount -= subscription.RemainingCount;
                                    subscription.RemainingCount = 0;
                                    subscription.TotalCount -= subscription.RemainingCount;
                                }
                                else
                                {
                                    subscription.RemainingCount -= decrementCount;
                                    subscription.TotalCount -= decrementCount;
                                    decrementCount = 0;
                                }
                                courseSubscriptionMappingsToBeUpdate.Add(subscription);
                            }
                        }
                    }


                }
            }

            if (courseSubscriptionMappingsToBeUpdate.Count > 0)
            {
                await _courseSubscriptionRepository.UpdateManyAsync(courseSubscriptionMappingsToBeUpdate);
            }
        }

        /// <summary>
        /// Method to get all subscribed courses done by user.
        /// </summary>
        /// <param name="userId">Individual user id.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of subscribed course details.</returns>
        [Authorize(VirtaulAidPermissions.CourseSubscription.Default)]
        public async Task<ICollection<ResCourseDetailDto>> GetAllSubscribedCoursesByUserIdAsync(string userId, string culture)
        {
            ICollection<Course> subscribedCourses = await _courseDomainService.GetAllSubscribedCousesByUserIdAsync(userId);
            List<ResCourseDetailDto> result = new();
            List<Course> courseListWithTranslations = new();
            foreach(var course in subscribedCourses)
            {
                Course courseWithTranslation = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == course.Id);
                courseListWithTranslations.Add(courseWithTranslation);
            }
            foreach(Course course in courseListWithTranslations)
            {
                ResCourseDetailDto courseDetailDto = _mapper.Map<ResCourseDetailDto>(course);
                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                if(translationForCourse != null)
                {
                    courseDetailDto.Language = translationForCourse.Language;
                    courseDetailDto.Name = translationForCourse.Name;
                    courseDetailDto.Description = translationForCourse.Description;
                    courseDetailDto.ShortDescription = translationForCourse.ShortDescription;
                    courseDetailDto.LearningOutcomes = translationForCourse.LearningOutcomes;
                }
                result.Add(courseDetailDto);
            }
            return result;
        }

        /// <summary>
        /// Method to subscribed bulk courses either by company or user.
        /// </summary>
        /// <param name="courseSubscriptions">List of course subscriptions details.</param>
        /// <param name="buyerId">id of the user or company.</param>
        /// <param name="isCompany">True if subscriber is company otherwise false for user.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.CourseSubscription.Create)]
        public async Task PostSubscribeBulkCoursesAsync(ICollection<CourseSubscriptionDto> courseSubscriptions, string buyerId, bool isCompany)
        {
            if (courseSubscriptions.Count > 0)
            {
                foreach (var courseSubscriptionDto in courseSubscriptions)
                {
                    courseSubscriptionDto.PurchasedDate = DateTime.Now;
                    courseSubscriptionDto.ExpirationDate = DateTime.Now.AddYears(_options.CourseExpirationInYears);
                }
            }

            if (isCompany)
            {
                bool isExist = await _companyService.IsCompanyExistByCompanyId(buyerId);
                if (isExist)
                {
                    await _courseDomainService.SubscribeBulkCoursesAsync(ObjectMapper.Map<ICollection<CourseSubscriptionDto>, ICollection<CourseSubscriptionMapping>>(courseSubscriptions));

                    // Remove cart items after purchase
                    List<Cart> cartList = await _cartRepository.GetListAsync(x => x.CompanyId == Guid.Parse(buyerId));
                    if (cartList != null && cartList.Count > 0)
                    {
                        await _cartRepository.DeleteManyAsync(cartList);
                    }
                }
            }
            else
            {
                bool isExist = await _userService.IsUserExistByIdAsync(buyerId);
                if (isExist)
                {
                    await _courseDomainService.SubscribeBulkCoursesAsync(ObjectMapper.Map<ICollection<CourseSubscriptionDto>, ICollection<CourseSubscriptionMapping>>(courseSubscriptions));

                    // Remove cart items after purchase
                    List<Cart> cartList = await _cartRepository.GetListAsync(x => x.UserId == Guid.Parse(buyerId));
                    if (cartList != null && cartList.Count > 0)
                    {
                        await _cartRepository.DeleteManyAsync(cartList);
                    }
                }
            }
        }

        /// <summary>
        /// Method to assign course to bulk users.
        /// </summary>
        /// <param name="userIds">List of userIds.</param>
        /// <param name="courseSubscriptionId">course subscription id.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.UserEnrollment.Create)]
        public async Task PostAssignCourseToBulkUsersAsync(ICollection<string> userIds, int courseSubscriptionId)
        {
            await _courseDomainService.AssignCourseToBulkUsersAsync(userIds, courseSubscriptionId);
        }

        /// <summary>
        /// Method to get all enrolled courses by user id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of enrolled course details.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<ICollection<ResCourseDetailDto>> GetAllEnrolledCoursesByUserIdAsync(string userId, string culture)
        {
            List<ResCourseDetailDto> resultList = await _courseDomainService.GetAllEnrolledCoursesByUserAsync(userId);
            foreach(ResCourseDetailDto course in resultList)
            {
                Course courseWithTranslation = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == course.Id);
                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseWithTranslation, culture, true);
                if(translationForCourse != null)
                {
                    course.Language = translationForCourse.Language;
                    course.Name = translationForCourse.Name;
                    course.Description = translationForCourse.Description;
                    course.ShortDescription = translationForCourse.ShortDescription;
                    course.LearningOutcomes = translationForCourse.LearningOutcomes;
                }
            }
            return resultList;
        }

        /// <summary>
        /// Method to get the user course enrollment details.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>User course enrollment details.</returns>
        [Authorize(VirtaulAidPermissions.UserEnrollment.Default)]
        public async Task<UserCourseEnrollmentDto> GetUserCourseEnrollmentDetailsAsync(string userId, string courseId, string examType)
        {
            UserCourseEnrollments userCourseEnrollment = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId, courseId, examType);
            UserCourseEnrollmentDto userCourseEnrollmentDto = ObjectMapper.Map<UserCourseEnrollments, UserCourseEnrollmentDto>(userCourseEnrollment);
            return userCourseEnrollmentDto;
        }

        /// <summary>
        /// Method to update progress of on going course.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="lessonId">Id of the lesson.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>User course enrollment details.</returns>
        [Authorize(VirtaulAidPermissions.UserEnrollment.Edit)]
        public async Task<UserCourseEnrollmentDto> UpdateProgressForCourseByLessonIdAsync(string userId, string courseId, string lessonId, string examType)
        {
            UserCourseEnrollments userCourseEnrollment = await _courseDomainService.UpdateProgressForCourseByLessonIdAsync(userId, courseId, lessonId, examType);
            UserCourseEnrollmentDto userCourseEnrollmentDto = ObjectMapper.Map<UserCourseEnrollments, UserCourseEnrollmentDto>(userCourseEnrollment);
            return userCourseEnrollmentDto;
        }

        /// <summary>
        /// Method to generate token for virtual reality system.
        /// </summary>
        /// <param name="emailId"></param>
        /// <returns>Token details for user.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<VRSectionTestDto> GenerateVirtualRealityTokenAsync(string emailId)
        {
            VRSectionTestDto result = await _virtualRealityDomainService.GenerateVirtualRealityTokenAsync(emailId);
            return result;
        }

        /// <summary>
        /// Method to get all the UnSubscribed courses by Individual.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of UnSubscribed courses.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<List<ResAllUnSubscribedCoursesDto>> GetAllUnSubscribedCoursesAsync(Guid userId, string culture)
        {
            List<Course> allCourses = (await _courses.WithDetailsAsync(x => x.Translations)).ToList();
            ICollection<Course> courseDetails = await _courseDomainService.GetNotExpiredAllEnrolledCoursesByUserIdAsync(userId.ToString());
            List<Guid> idsOfSubscribedCoursesByUser = new();

            foreach (Course course in courseDetails)
            {
                idsOfSubscribedCoursesByUser.Add(course.Id);
            }

            List<ResAllUnSubscribedCoursesDto> result = new List<ResAllUnSubscribedCoursesDto>();
            foreach (Course course in allCourses)
            {
                if (!idsOfSubscribedCoursesByUser.Contains(course.Id))
                {
                    ResAllUnSubscribedCoursesDto courseDto = _mapper.Map<ResAllUnSubscribedCoursesDto>(course);
                    CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(course, culture, true);
                    if (translationForCourse != null)
                    {
                        courseDto.Language = translationForCourse.Language;
                        courseDto.Name = translationForCourse.Name;
                        courseDto.ShortDescription = translationForCourse.ShortDescription;
                    }
                    result.Add(courseDto);
                }
            }
            return result;
        }

        /// <summary>
        /// Method to get all the courses of Individual.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of all courses.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<ICollection<ResAllCoursesForIndividualDto>> GetAllCoursesForIndividualAsync(Guid userId, string culture)
        {
            ICollection<ResAllCoursesForIndividualDto> courses = await _courseDomainService.GetAllCoursesForIndividualAsync(userId);

            foreach(ResAllCoursesForIndividualDto course in courses)
            {
                Course courseWithTranslation = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == course.Id);

                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseWithTranslation, culture, true);
                if (translationForCourse != null)
                {
                    course.Language = translationForCourse.Language;
                    course.Name = translationForCourse.Name;
                    course.Description = translationForCourse.Description;
                    course.ShortDescription = translationForCourse.ShortDescription;
                    course.LearningOutcomes = translationForCourse.LearningOutcomes;
                }
            }
            return courses;
        }

        /// <summary>
        /// Method to get most popular courses.
        /// </summary>
        /// <param name="culture">specifies the culture of the language</param>
        /// <param name="userId">Unique Id of the user</param>
        /// <returns>List of most popular courses.</returns>
        [Authorize(VirtaulAidPermissions.Course.Default)]
        public async Task<List<MostPopularCoursesDto>> GetMostPopularCoursesAsync(string culture, Guid? userId = null)
        {
            List<MostPopularCoursesDto> result = await _courseDomainService.GetMostPopularCoursesAsync(userId);
            foreach(MostPopularCoursesDto course in result)
            {
                Course courseWithTranslation = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == course.Id);
                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseWithTranslation, culture, true);
                if(translationForCourse != null)
                {
                    course.Language = translationForCourse.Language;
                    course.Name = translationForCourse.Name;
                    course.ShortDescription = translationForCourse.ShortDescription;
                }
            }
            return result;
        }

        /// <summary>
        /// Method is to course Enrollment to the user after payment successful.
        /// </summary>
        /// <param name="userId">UserId.</param>
        /// <returns>Task Empty.</returns>
        [Authorize(VirtaulAidPermissions.UserEnrollment.Create)]
        public async Task PostAssignCourseToUserAsync(Guid userId)
        {
            await _courseDomainService.AssignCourseToUserAsync(userId);
        }

        /// <summary>
        /// Method is for get the all expired certificate history.
        /// </summary>
        /// <param name="userId">id of user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>list of ResAllCoursesForIndividualDto.</returns>
        [Authorize(VirtaulAidPermissions.CourseSubscription.Default)]
        public async Task<List<ResAllCoursesForIndividualDto>> GetExpiredCertificateHistoryAsync(Guid userId, string culture)
        {
            ICollection<ResAllCoursesForIndividualDto> result = await _courseDomainService.GetAllCoursesForIndividualAsync(userId);
            result = result.Where(x => x.CertificateExpirationDate <= DateTime.Now).ToList();
            foreach(ResAllCoursesForIndividualDto course in result)
            {
                Course courseWithTranslation = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == course.Id);
                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseWithTranslation, culture, true);
                if (translationForCourse != null)
                {
                    course.Language = translationForCourse.Language;
                    course.Name = translationForCourse.Name;
                    course.Description = translationForCourse.Description;
                    course.LearningOutcomes = translationForCourse.LearningOutcomes;
                    course.ShortDescription = translationForCourse.ShortDescription;
                }
            }
            return result.ToList();
        }

        /// <summary>
        /// Method is to credit course to the individual by admin.
        /// </summary>
        /// <param name="courseSubscriptionDto">CourseSubscriptionMapping object with all required details.</param>
        /// <param name="userId">User id.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.CourseSubscription.Create)]
        public async Task PostCreditCourseToIndividualAsync(CourseSubscriptionDto courseSubscriptionDto, Guid userId)
        {
            courseSubscriptionDto.PurchasedDate = DateTime.Now;
            courseSubscriptionDto.ExpirationDate = DateTime.Now.AddYears(_options.CourseExpirationInYears);
            courseSubscriptionDto.UserId = userId;
            await _courseDomainService.CreditCourseToIndividualAsync(_mapper.Map<CourseSubscriptionMapping>(courseSubscriptionDto));
        }

        /// <summary>
        /// Method is to flag true for course completed.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="courseId">Course id that was completed.</param>
        /// <param name="examType">Course exam type i.e. live, VR, Online.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.UserEnrollment.Edit)]
        public async Task PostCourseCompletedAsync(string userId, string courseId, string examType)
        {
            UserCourseEnrollments userCourseEnrollmentDetails = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId, courseId, examType);
            userCourseEnrollmentDetails.CourseEndDate = DateTime.Now;            
            if (userCourseEnrollmentDetails.Progress > 100)
                userCourseEnrollmentDetails.Progress = 100;

            if (userCourseEnrollmentDetails.ExamType.Equals(_localizer["Live"]))
            {
                userCourseEnrollmentDetails.Progress = 100 - 5;               
            }
            else
            {
                userCourseEnrollmentDetails.IsCompleted = true;
                userCourseEnrollmentDetails.Progress = 100;
                userCourseEnrollmentDetails.CertificateExpirationDate = DateTime.Now.AddMonths(12);
            }

            await _courseDomainService.UpdateCourseEnrollmentDetailsAsync(userCourseEnrollmentDetails);

        }
    }
}
