using Microsoft.AspNetCore.Authorization;
using System;
using System.Threading.Tasks;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.AdminReport;
using VirtaulAid.DTOs.Company;
using VirtaulAid.DTOs.User;
using VirtaulAid.Interfaces;
using VirtaulAid.Permissions;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Admin, Super Admin")]
    public class AdminReportService : ApplicationService, IAdminReportService
    {

        private readonly AdminReportDomainService _adminReportDomainService;

        public AdminReportService(AdminReportDomainService adminReportDomainService)
        {
            _adminReportDomainService = adminReportDomainService;
        }

        /// <summary>
        /// Method is to return count by month of various feilds like Certified Employee,Course Purchased, Employee Count. 
        /// </summary>
        /// <param name="companyId">Compny id that you want all records.</param>
        /// <returns>Return the resAdminReportdto with records.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResAdminReportdto> GetCompanyReportAnalyticsAsync(Guid companyId)
        {
            return new ResAdminReportdto()
            {
                CertifiedEmployee = await _adminReportDomainService.CertifiedEmployeeByCompanyIdAsync(companyId),
                CoursePurchased = await _adminReportDomainService.CoursePurchasedByCompanyIdAsync(companyId),
                EmployeeHistoryList = await _adminReportDomainService.EmployeeCountByCompanyIdAsync(companyId)
            };
        }

        /// <summary>
        /// Method is to get the analytics of active employee of company.
        /// </summary>
        /// <param name="companyId">Company id for getting the specific record..</param>
        /// <returns>Analytics of employee.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResLoggedInUser> GetActiveEmployeeAnalyticsAsync(Guid companyId)
        {
            return await _adminReportDomainService.ActiveEmployeeAnalyticsAsync(companyId);
        }

        /// <summary>
        /// Method is to get the active company analytics of last two weeks.
        /// </summary>
        /// <returns>Logged in analytics in percentage and count for all companies.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResLoggedInUser> GetActiveCompanyAnalyticsAsync()
        {
            return await _adminReportDomainService.ActiveCompanyAnalyticsAsync();
        }

        /// <summary>
        /// Method is to get the last two weeks analytics of active individual users.
        /// </summary>
        /// <returns>Analytics of the individual users.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResLoggedInUser> GetActiveIndividualAnalyticsAsync()
        {
            ResLoggedInUser individualAnalytics = await _adminReportDomainService.ActiveIndividualAnalyticsAsync();
            return individualAnalytics;
        }

        /// <summary>
        /// Method is to get the analytics of active employee of company.
        /// </summary>
        /// <returns>Analytics of employee.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<CompanyPendingRequestAnalyticsDto> GetPendingCompaniesAnalyticsAsync()
        {
            CompanyPendingRequestAnalyticsDto companyPendingRequestAnalyticsDto = await _adminReportDomainService.GetPendingCompaniesAnalyticsAsync();
            return companyPendingRequestAnalyticsDto;
        }

        /// <summary>
        /// Method is to get the all report details for admin.
        /// </summary>
        /// <param name="year">To fetch the record of perticular year.</param>
        /// <returns>history of i.e. certified user list, user permission list, purchase history, new user list. </returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResAdminReportYearlyDto> GetAdminReportAsync(int year)
        {
            var fromDate = new DateTime(year, 1, 1);
            var toDate = new DateTime(year + 1, 1, 1);

            return new ResAdminReportYearlyDto
            {
                CertifiedList = await _adminReportDomainService.CertifiedUserByYearAsync(fromDate, toDate),
                UserPermission = await _adminReportDomainService.EmployeePermissionByYearAsync(fromDate, toDate),
                PurchaseList = await _adminReportDomainService.CoursePurchasedByYearAsync(fromDate, toDate),
                UserList = await _adminReportDomainService.UserCountByYearAsync(fromDate, toDate)
            };
        }

    }
}
