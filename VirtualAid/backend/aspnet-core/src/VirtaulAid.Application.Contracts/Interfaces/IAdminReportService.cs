using System.Threading.Tasks;
using System;
using Volo.Abp.DependencyInjection;
using VirtaulAid.DTOs.AdminReport;
using VirtaulAid.DTOs.User;
using VirtaulAid.DTOs.Company;

namespace VirtaulAid.Interfaces
{
    public interface IAdminReportService : ITransientDependency
    {
        /// <summary>
        /// Method is to return count by month of various feilds like Certified Employee,Course Purchased, Employee Count. 
        /// </summary>
        /// <param name="companyId">Compny id that you want all records.</param>
        /// <returns>Return the resAdminReportdto with records.</returns>
        Task<ResAdminReportdto> GetCompanyReportAnalyticsAsync(Guid companyId);

        /// <summary>
        /// Method is to get the analytics of active employee of company.
        /// </summary>
        /// <param name="companyId">Company id for getting the specific record.</param>
        /// <returns>Analytics of employee.</returns>
        Task<ResLoggedInUser> GetActiveEmployeeAnalyticsAsync(Guid companyId);

        /// <summary>
        /// Method is to get the active company analytics.
        /// </summary>
        /// <returns>Logged in analytics for all companies.</returns>
        Task<ResLoggedInUser> GetActiveCompanyAnalyticsAsync();

        /// <summary>
        /// Method is to get the analytics of active individual users.
        /// </summary>
        /// <returns>Analytics of the individual users.</returns>
        Task<ResLoggedInUser> GetActiveIndividualAnalyticsAsync();

        /// <summary>
        /// Method is to get the analytics of active employee of company.
        /// </summary>
        /// <returns>Analytics of employee.</returns>
        Task<CompanyPendingRequestAnalyticsDto> GetPendingCompaniesAnalyticsAsync();

        /// <summary>
        /// Method is to get the all report details for admin.
        /// </summary>
        /// <param name="year">To fetch the record of perticular year.</param>
        /// <returns>History of i.e. certified user list, user permission list, purchase history, new user list. </returns>
        Task<ResAdminReportYearlyDto> GetAdminReportAsync(int year);
    }
}
