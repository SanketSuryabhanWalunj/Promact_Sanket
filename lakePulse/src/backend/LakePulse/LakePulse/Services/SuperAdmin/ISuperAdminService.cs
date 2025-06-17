using Amazon.CognitoIdentityProvider.Model;
using LakePulse.DTOs;

namespace LakePulse.Services.SuperAdmin
{
    public interface ISuperAdminService
    {

        /// <summary>
        /// Retrieves a list of users with optional filtering and pagination.
        /// </summary>
        /// <param name="filter">Optional filter to apply to the user list.</param>
        /// <param name="paginationToken">Token for pagination to retrieve the next set of results.</param>
        /// <param name="pageSize">The number of users to retrieve per page.</param>
        /// <returns>A tuple containing a list of users and an optional pagination token.</returns>
        Task<(List<SuperAdminUserDto> Users, string? PaginationToken)> GetUsersAsync(string? filter, string? paginationToken, int pageSize);

        /// <summary>
        /// Retrieves the total count of users with optional filtering.
        /// </summary>
        /// <param name="filter">Optional filter to apply to the user count.</param>
        /// <returns>A DTO containing the total count of users.</returns>
        Task<SuperAdminUsersCountDto> GetTotalUserCountAsync(string? filter);

        /// <summary>
        /// Deletes a user from the specified user pool and removes associated lakes.
        /// </summary>
        /// <param name="username">The username of the user to delete.</param>
        /// <returns>True if the user was successfully deleted, false if the user was not found.</returns>
        Task<bool> DeleteUserAsync(string username);

        /// <summary>
        /// Updates the role of a user in the specified user pool.
        /// </summary>
        /// <param name="username">The username of the user to update.</param>
        /// <param name="role">The new role to assign to the user.</param>
        /// <returns>True if the user's role was successfully updated, false if the user was not found.</returns>
        Task<bool> UpdateUserRoleAsync(string username, string role);

        /// <summary>
        /// Retrieves the unique identifier (sub) of a user by their email.
        /// </summary>
        /// <param name="email">The email of the user.</param>
        /// <returns>The unique identifier (sub) of the user, or null if the user is not found.</returns>
        Task<string?> GetUserSubByEmailAsync(string email);
    }
}
