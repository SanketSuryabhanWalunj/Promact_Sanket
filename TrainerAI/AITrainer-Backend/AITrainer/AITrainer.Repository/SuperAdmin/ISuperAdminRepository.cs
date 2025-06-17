using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AITrainer.AITrainer.Repository.SuperAdmin
{
    public interface ISuperAdminRepository
    {
        Task<ApplicationUser> FindByEmailAsync(string email);
        Task<IdentityResult> CreateAsync(ApplicationUser users, string password);
        Task AddToRoleAsync(ApplicationUser users, string roleName);
        Task<List<ApplicationUser>> GetUsersByRoleAsync(string roleName);
        Task<ApplicationUser> FindByIdAsync(string id);
        Task<IdentityResult> UpdateAsync(ApplicationUser users);
        Task<bool> checkDelete(string email);
        Task<int> Count();
        Task<int> CountFilteredUsersAsync(string? roleType, string? organizationId, List<string> techStacks);
        Task AddToAdminTable(Admin admin, List<TechStackDTO> techStackDTO, string careerPathId, List<string> projectManagerIds);
        Task<Organization> FindOrganization(string UserId);
        Task UpdateAdminTable(string orgId,string userId);
        Task<Organization> FindOrgByName(string OrgName);
        Task<List<Admin>> GetAdminListAsync();
        Task<Admin> GetAdminByUserIdAsync(string userId);
        Task<List<ApplicationUser>> GetFilteredUsersAsync(string roleType, int fistIndex, int lastIndex, string organizationId, List<string> techStacks);
        Task<Organization> FindOrgById(string OrgId);
        Task<string> CreatePasswordLink(string PasswordToken, string id);
        Task<Admin> GetAdminDetailsByUserIdAsync(string userId);
        Task UpdateAdminTable(string adminId, List<TechStackDTO> updatedTechStacksDto, string careerPathId, List<string> updatedProjectManagerIds);
    }
}
