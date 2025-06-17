using System.Threading.Tasks;
using VirtaulAid.DTOs.Company;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface IAuthCompanyAccount: IApplicationService
    {
        /// <summary>
        /// Method is to registration of the company.
        /// </summary>
        /// <param name="reqUserRegistraionDto">Parameter dto.</param>
        /// <returns>Task Dto.</returns>
        Task<ResCompanyDto> CompanyRegistrationAsync(ReqCompanyRegistrationDto reqCompanyRegistraionDto, string culture);
    }
}
