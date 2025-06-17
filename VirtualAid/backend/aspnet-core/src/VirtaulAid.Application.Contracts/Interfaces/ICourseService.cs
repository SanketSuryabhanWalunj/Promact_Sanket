using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface ICourseService : IApplicationService
    {
        /// <summary>
        /// Method is to return all the available courses.
        /// </summary>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List<ResAllCourseDto></returns>
        Task<List<ResAllCourseDto>> GetAllCoursesAsync(string culture);

        /// <summary>
        /// This method returns course details for the courseId provided.
        /// </summary>
        /// <param name="courseId">Guid</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List<ResCourseDetailDto></returns>
        Task<ResCourseDetailDto> GetCourseDetailAsync(Guid courseId, string culture);


        /// <summary>
        /// Method is to create a new course.
        /// </summary>
        /// <param name="req">ReqAddCourseDto</param>
        /// <returns>string</returns>
        Task<string> PostCourseAsync(ReqAddCourseDto req);

        /// <summary>
        /// Method is to create a module, which is required in the course detail Api
        /// </summary>
        /// <param name="req">Module</param>
        /// <returns>string</returns>
        Task<string> AddModule(ReqAddModuleDto req);

        /// <summary>
        /// Method to get all subscribed courses done by company.
        /// </summary>
        /// <param name="companyId">id of the company.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of subscribed Courses with employoee details.</returns>
        Task<ICollection<SubscribedCourseDto>> GetAllSubscribedCoursesByCompanyIdAsync(string companyId, string culture);

        /// <summary>
        /// Method to update subscribed courses done by company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="examtype">Exam type.</param>
        /// <param name="requiredTotalCount">count of the subscriptions.</param>
        /// <returns>Task.</returns>
        Task UpdateSubscribedCoursesByCompanyIdAsync(string companyId, string courseId, string examtype, int requiredTotalCount);

        /// <summary>
        /// Method to get all subscribed courses done by user.
        /// </summary>
        /// <param name="userId">Individual user id.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of subscribed course details.</returns>
        Task<ICollection<ResCourseDetailDto>> GetAllSubscribedCoursesByUserIdAsync(string userId, string culture);

        /// <summary>
        /// Method to subscribed bulk courses either by company or user.
        /// </summary>
        /// <param name="courseSubscriptions">List of course subscriptions details.</param>
        /// <param name="buyerId">id of the user or company.</param>
        /// <param name="isCompany">True if subscriber is company otherwise false for user.</param>
        /// <returns>Task.</returns>
        Task PostSubscribeBulkCoursesAsync(ICollection<CourseSubscriptionDto> courseSubscriptions, string buyerId, bool isCompany);

        /// <summary>
        /// Method to assign course to bulk users.
        /// </summary>
        /// <param name="userIds">List of userIds.</param>
        /// <param name="courseSubscriptionId">course subscription id.</param>
        /// <returns>Task.</returns>
        Task PostAssignCourseToBulkUsersAsync(ICollection<string> userIds, int courseSubscriptionId);

        /// <summary>
        /// Method to get all enrolled courses by user id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of enrolled course details.</returns>
        Task<ICollection<ResCourseDetailDto>> GetAllEnrolledCoursesByUserIdAsync(string userId, string culture);

        /// <summary>
        /// Method to get the user course enrollment details.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>User course enrollment details.</returns>
        Task<UserCourseEnrollmentDto> GetUserCourseEnrollmentDetailsAsync(string userId, string courseId, string examType);

        /// <summary>
        /// Method to update progress of on going course.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="lessonId">Id of the lesson.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>User course enrollment details.</returns>
        Task<UserCourseEnrollmentDto> UpdateProgressForCourseByLessonIdAsync(string userId, string courseId, string lessonId, string examType);

        /// <summary>
        /// Method to get all the UnSubscribed courses by Individual.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of UnSubscribed courses.</returns>
        Task<List<ResAllUnSubscribedCoursesDto>> GetAllUnSubscribedCoursesAsync(Guid userId, string culture);

        /// <summary>
        /// Method to get all the courses of Individual.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of all courses.</returns>
        Task<ICollection<ResAllCoursesForIndividualDto>> GetAllCoursesForIndividualAsync(Guid userId, string culture);

        /// <summary>
        /// Method to get most popular courses.
        /// </summary>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of most popular courses.</returns>
        Task<List<MostPopularCoursesDto>> GetMostPopularCoursesAsync(string culture, Guid? userId = null);

        /// <summary>
        /// Method is to course Enrollment to the user after payment successful.
        /// </summary>
        /// <param name="userId">UserId.</param>
        /// <returns>Task Empty.</returns>
        Task PostAssignCourseToUserAsync(Guid userId);

        /// <summary>
        /// Method is for get the all expired certificate history.
        /// </summary>
        /// <param name="userId">id of user.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>list of ResAllCoursesForIndividualDto.</returns>
        Task<List<ResAllCoursesForIndividualDto>> GetExpiredCertificateHistoryAsync(Guid userId, string culture);

        /// <summary>
        /// Method is to credit course to the individual by admin.
        /// </summary>
        /// <param name="courseSubscriptionDto">CourseSubscriptionMapping object with all required details.</param>
        /// <param name="userId">User id.</param>
        /// <returns>Task.</returns>
        Task PostCreditCourseToIndividualAsync(CourseSubscriptionDto courseSubscriptionDto, Guid userId);

        /// <summary>
        /// Method is to flag true for course completed.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="courseId">Course id that was completed.</param>
        /// <param name="examType">Course exam type i.e. live, VR, Online.</param>
        /// <returns>Task.</returns>
        Task PostCourseCompletedAsync(string userId, string courseId, string examType);
    }
}
