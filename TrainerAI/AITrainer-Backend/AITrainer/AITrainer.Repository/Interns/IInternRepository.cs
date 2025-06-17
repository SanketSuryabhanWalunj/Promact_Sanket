using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Interns
{
    public interface IInternRepository
    {
        Task<Intern> CreateInternAsync(InternDetails intern,string Id);
        Task<Intern> GetInternAsync(string internId);
        Task<IEnumerable<InternList>> GetInternListAsync(int firstIndex, int lastIndex);
        Task<Intern> UpdateInternAsync(UpdateIntern intern);
        bool DeleteIntern(string Id);
        Task<List<AssignCourseDto>> GetCourse(string Id);
        Task<int> Count();
        Task<List<Intern>> GetInternsByOrganizationAsync();
        Task<IEnumerable<InternList>> GetInternListByOrganizationAsync( string? searchWord, string? filterWord);
      
        Task<List<AdminList>> GetAdminList(string userId);
        Task<ApplicationUser> FindByEmailAsync(string email);
        Task<bool> checkDelete(string email);
        Task<Intern> EnableInternAsync(InternDetails info, string Id, string userId);
        Task<ApplicationUser> FindByIdAsync(string id);
        Task<Organization> FindOrganization(string UserId);
    }
}
