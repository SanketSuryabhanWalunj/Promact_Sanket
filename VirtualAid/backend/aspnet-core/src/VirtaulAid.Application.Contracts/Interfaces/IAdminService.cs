using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Admin;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.Feedback;
using VirtaulAid.DTOs.Purchase;
using VirtaulAid.DTOs.User;
using Volo.Abp.Application.Dtos;


namespace VirtaulAid.Interfaces
{
    public interface IAdminService
    {
        /// <summary>
        /// Method to get company list.
        /// </summary>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of company</returns>
        Task<PagedResultDto<CompanyListDto>> GetCompanyListAsync(int pageNo, int pageSize, string culture);

        /// <summary>
        /// Method to get company list.
        /// </summary>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <returns>List of company</returns>
        Task<PagedResultDto<CompanyListDto>> GetPendingCompanyListAsync(int pageNo, int pageSize);

        /// <summary>
        /// Method to get employee list of a company by companyId.
        /// </summary>
        /// <param name="companyId">Company Id of a company</param>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <returns>List of employees</returns>
        Task<PagedResultDto<UserListDto>> GetEmployeeListAsync(Guid companyId, int pageNo, int pageSize);

        /// <summary>
        /// Method to get list of individual users.
        /// </summary>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <returns>list of individual users</returns>
        [Authorize]
        Task<PagedResultDto<UserListDto>> GetIndividualUserListAsync(int pageNo, int pageSize);

        /// <summary>
        /// Method to get company profile by companyId.
        /// </summary>
        /// <param name="companyId">Company Id of a company</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Company profile object</returns>
        Task<CompanyProfileDto> GetCompanyProfileAsync(Guid companyId, string culture);

        /// <summary>
        /// Method is to get individual profile
        /// </summary>
        /// <param name="userId">User Id of a user</param>
        /// <returns>Individual profile object</returns>
        Task<UserProfileDto> GetIndividualProfileAsync(Guid userId);

        /// <summary>
        /// Method is to get list of courses enrolled by an individual
        /// </summary>
        /// <param name="userId">User Id of a user</param>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of courses enrolled by user</returns>
        Task<PagedResultDto<CourseEnrolledByUserDto>> GetCoursesEnrolledByIndividualAsync(Guid userId, int pageNo, int pageSize, string culture);

        /// <summary>
        /// Method is to return all the available courses.
        /// </summary>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of courses.</returns>
        Task<PagedResultDto<ResAllCourseDto>> GetAllCoursesAsync(int pageNo, int pageSize, string culture);

        /// <summary>
        /// Method to get courses purchased by company.
        /// </summary>
        /// <param name="companyId">Company Id of a company</param>
        /// <param name="pageNo">Required page number</param>
        /// <param name="pageSize">Required page size</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of courses purchased by company</returns>
        Task<PagedResultDto<CoursePurchasedByCompanyDto>> GetCoursesPurchasedByCompanyAsync(Guid companyId, int pageNo, int pageSize, string culture);

        /// <summary>
        /// Method to get admin details by id.
        /// </summary>
        /// <param name="adminId">Id of the admin.</param>
        /// <returns>Admin details.</returns>
        Task<UserDetailsDto> GetAdminDetailsByIdAsync(Guid adminId);

        /// <summary>
        /// Method to update admin details.
        /// </summary>
        /// <param name="userDetailDto">User details.</param>
        /// <returns>User details.</returns>
        Task<UserDetailsDto> UpdateAdminDetailsAsync(UserDetailsDto userDetailDto);

        /// <summary>
        /// Method to activate or inactivate user by id.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <param name="isDeleted">If true then user will be soft delete and vice varsa.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Updated user details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        Task<UserDetailsDto> UpdateActivateOrInactivateUserByIdAsync(Guid userId, bool isDeleted, string culture);

        /// <summary>
        /// Method is to get purchase history by company id.
        /// </summary>
        /// <param name="companyId"> company Id.</param>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>List of purchase list by company.</returns>
        Task<PagedResultDto<ResPurchaseDto>> GetPurchaseListByCompanyIdAsync(Guid companyId, int pageNo, int pageSize);

        /// <summary>
        /// Method is to get purchase history by user id.
        /// </summary>
        /// <param name="userId"> user Id.</param>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>List of purchase list by user.</returns>
        Task<PagedResultDto<ResPurchaseDto>> GetPurchaseListByUserIdAsync(Guid userId, int pageNo, int pageSize);

        /// <summary>
        /// Method is to get all purchase history.
        /// </summary>
        /// <param name="pageNo">Required page number.</param>
        /// <param name="pageSize">Required page size.</param>
        /// <returns>All purchase list.</returns>
        Task<PagedResultDto<ResPurchaseDto>> GetAllPurchaseListAsync(int pageNo, int pageSize);

        /// <summary>
        /// Method to enable or disable the company.
        /// </summary>
        /// <param name="companyId">Company Id of a company</param>
        /// <param name="isActive">boolean value to set the status of the company</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Object that specifies the id and status of the company</returns>
        /// <exception cref="UserFriendlyException">If company does not exist.</exception>
        Task<CompanyStatusDto> PutActivateOrInactivateCompanyByIdAsync(Guid companyId, bool isActive, string culture);

        /// <summary>
        /// Method to get all the course request, which are pending
        /// </summary>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the course requests which are pending</returns>
        Task<List<ResCustomCourseRequestDto>> GetAllPendingCourseRequestAsync(string culture);

        /// <summary>
        /// Method to accept or reject the course request.
        /// </summary>
        /// <param name="requestId">Id of the request</param>
        /// <param name="status">status of the request</param>
        /// <returns>request object</returns>
        /// <exception cref="UserFriendlyException">If request does not exists</exception>
        Task<ResCustomCourseRequestDto> AcceptOrRejectCourseRequestAsync(Guid requestId, string status);

        /// <summary>
        /// Method to get all feedbacks from users
        /// </summary>
        /// <returns>list of feedbacks</returns>
        Task<List<ResFeedbackDto>> GetAllFeedbacksAsync();

        /// <summary>
        /// Method to update the status of the Feedback
        /// </summary>
        /// <param name="feedbackId">Id of the feedback</param>
        /// <param name="isDone">status of the feedback which has to be updated</param>
        /// <returns>updated feedback object with status</returns>
        /// <exception cref="UserFriendlyException">throws execption when feedback with provided id does not exist</exception>
        Task<ResUpdateFeedbackStatusDto> UpdateFeedbackStatus(Guid feedbackId, bool isDone);
    }

}
