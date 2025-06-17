using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;

namespace AITrainer.AITrainer.Repository.User
{
    public interface IUserRepository
    {
        Task<ApplicationUser> FindByEmailAsync(string email);
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<IList<string>> GetRolesAsync(ApplicationUser user);
        Task<IdentityRole> FindByNameAsync(string roleName);
        Task<string> GenratePasswordToken(ApplicationUser user);
        Task<ApplicationUser> FindByIdAsync(string roleName);
        Task<bool> ResetPasswordAsync(ApplicationUser user, string resetToken, string newPassword);
        Task<bool> ChangePasswordAsync(ApplicationUser user, string resetToken, string newPassword);
        Task<List<ApplicationUser>> GetListOfUsers();
    }
}
