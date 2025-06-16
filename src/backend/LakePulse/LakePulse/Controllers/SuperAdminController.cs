using Amazon.CognitoIdentityProvider.Model;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Services.SuperAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LakePulse.Controllers
{
    [Authorize(Roles = "Super Admin")]
    [Route("api/superAdmin")]
    [ApiController]
    public class SuperAdminController : ControllerBase
    {
        private readonly ISuperAdminService _superAdminService;

        public SuperAdminController(ISuperAdminService superAdminService)
        {
            _superAdminService = superAdminService;
        }

        /// <summary>
        /// Retrieves a list of Cognito users with optional filtering and pagination.
        /// </summary>
        /// <param name="pageSize">The number of users to retrieve per request.</param>
        /// <param name="filter">Optional filter to apply to the user list.</param>
        /// <param name="paginationToken">Token for pagination to retrieve the next set of results.</param>
        /// <returns>A response containing the list of users, total user count, and pagination token for the next set of results.</returns>
        [HttpGet("cognito-users")]
        public async Task<ActionResult> GetCognitoUsersAsync([FromQuery] int pageSize, [FromQuery] string? filter = null, [FromQuery] string? paginationToken = null)
        {
            (List<SuperAdminUserDto> users, string nextToken) = await _superAdminService.GetUsersAsync(filter, paginationToken, pageSize);

            SuperAdminUsersCountDto usersCount = await _superAdminService.GetTotalUserCountAsync(filter);
            return Ok(new
            {
                UsersCount = usersCount,
                Users = users,
                PaginationToken = nextToken
            });
        }

        /// <summary>
        /// Deletes a Cognito user from the specified user pool.
        /// </summary>
        /// <param name="username">The username of the user to delete.</param>
        /// <returns>A response indicating the result of the delete operation.</returns>
        [HttpDelete("cognito-user")]
        public async Task<ActionResult> DeleteCognitoUserAsync([FromQuery] string username)
        {
            bool isDeleted = await _superAdminService.DeleteUserAsync(username);
            if (isDeleted)
                return Ok(new { message = username + StringConstant.userDeleted });

            return NotFound(new { message = StringConstant.userNotFound });
        }

        /// <summary>
        /// Updates the role of a Cognito user in the specified user pool.
        /// </summary>
        /// <param name="username">The username of the user to update.</param>
        /// <param name="role">The new role to assign to the user.</param>
        /// <returns>A response indicating the result of the update operation.</returns>
        [HttpPut("user-role")]
        public async Task<ActionResult> UpdateCognitoUserRoleAsync([FromQuery] string username, [FromQuery] string role)
        {
            bool isUpdated = await _superAdminService.UpdateUserRoleAsync(username, role);
            if (isUpdated)
                return Ok(new { message = username + StringConstant.userRoleUpdated });
            return NotFound(new { message = StringConstant.userNotFound });
        }
    }
}
