using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Employee;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface ICompanyEmployee : IApplicationService
    {
        Task<string> DeleteEmployee(Guid employeeId, string culture);
        Task<List<ResAllEmployeeDto>> GetAllEmployees(Guid companyId);

        /// <summary>
        /// Method to re-assign user to a company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="userId">id of the user.</param>
        /// <returns>Employee details.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        Task<ResAllEmployeeDto> ReassignEmployeeToCompanyByIdAsync(Guid companyId, Guid userId);
    }
}
