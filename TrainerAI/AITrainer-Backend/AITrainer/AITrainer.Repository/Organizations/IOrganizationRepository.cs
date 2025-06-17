using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.Organization;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Organizations
{
    public interface IOrganizationRepository
    {
        Task<Organization> CreateOrganizationAsync(CreateOrganizationDto organizationDto);
        Task<Organization> UpdateOrganizationAsync(UpdateOrganizationDto updateOrganizationDto);
        bool DeleteOrganizationAsync(string organizationId);
        Task<List<OrganizationDetailsDto>> GetOrganizationsAsync(int firstIndex,int  lastIndex);
        Task<Organization> GetOrganizationByIdAsync(string organizationId);
        Task<int> Count();
        Task<bool> checkDelete(string name);
        Task<Organization> FindByNameAsync(string name);
        Task<List<OrganizationDetailsDto>> ViewOrganizationsAsync();
        Task<List<AdminProfileSummaryDto>> ViewAdminProfilesAsync();
    }
}
