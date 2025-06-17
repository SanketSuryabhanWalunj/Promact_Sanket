using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.CompanyDashboard;
using VirtaulAid.DTOs.TerminatedEmployees;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface ICompanyDashboardService : IApplicationService
    {
        /// <summary>
        /// Method is to get the terminated employee list.
        /// </summary>
        /// <param name="companyId">Company Id that we get the data for.</param>
        /// <returns>Task list of ResTerminatedEmployee.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        Task<List<ResTerminatedEmployee>> GetTerminatedEmployeeListAsync(Guid companyId);

        /// <summary>
        /// Method is to get the course matric for report section.
        /// </summary>
        /// <param name="companyId">Company Id that we get the data for.</param>
        /// <returns>Task list of ResCourseMetricDto.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        Task<List<ResCourseMetricDto>> GetCourseMetricAsync(Guid companyId);

        /// <summary>
        /// Method is to count the master count for report section.
        /// </summary>
        /// <param name="companyId">Company Id that we get the data for.</param>
        /// <returns>Task ResMasterCountDto.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        Task<ResMasterCountDto> GetReportMasterCountAsync(Guid companyId);

    }
}
