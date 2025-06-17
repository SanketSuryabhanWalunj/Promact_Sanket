using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Exams;
using VirtaulAid.Localization;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class CourseDomainService : DomainService
    {
        private readonly IRepository<Course> _courseRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionMapping;
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollment;
        private readonly IRepository<Lesson> _lessonRepository;
        private readonly IRepository<Module> _moduleRepository;
        private readonly IRepository<ExamDetail> _examDetailRepository;
        private readonly IMapper _mapper;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;

        public CourseDomainService(IRepository<Course> courseRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionMapping,
            IRepository<UserDetail> userRepository,
            IRepository<UserCourseEnrollments> userCourseEnrollment,
            IRepository<Lesson> lessonRepository,
            IRepository<Module> moduleRepository,
            IMapper mapper,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<ExamDetail> examDetailRepository)
        {
            _courseRepository = courseRepository;
            _courseSubscriptionMapping = courseSubscriptionMapping;
            _userRepository = userRepository;
            _userCourseEnrollment = userCourseEnrollment;
            _lessonRepository = lessonRepository;
            _moduleRepository = moduleRepository;
            _mapper = mapper;
            _localizer = localizer;
            _examDetailRepository = examDetailRepository;
        }

        /// <summary>
        /// Method to get all courses.
        /// </summary>
        /// <returns>List of courses.</returns>
        public async Task<ICollection<Course>> GetAllCoursesAsync()
        {
            List<Course> courses = await _courseRepository.GetListAsync();
            return courses;
        }

        /// <summary>
        /// Method to get all subscribed courses by company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>List of Course subscription entities.</returns>
        public async Task<ICollection<CourseSubscriptionMapping>> GetAllSubscriptionByCompanyIdAsync(string companyId)
        {
            List<CourseSubscriptionMapping> subscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => x.CompanysId == Guid.Parse(companyId)).ToList();
            return subscriptionsList;
        }

        /// <summary>
        /// Method to get list of courses enrolled by employees in a company.
        /// </summary>
        /// <param name="courseSubscriptionMappings">List of subscribed courses by company.</param>
        /// <returns>List of courses with enrolled user details.</returns>
        public async Task<ICollection<UserCourseEnrollments>> GetAllUserCourseEnrollmentsByCompanyIdAsync(ICollection<CourseSubscriptionMapping> courseSubscriptionMappings)
        {
            List<int> subscriptionIds = courseSubscriptionMappings.Select(x => x.Id).ToList();
            List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollment.GetListAsync(x => subscriptionIds.Contains(x.CourseSubscriptionId));
            List<UserCourseEnrollments> userCourseEnrollmentsList = (await _userCourseEnrollment.WithDetailsAsync(x => x.User)).AsQueryable().Where(x => subscriptionIds.Contains(x.CourseSubscriptionId)).ToList();
            return userCourseEnrollmentsList;
        }

        /// <summary>
        /// Method to get all subscribed courses by user.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>List of the courses.</returns>
        public async Task<ICollection<Course>> GetAllSubscribedCousesByUserIdAsync(string userId)
        {
            List<CourseSubscriptionMapping> subscribedCourses = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).Where(x => x.UserId == Guid.Parse(userId)).ToList();
            return subscribedCourses.Select(x => x.Course).ToList();
        }

        /// <summary>
        /// Method to get course details by course id.
        /// </summary>
        /// <param name="courseId">Id of the course.</param>
        /// <returns>Details of the course.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<Course> GetCourseDetailsByCourseIdAsync(string courseId)
        {
            Course courseDetails = await _courseRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(courseId));
            if (courseDetails == null)
            {
                throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            return courseDetails;
        }

        /// <summary>
        /// This method gets the course details with translations from the database.
        /// </summary>
        /// <param name="courseId">Id of the course.</param>
        /// <returns>An object of the Course containing course details with translations.</returns>
        /// <exception cref="UserFriendlyException">Throws exception when course is not found.</exception>
        public async Task<Course> GetCourseDetailsWithTranslationByCourseIdAsync(Guid courseId)
        {
            Course? courseDetails = (await _courseRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == courseId);
            if(courseDetails == null)
            {
                throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            return courseDetails;
        }

        /// <summary>
        /// Method to create a course.
        /// </summary>
        /// <param name="course">Course details.</param>
        /// <returns>Details of created course.</returns>
        public async Task<Course> CreateCourseAsync(Course course)
        {
            Course courseExist = await _courseRepository.FirstOrDefaultAsync(x => x.Name == course.Name);
            if (courseExist == null)
            {
                course = await _courseRepository.InsertAsync(course, true);
            }
            return course;
        }

        /// <summary>
        /// Method to subscribe courses either by compnay or individual user.
        /// </summary>
        /// <param name="courseSubscriptionMappings">List of course subscription mapping object.</param>
        /// <returns>Task.</returns>
        public async Task SubscribeBulkCoursesAsync(ICollection<CourseSubscriptionMapping> courseSubscriptionMappings)
        {
            try
            {
                if (courseSubscriptionMappings.Count > 0)
                {
                    await _courseSubscriptionMapping.InsertManyAsync(courseSubscriptionMappings.ToList(), true);
                    List<Course> listOfCourses = new List<Course>();
                    foreach (CourseSubscriptionMapping course in courseSubscriptionMappings)
                    {
                        Course obj = await _courseRepository.FirstOrDefaultAsync(x => x.Id == course.CourseId);
                        int QuantitySold = obj.QuantitySold;
                        QuantitySold += course.TotalCount;
                        obj.QuantitySold = QuantitySold;
                        listOfCourses.Add(obj);
                    }
                    await _courseRepository.UpdateManyAsync(listOfCourses, true);
                    var subscriptionWithCourse = await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course);
                    var alreadyExistSubscriptionWithSameCourseWise = subscriptionWithCourse.OrderByDescending(x => x.Id).GroupBy(x => x.Course.Name);
                    List<CourseSubscriptionMapping> subscriptionToBeUpdate = new List<CourseSubscriptionMapping>();

                    // We are updating existig course expiration with new course subscription because it is latest as per currect scope of mvp.
                    foreach (var courseSubscriptionMapping in alreadyExistSubscriptionWithSameCourseWise)
                    {
                        courseSubscriptionMapping.OrderByDescending(x => x.Id).ToList();
                        foreach (CourseSubscriptionMapping item in courseSubscriptionMapping)
                        {
                            item.ExpirationDate = courseSubscriptionMapping.First().ExpirationDate;
                            subscriptionToBeUpdate.Add(item);
                        }
                    }
                    subscriptionToBeUpdate = subscriptionToBeUpdate.Distinct().ToList();
                    await _courseSubscriptionMapping.UpdateManyAsync(subscriptionToBeUpdate, true);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Method to assign single course to multiple users.
        /// </summary>
        /// <param name="userIds">List of user ids.</param>
        /// <param name="courseSubscriptionId">course subscription id.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task AssignCourseToBulkUsersAsync(ICollection<string> userIds, int courseSubscriptionId)
        {
            IQueryable<CourseSubscriptionMapping> courseSubscriptionWithCourse = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course));
            CourseSubscriptionMapping courseSubscription = courseSubscriptionWithCourse.AsQueryable().FirstOrDefault(x => x.Id == courseSubscriptionId);
            List<CourseSubscriptionMapping> courseSubscriptionList = courseSubscriptionWithCourse.ToList();
            if (courseSubscription != null)
            {
                if (courseSubscription.UserId != null)
                {
                    courseSubscriptionList = courseSubscriptionWithCourse.Where(x => x.Course.Name == courseSubscription.Course.Name && x.UserId == courseSubscription.UserId && x.CourseId == courseSubscription.CourseId && x.ExamType == courseSubscription.ExamType).ToList();
                }
                if (courseSubscription.CompanysId != null)
                {
                    courseSubscriptionList = courseSubscriptionWithCourse.Where(x => x.Course.Name == courseSubscription.Course.Name && x.CompanysId == courseSubscription.CompanysId && x.CourseId == courseSubscription.CourseId && x.ExamType == courseSubscription.ExamType).ToList();
                }
            }

            if (courseSubscription == null)
            {
                throw new UserFriendlyException(_localizer["CourseNotPurchased"], StatusCodes.Status403Forbidden.ToString());
            }

            List<UserDetail> existUsers = await _userRepository.GetListAsync(x => userIds.Contains(x.Id.ToString()));
            List<UserCourseEnrollments> userEnrollments = new List<UserCourseEnrollments>();
            List<CourseSubscriptionMapping> courseSubscriptionsToBeUpdate = new List<CourseSubscriptionMapping>();

            if (existUsers.Count == userIds.Count)
            {
                foreach (UserDetail user in existUsers)
                {
                    CourseSubscriptionMapping courseSubscriptionWithRemainingCount = courseSubscriptionList.FirstOrDefault(x => x.RemainingCount <= x.TotalCount && x.RemainingCount > 0);
                    if (courseSubscriptionWithRemainingCount != null)
                    {
                        UserCourseEnrollments userCourseEnrollment = new()
                        {
                            UserId = user.Id,
                            CourseSubscriptionId = courseSubscriptionWithRemainingCount.Id,
                            EnrolledDate = DateTime.Now,
                            ExpirationDate = courseSubscription.ExpirationDate,
                            ExamType = courseSubscription.ExamType,
                        };
                        userEnrollments.Add(userCourseEnrollment);

                        // We are updating the number of subscription count when some count is assign to some employee.
                        courseSubscriptionWithRemainingCount.RemainingCount = courseSubscriptionWithRemainingCount.RemainingCount > 0 ? courseSubscriptionWithRemainingCount.RemainingCount - 1 : courseSubscriptionWithRemainingCount.RemainingCount;

                        int checkCourseSubscriptionExistDetailsIndex = courseSubscriptionsToBeUpdate.FindIndex(x => x.Id == courseSubscriptionWithRemainingCount.Id);

                        if (checkCourseSubscriptionExistDetailsIndex != -1)
                        {
                            courseSubscriptionsToBeUpdate[checkCourseSubscriptionExistDetailsIndex].RemainingCount = courseSubscriptionWithRemainingCount.RemainingCount;
                        }
                        else
                        {
                            courseSubscriptionsToBeUpdate.Add(courseSubscriptionWithRemainingCount);
                        }

                    }
                }
            }
            else
            {
                throw new UserFriendlyException(_localizer["SomeUserNotExist"], StatusCodes.Status403Forbidden.ToString());
            }

            if (userEnrollments.Count > 0)
            {
                await _userCourseEnrollment.InsertManyAsync(userEnrollments, true);
                courseSubscriptionsToBeUpdate = courseSubscriptionsToBeUpdate.Distinct().ToList();
                // We are updating the number of subscription count when some count is assign to some employee.
                await _courseSubscriptionMapping.UpdateManyAsync(courseSubscriptionsToBeUpdate, true);
            }
        }

        /// <summary>
        /// Method get all enrolled courses by userId.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>List of course.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ICollection<Course>> GetAllEnrolledCoursesByUserIdAsync(string userId)
        {
            UserDetail userDetails = (await _userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(userId)));
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<Course> courseList = new();
            List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollment.GetListAsync(x => x.UserId == Guid.Parse(userId));
            List<int> courseSubscriptionIds = userCourseEnrollments.Select(x => x.CourseSubscriptionId).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => courseSubscriptionIds.Contains(x.Id)).ToList();
            foreach (CourseSubscriptionMapping courseSubscription in courseSubscriptionsList)
            {
                courseList.Add(courseSubscription.Course);
            }
            return courseList;
        }

        /// <summary>
        /// Method get not expired all enrolled courses by userId.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>List of course that are not expired.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ICollection<Course>> GetNotExpiredAllEnrolledCoursesByUserIdAsync(string userId)
        {
            UserDetail userDetails = (await _userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(userId)));
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<Course> courseList = new();
            List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollment.
                GetListAsync(x => x.UserId == Guid.Parse(userId) && x.ExpirationDate > DateTime.Now && x.CertificateExpirationDate > DateTime.Now);
            List<int> courseSubscriptionIds = userCourseEnrollments.Select(x => x.CourseSubscriptionId).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => courseSubscriptionIds.Contains(x.Id)).ToList();
            foreach (CourseSubscriptionMapping courseSubscription in courseSubscriptionsList)
            {
                courseList.Add(courseSubscription.Course);
            }
            return courseList;
        }

        /// <summary>
        /// Method to get inprogress enrolled courses by userId.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>List of course that are not expired.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ICollection<Course>> GetAllInprogressEnrolledCoursesByUserIdAsync(string userId)
        {
            UserDetail userDetails = (await _userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(userId)));
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<Course> courseList = new();
            List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollment.
                GetListAsync(x => x.UserId == Guid.Parse(userId) && !x.IsCompleted && x.ExpirationDate > DateTime.Now && x.CertificateExpirationDate > DateTime.Now);
            List<int> courseSubscriptionIds = userCourseEnrollments.Select(x => x.CourseSubscriptionId).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => courseSubscriptionIds.Contains(x.Id)).ToList();
            foreach (CourseSubscriptionMapping courseSubscription in courseSubscriptionsList)
            {
                courseList.Add(courseSubscription.Course);
            }
            return courseList;
        }

        /// <summary>
        /// Method to get all courses enrolled by user
        /// </summary>
        /// <param name="userId">Required user id of a user</param>
        /// <returns>list of courses enrolled by user</returns>
        public async Task<List<ResCourseDetailDto>> GetAllEnrolledCoursesByUserAsync(string userId)
        {
            List<UserCourseEnrollments> allCoursesEnrolledByUser = await _userCourseEnrollment.GetListAsync(x => x.UserId == Guid.Parse(userId));
            List<ResCourseDetailDto> resultList = new();
            foreach (UserCourseEnrollments course in allCoursesEnrolledByUser)
            {
                ResCourseDetailDto resultObject = new();
                int courseSubscriptionId = course.CourseSubscriptionId;
                CourseSubscriptionMapping courseMappingOfCourseEnrolledByUser = await _courseSubscriptionMapping.GetAsync(x => x.Id == courseSubscriptionId);
                Guid courseId = courseMappingOfCourseEnrolledByUser.CourseId;
                Course courseEnrolledByUser = await _courseRepository.GetAsync(x => x.Id == courseId);
                ExamDetail examDetail = await _examDetailRepository.GetAsync(x => x.CourseId == courseId);
                int examDetailId = examDetail.Id;
                resultObject = _mapper.Map<ResCourseDetailDto>(courseEnrolledByUser);
                resultObject.ExpirationDate = course.ExpirationDate;
                resultObject.EnrolledDate = course.EnrolledDate;
                resultObject.IsCompleted = course.IsCompleted;
                resultObject.Progress = course.Progress;
                resultObject.CertificateExpirationDate = course.CertificateExpirationDate;
                resultObject.ExamType = course.ExamType;
                resultObject.ExamDetailId = examDetailId;
                resultList.Add(resultObject);
            }
            return resultList;
        }

        /// <summary>
        /// Method to get the most popular courses
        /// </summary>
        /// <param name="userId">Optional field, Id of the user</param>
        /// <returns>list of most popular courses</returns>
        public async Task<List<MostPopularCoursesDto>> GetMostPopularCoursesAsync(Guid? userId = null)
        {
            List<Course> allCourses = await _courseRepository.GetListAsync();           
            allCourses = allCourses.OrderByDescending(c => c.QuantitySold).ToList();
            List<MostPopularCoursesDto> result = _mapper.Map<List<MostPopularCoursesDto>>(allCourses);
            return result;
        }

        /// <summary>
        /// Method to get user course enrollment details.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>User course enrollment details.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<UserCourseEnrollments> GetUserCourseEnrollmentDetailsAsync(string userId, string courseId, string examType)
        {
            UserDetail userDetails = (await _userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(userId)));
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<UserCourseEnrollments> userCourseEnrollmentList = (await _userCourseEnrollment.WithDetailsAsync(x => x.User)).Where(x => x.UserId == Guid.Parse(userId)).ToList();
            List<int> courseSubscriptionIds = userCourseEnrollmentList.Select(x => x.CourseSubscriptionId).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => courseSubscriptionIds.Contains(x.Id)).ToList();
            CourseSubscriptionMapping? requiredCourseSubscription = courseSubscriptionsList.FirstOrDefault(x => x.CourseId == Guid.Parse(courseId) && x.ExamType == examType && x.ExpirationDate >= DateTime.Today);
            if (requiredCourseSubscription != null)
            {
                UserCourseEnrollments? reqUserCourseEnrollment = userCourseEnrollmentList.FirstOrDefault(x => x.CourseSubscriptionId == requiredCourseSubscription.Id && (x.CertificateExpirationDate >= DateTime.Today || x.CertificateExpirationDate == null));
                if (reqUserCourseEnrollment == null)
                {
                    throw new UserFriendlyException(_localizer["UserCourseEnrollmentNotFound"], StatusCodes.Status403Forbidden.ToString());
                }
                else
                {
                    return reqUserCourseEnrollment;
                }
            }
            else
            {
                throw new UserFriendlyException(_localizer["UserNotSubscribedCourse"], StatusCodes.Status403Forbidden.ToString());
            }
        }

        /// <summary>
        /// Method to update the progress for a on going course.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="lessonId">Id of the completed lesson.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>User course enrollment details.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<UserCourseEnrollments> UpdateProgressForCourseByLessonIdAsync(string userId, string courseId, string lessonId, string examType)
        {
            UserDetail userDetails = (await _userRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(userId)));
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollment.GetListAsync(x => x.UserId == Guid.Parse(userId));
            List<int> courseSubscriptionIds = userCourseEnrollments.Select(x => x.CourseSubscriptionId).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => courseSubscriptionIds.Contains(x.Id)).ToList();
            CourseSubscriptionMapping? requiredCourseSubscription = courseSubscriptionsList.FirstOrDefault(x => x.CourseId == Guid.Parse(courseId) && x.ExamType == examType && x.ExpirationDate >= DateTime.Today);
            if (requiredCourseSubscription != null)
            {
                UserCourseEnrollments reqUserCourseEnrollment = userCourseEnrollments.FirstOrDefault(x => x.CourseSubscriptionId == requiredCourseSubscription.Id);
                if (reqUserCourseEnrollment != null)
                {
                    var currentLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).FirstOrDefault(x => x.Id == Guid.Parse(lessonId));
                    var previousLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).FirstOrDefault(x => reqUserCourseEnrollment.CurrentLessonId != null && x.Id == Guid.Parse(reqUserCourseEnrollment.CurrentLessonId.ToString()));

                    // If the lesson is already visited then we don't update the progress of course.
                    if ((currentLesson != null && previousLesson != null) && ((currentLesson.Module.SerialNumber < previousLesson.Module.SerialNumber) || (currentLesson.Module.SerialNumber == previousLesson.Module.SerialNumber && currentLesson.SerialNumber < previousLesson.SerialNumber)))
                    {
                        return reqUserCourseEnrollment;
                    }

                    if (currentLesson != null && previousLesson == null)
                    {
                        if (currentLesson.SerialNumber == 0)
                        {
                            reqUserCourseEnrollment.CourseStartDate = DateTime.Now;
                        }
                    }
                    Lesson nextLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).AsQueryable().FirstOrDefault(x => x.SerialNumber > currentLesson.SerialNumber && x.ModuleId == currentLesson.ModuleId);
                    if (nextLesson != null)
                    {
                        if (previousLesson == null)
                        {
                            reqUserCourseEnrollment.CurrentLessonId = nextLesson.Id;
                        }
                        else if (previousLesson.SerialNumber <= currentLesson.SerialNumber)
                        {
                            reqUserCourseEnrollment.CurrentLessonId = nextLesson.Id;
                        }
                    }
                    else
                    {
                        var nextModule = (await _moduleRepository.WithDetailsAsync(x => x.Course)).AsQueryable().FirstOrDefault(x => x.SerialNumber > currentLesson.Module.SerialNumber && x.CourseId == currentLesson.Module.CourseId);

                        if (nextModule != null)
                        {
                            var lessons = (await _lessonRepository.WithDetailsAsync(x => x.Module)).Where(x => x.ModuleId == nextModule.Id).OrderBy(x => x.SerialNumber).ToList();
                            var firstLesson = lessons.FirstOrDefault();

                            reqUserCourseEnrollment.CurrentLessonId = firstLesson.Id;
                            reqUserCourseEnrollment.CurrentModuleId = nextModule.Id;
                        }
                    }


                    // update progress
                    currentLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).FirstOrDefault(x => x.Id == reqUserCourseEnrollment.CurrentLessonId);
                    int totalLessons = await _lessonRepository.CountAsync(x => x.ModuleId == currentLesson.ModuleId);
                    int completedLessons = await _lessonRepository.CountAsync(x => x.SerialNumber < currentLesson.SerialNumber && x.ModuleId == currentLesson.ModuleId);

                    int totalModules = await _moduleRepository.CountAsync(x => x.CourseId == Guid.Parse(courseId));
                    int completedModules = await _moduleRepository.CountAsync(x => x.SerialNumber < currentLesson.Module.SerialNumber && x.CourseId == currentLesson.Module.CourseId);

                    double singleModulePercentage = (1.0 / totalModules) * 100;
                    double percentage = ((double)completedLessons / totalLessons) * singleModulePercentage;
                    double currentModuleProgress = Math.Round(percentage, 2);

                    double modulePercentage = ((double)completedModules / totalModules) * 100;
                    double currentCourseProgress = Math.Round(modulePercentage, 2) + currentModuleProgress;
                    reqUserCourseEnrollment.CurrentModulePorgress = currentModuleProgress;
                    reqUserCourseEnrollment.Progress = currentCourseProgress;
                    reqUserCourseEnrollment = await _userCourseEnrollment.UpdateAsync(reqUserCourseEnrollment, true);
                }
                return reqUserCourseEnrollment;
            }
            else
            {
                throw new UserFriendlyException(_localizer["UserNotSubscribedCourse"], StatusCodes.Status403Forbidden.ToString());
            }
        }

        /// <summary>
        /// Method to get all the courses for userId.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>List of all the courses.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<ICollection<ResAllCoursesForIndividualDto>> GetAllCoursesForIndividualAsync(Guid userId)
        {
            UserDetail userDetails = (await _userRepository.FirstOrDefaultAsync(x => x.Id == userId));
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<ResAllCoursesForIndividualDto> courseList = new List<ResAllCoursesForIndividualDto>();
            List<UserCourseEnrollments> userCourseEnrollments = await _userCourseEnrollment.GetListAsync(x => x.UserId == userId);
            List<Course> allCourses = await _courseRepository.GetListAsync();

            foreach (var course in userCourseEnrollments)
            {
                int courseSubscriptionId = course.CourseSubscriptionId;
                CourseSubscriptionMapping courseSubscription = await _courseSubscriptionMapping.FindAsync(x => x.Id == courseSubscriptionId);
                Guid courseId = courseSubscription.CourseId;
                string examType = courseSubscription.ExamType;
                Course obj = allCourses.First(x => x.Id == courseId);
                ResAllCoursesForIndividualDto courseToBeAddedInTheList = _mapper.Map<ResAllCoursesForIndividualDto>(obj);
                courseToBeAddedInTheList.Progress = course.Progress;
                courseToBeAddedInTheList.IsCompleted = course.IsCompleted;
                courseToBeAddedInTheList.ExpirationDate = course.ExpirationDate;
                courseToBeAddedInTheList.ExamType = examType;
                ExamDetail examDetails = await _examDetailRepository.GetAsync(x => x.CourseId == obj.Id);
                int examDetailId = examDetails.Id;
                courseToBeAddedInTheList.ExamDetailId = examDetailId;
                courseToBeAddedInTheList.CertificateExpirationDate = course.CertificateExpirationDate;
                courseList.Add(courseToBeAddedInTheList);
            }

            return courseList;
        }

        /// <summary>
        /// Method to get course subscription by userId.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">id of the course.</param>
        /// <returns>course subscription details for user.</returns>
        public async Task<CourseSubscriptionMapping> GetCourseSubscriptionByUserIdAsync(string userId, string courseId)
        {
            CourseSubscriptionMapping courseSubscription = await _courseSubscriptionMapping.FirstOrDefaultAsync(x => x.UserId == Guid.Parse(userId) && x.CourseId == Guid.Parse(courseId) && x.RemainingCount > 0);
            return courseSubscription;
        }

        /// <summary>
        /// Method to update the course enrollment details.
        /// </summary>
        /// <param name="courseEnrollment">course enrollment object which is to be updated.</param>
        /// <returns>nothing</returns>
        public async Task UpdateCourseEnrollmentDetailsAsync(UserCourseEnrollments courseEnrollment)
        {
            await _userCourseEnrollment.UpdateAsync(courseEnrollment);
        }

        /// <summary>
        /// Method is to credit course to the individual by admin.
        /// </summary>
        /// <param name="courseSubscriptionMappingObj">CourseSubscriptionMapping object with all required details.</param>
        /// <returns>Task.</returns>
        public async Task CreditCourseToIndividualAsync(CourseSubscriptionMapping courseSubscriptionMappingObj)
        {
            // check the current user is already have this course assign or not or expired to maintain the project flow
            List<UserCourseEnrollments> userCourseEnrollmentList = (await _userCourseEnrollment.WithDetailsAsync(x => x.User)).Where(x => x.UserId == courseSubscriptionMappingObj.UserId).ToList();
            List<int> courseSubscriptionIds = userCourseEnrollmentList.Select(x => x.CourseSubscriptionId).ToList();
            List<CourseSubscriptionMapping> courseSubscriptionsList = (await _courseSubscriptionMapping.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => courseSubscriptionIds.Contains(x.Id)).ToList();
            CourseSubscriptionMapping? requiredCourseSubscription = courseSubscriptionsList.Find(x => x.CourseId == courseSubscriptionMappingObj.CourseId && x.ExamType == courseSubscriptionMappingObj.ExamType && x.ExpirationDate >= DateTime.Today);
            if (requiredCourseSubscription == null)
            {
                CourseSubscriptionMapping SubscriptionResult = await _courseSubscriptionMapping.InsertAsync(courseSubscriptionMappingObj, true);
                Course CourseObj = await _courseRepository.FirstAsync(x => x.Id == SubscriptionResult.CourseId);
                int QuantitySold = CourseObj.QuantitySold;
                QuantitySold += SubscriptionResult.TotalCount;
                CourseObj.QuantitySold = QuantitySold;
                await _courseRepository.UpdateAsync(CourseObj, true);
                await AssignCourseToUserAsync((Guid)SubscriptionResult.UserId);
            }
            else
            {
                throw new UserFriendlyException(_localizer["CourseSubscriptionExist"], StatusCodes.Status406NotAcceptable.ToString());
            }

        }

        /// <summary>
        /// Method is to assign the course that are only subscribed but not assigned.
        /// </summary>
        /// <param name="userId">User id that user get assign the courses.</param>
        /// <returns>Task.</returns>
        public async Task AssignCourseToUserAsync(Guid userId)
        {
            UserDetail userDetails = await _userRepository.FirstOrDefaultAsync(x => x.Id == userId);
            if (userDetails != null)
            {
                List<CourseSubscriptionMapping> subscriptionDetails = await _courseSubscriptionMapping.GetListAsync(x => x.UserId == userId && x.RemainingCount != 0);
                List<UserCourseEnrollments> enrollmentList = new();
                foreach (CourseSubscriptionMapping subscription in subscriptionDetails)
                {
                    enrollmentList.Add(new UserCourseEnrollments
                    {
                        UserId = userId,
                        CourseSubscriptionId = subscription.Id,
                        EnrolledDate = subscription.PurchasedDate,
                        ExpirationDate = subscription.ExpirationDate,
                        ExamType = subscription.ExamType,
                    });
                    subscription.RemainingCount = 0;
                }

                await _userCourseEnrollment.InsertManyAsync(enrollmentList, true);
                await _courseSubscriptionMapping.UpdateManyAsync(subscriptionDetails, true);
            }

        }
    }
}
