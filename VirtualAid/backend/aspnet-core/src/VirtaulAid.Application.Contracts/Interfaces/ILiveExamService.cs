using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.LiveExam;
using VirtaulAid.DTOs.User;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Interfaces
{
    public interface ILiveExamService : ITransientDependency
    {
        /// <summary>
        /// Method is for add the live exam details.
        /// </summary>
        /// <param name="reqLiveExamDetailsDto">Live exam details dto. </param>
        /// <returns>Added new live exam record.</returns>
        /// <exception cref="UserFriendlyException">Course Not Exist.</exception>
        Task<ResLiveExamDetailsDto> AddLiveExamDetailsAsync(ReqLiveExamDetailsDto reqLiveExamDetailsDto);

        /// <summary>
        /// Method is to update the live exam details.
        /// </summary>
        /// <param name="liveExamId">Live exam Id.</param>
        /// <param name="seatsCount">Updated seats count.,</param>
        /// <returns>Updated live exam record.</returns>
        /// <exception cref="UserFriendlyException">Live Exam Not Exist.</exception>
        Task<ResLiveExamDetailsDto> UpdateLiveExamDetailsAsync(int liveExamId, int seatsCount);

        /// <summary>
        /// Method is to get the live exam schedule list.
        /// </summary>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>List of live exam details.</returns>
        Task<List<ResLiveExamDetailsDto>> GetLiveExamScheduleListAsync(int pageNo, int pageSize);

        /// <summary>
        /// Method is to get the list of perticular course.
        /// </summary>
        /// <param name="courseId">Course ID for the filter.</param>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>List of live exam details.</returns>
        Task<List<ResLiveExamDetailsDto>> GetLiveExamListByCourseAsync(Guid courseId, int pageNo, int pageSize);

        /// <summary>
        /// Method is to get the perticular course and feature list of schedule live exam.
        /// </summary>
        /// <param name="courseId">Course ID for the filter.</param>
        /// <returns>List of live exam details.</returns>
        Task<List<ResLiveExamDetailsDto>> GetLiveExamFeatureListByCourseAsync(Guid courseId);

        /// <summary>
        /// Method is to use the user can select the date for live exam.
        /// </summary>
        /// <param name="courseId">Course id that user wants to give live exam.</param>
        /// <returns> List of dated with details.</returns>
        Task<List<ResLiveExamDetailsDto>> GetUserLiveExamListByCourseAsync(Guid courseId);

        /// <summary>
        /// Method is to get the perticulr record of live exam details.
        /// </summary>
        /// <param name="liveExamId"> live exam details id for get the perticular record.</param>
        /// <returns>Live exam details.</returns>
        /// <exception cref="UserFriendlyException">Live Exam Not Exist.</exception>
        Task<ResLiveExamDetailsDto> GetLiveExamByIdAsync(int liveExamId);

        /// <summary>
        /// Method is to delete the perticular record.
        /// </summary>
        /// <param name="liveExamId">Live exam id that we want to delete.</param>
        /// <returns>Task.</returns>
        Task DeleteLiveExamByIdAsync(int liveExamId);

        /// <summary>
        /// Method is to add the live exam date request.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="courseId">Course id.</param>
        /// <param name="requestedDate">Requested exam date.</param>
        /// <returns>Updated user course enrollemt record.</returns>
        /// <exception cref="UserFriendlyException">Live exam seats are full.</exception>
        Task<UserCourseEnrollmentDto> SendLiveExamDateRequestAsync(Guid userId, Guid courseId, DateTime requestedDate, string culture);

        /// <summary>
        /// Method is to get the all pending live exam request of user.
        /// </summary>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>Return the list of live exam date pending user List.</returns>
        Task<List<ResLiveExamPendingReqDto>> GetPendingLiveExamDateRequestAsync(int pageNo, int pageSize);

        /// <summary>
        /// Method is to Accept or reject the user live exam date.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="courseId">Course id.</param>
        /// <param name="userCourseEnrollmentId">user Course Enrollment Id.</param>
        /// <param name="isAccepted">If Accepted then true otherwise false.</param>
        /// <returns>Task.</returns>
        Task AcceptRejectLiveExamDateAsync(Guid userId, Guid courseId, int userCourseEnrollmentId, bool isAccepted, string culture);

        /// <summary>
        /// Method is to get the live exam date approved user list.
        /// </summary>
        /// <param name="pageNo">Page no for the pegination.</param>
        /// <param name="pageSize">Record count of the page.</param>
        /// <returns>List of user with course and enrollment details.</returns>
        Task<List<ResLiveExamPendingReqDto>> GetApprovedUserListAsync(int pageNo, int pageSize);

        /// <summary>
        /// Method is to update the live exam markes.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="userCourseEnrollmentId">user course enrollmet id.</param>
        /// <param name="markes">Markes.</param>
        /// <returns>Task.</returns>
        Task AddLiveExamMarkesAsync(Guid userId, int userCourseEnrollmentId, double marks);

        /// <summary>
        /// Method is to analytics on live exam date requested approved of last 2 weeks.
        /// </summary>
        /// <returns>Count of current week live exam date requested approved and pervcentage of analytics.</returns>
        Task<ResLiveExamRequestAnalytics> GetExamDateAcceptedAnalyticsAsync();
    }
}
