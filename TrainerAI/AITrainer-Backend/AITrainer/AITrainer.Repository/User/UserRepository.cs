using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace AITrainer.AITrainer.Repository.User
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserRepository(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // <summary>
        /// Verifies if the provided password matches the user's password.
        /// </summary>
        /// <param name="user">The user whose password is to be verified.</param>
        /// <param name="password">The password to verify.</param>
        /// <returns>A Task<bool> indicating whether the password is correct.</returns>
        public async Task<bool> CheckPasswordAsync(ApplicationUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        /// <summary>
        /// Finds a user by their email address.
        /// </summary>
        /// <param name="email">The email address to search for.</param>
        /// <returns>A Task<ApplicationUser> representing the user found, or null if not found.</returns>
        public async Task<ApplicationUser> FindByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        /// <summary>
        /// Finds an identity role by its name.
        /// </summary>
        /// <param name="roleName">The name of the role to find.</param>
        /// <returns>A Task<IdentityRole> representing the role found, or null if not found.</returns>
        public async Task<IdentityRole> FindByNameAsync(string roleName)
        {
            return await _roleManager.FindByNameAsync(roleName);
        }

        /// <summary>
        /// Finds a user by their ID.
        /// </summary>
        /// <param name="userId">The ID of the user to find.</param>
        /// <returns>A Task<ApplicationUser> representing the user found, or null if not found.</returns>
        public async Task<ApplicationUser> FindByIdAsync(string roleName)
        {
            return await _userManager.FindByIdAsync(roleName);
        }

        /// <summary>
        /// Gets the roles associated with a given user.
        /// </summary>
        /// <param name="user">The user whose roles are to be retrieved.</param>
        /// <returns>A Task<IList<string>> containing the roles of the user.</returns>
        public async Task<IList<string>> GetRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        /// <summary>
        /// Generates a password reset token for a given user.
        /// </summary>
        /// <param name="user">The user for whom to generate the token.</param>
        /// <returns>A Task<string> representing the password reset token.</returns>
        public async Task<string> GenratePasswordToken(ApplicationUser user)
        {
            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        /// <summary>
        /// Resets a user's password using a reset token and a new password.
        /// </summary>
        /// <param name="user">The user whose password is to be reset.</param>
        /// <param name="resetToken">The password reset token.</param>
        /// <param name="newPassword">The new password to set.</param>
        /// <returns>A Task<bool> indicating the success or failure of the password reset.</returns>
        public async Task<bool> ResetPasswordAsync(ApplicationUser user, string resetToken, string newPassword)
        {
            var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
            return result.Succeeded;
        }

        /// <summary>
        /// Changes a user's password using the current password and a new password.
        /// </summary>
        /// <param name="user">The user whose password is to be changed.</param>
        /// <param name="currentPassword">The current password of the user.</param>
        /// <param name="newPassword">The new password to set.</param>
        /// <returns>A Task<bool> indicating the success or failure of the password change.</returns>
        public async Task<bool> ChangePasswordAsync(ApplicationUser user, string resetToken, string newPassword)
        {
            var result = await _userManager.ChangePasswordAsync(user, resetToken, newPassword);
            if (result.Succeeded)
            {
                 return result.Succeeded;
            }
            return false;
        }

        /// <summary>
        /// Gets all users.
        /// </summary>
        /// <returns>A Task<List<ApplicationUser>> containing the users based on isDeleted false.</returns>
        public async Task<List<ApplicationUser>> GetListOfUsers()
        {
            return await _userManager.Users.Where(u => u.isDeleted == false).ToListAsync();
        }

    }
}
