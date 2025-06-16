using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Common;
using LakePulse.Services.User;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LakePulse.Services.SuperAdmin
{
    public class SuperAdminService : ISuperAdminService
    {
        private readonly IAmazonCognitoIdentityProvider _cognitoClient;
        private readonly IUserService _userService;
        private readonly string _userPoolId;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly string _connectionString;
        private readonly ICommonService _commonService;

        public SuperAdminService(IAmazonCognitoIdentityProvider cognitoClient,
            IUserService userService,
            IConfiguration configuration,
            ApplicationDbContext context,
            ICommonService commonService)
        {
            _cognitoClient = cognitoClient ?? throw new ArgumentNullException(nameof(cognitoClient));
            _userService = userService;
            _configuration = configuration;
            _userPoolId = _configuration["AWS:UserPoolId"];
            _context = context;
            _connectionString = _configuration.GetConnectionString("RedshiftConnection");
            _commonService = commonService;
        }

        /// <summary>
        /// Retrieves a list of users with optional filtering and pagination.
        /// </summary>
        /// <param name="filter">Optional filter to apply to the user list.</param>
        /// <param name="paginationToken">Token for pagination to retrieve the next set of results.</param>
        /// <param name="pageSize">The number of users to retrieve per page.</param>
        /// <returns>A tuple containing a list of users and an optional pagination token.</returns>
        public async Task<(List<SuperAdminUserDto> Users, string? PaginationToken)> GetUsersAsync(string? filter, string? paginationToken, int pageSize)
        {
            try
            {
                var request = new ListUsersRequest
                {
                    UserPoolId = _userPoolId,
                    Limit = pageSize
                };

                if (!string.IsNullOrEmpty(filter))
                {
                    request.Filter = $"username ^= \"{filter}\"";
                }

                if (!string.IsNullOrEmpty(paginationToken))
                {
                    request.PaginationToken = paginationToken;
                }

                ListUsersResponse response = await _cognitoClient.ListUsersAsync(request);
                if (response.Users.Count == 0)
                {
                    return (new List<SuperAdminUserDto>(), null);
                }

                List<SuperAdminUserDto> users = response.Users.Select(user => new SuperAdminUserDto
                {
                    UserName = user.Username,
                    FirstName = user.Attributes.FirstOrDefault(attr => attr.Name == "given_name")?.Value,
                    FamilyName = user.Attributes.FirstOrDefault(attr => attr.Name == "family_name")?.Value,
                    Email = user.Attributes.FirstOrDefault(attr => attr.Name == "email")?.Value,
                    Role = (user.Attributes.FirstOrDefault(attr => attr.Name == "custom:role")?.Value) ?? StringConstant.UserRole,
                    LastModifiedDate = user.UserLastModifiedDate
                }).ToList();

                // Check if the user has a subscription
                List<LakeSubscription> subscribtion = await _context.LakeSubscriptions.Where(x => users.Select(u => u.UserName).Contains(x.UserId) && x.SubscriptionEndDate >= (DateTime.UtcNow)).ToListAsync();
                if (subscribtion?.Count > 0)
                {
                    users.ForEach(x => x.Subscription = subscribtion.Any(s => s.UserId == x.UserName));
                }

                // Check if the user has a lake
                List<UserLake> lakes = await _context.UserLakes.Where(x => users.Select(u => u.UserName).Contains(x.UserId)).ToListAsync();
                if (lakes?.Count > 0)
                {
                    using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                    {
                        List<string> lakeIds = lakes.Select(x => x.LakeId).Distinct().ToList();
                        string lakeIdListString = string.Join(",", lakeIds.Select(id => $"'{id}'"));
                        string lakeNameQuery = $"select lakepulse_id , lake_name  from main.lake_metadata WHERE lakepulse_id IN ({lakeIdListString}) ;";
                        IEnumerable<dynamic> lakeMeasurementViewResult = await connection.QueryAsync(lakeNameQuery);

                        foreach (var user in users)
                        {
                            List<string> userLakes = lakes.Where(x => x.UserId == user.UserName).Select(x => x.LakeId).ToList();
                            var lakeNames = lakeMeasurementViewResult
                                .Where(x => userLakes.Contains(x.lakepulse_id.ToString())) // Convert lakepulse_id to string
                                .Select(x => x.lake_name.ToString()) // Convert to string safely
                                .ToList();
                            user.LakeName = string.Join(", ", lakeNames);
                        }
                    }
                }

                return (users, response.PaginationToken);
            }
            catch (Exception ex)
            {
                throw new Exception($"{StringConstant.errorRetrievingUsers}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Retrieves the total count of users with optional filtering.
        /// </summary>
        /// <param name="filter">Optional filter to apply to the user count.</param>
        /// <returns>A DTO containing the total count of users.</returns>
        public async Task<SuperAdminUsersCountDto> GetTotalUserCountAsync(string? filter)
        {
            try
            {
                int totalUsers = 0;
                int totalSuperAdmin = 0;
                int totalLakeAdmin = 0;
                string? paginationToken = null;

                do
                {
                    ListUsersRequest request = new ListUsersRequest
                    {
                        UserPoolId = _userPoolId,
                        Limit = 50,
                    };

                    if (!string.IsNullOrEmpty(filter))
                    {
                        request.Filter = $"name ^= \"{filter}\"";
                    }

                    if (!string.IsNullOrEmpty(paginationToken))
                    {
                        request.PaginationToken = paginationToken;
                    }

                    ListUsersResponse response = await _cognitoClient.ListUsersAsync(request);
                    totalUsers += response.Users.Count;
                    totalSuperAdmin += response.Users.Count(user =>
               user.Attributes.Any(attr => attr.Name == "custom:role" && attr.Value == StringConstant.SuperAdminRole));
                    totalLakeAdmin += response.Users.Count(user =>
              user.Attributes.Any(attr => attr.Name == "custom:role" && attr.Value == StringConstant.LakeAdminRole));
                    paginationToken = response.PaginationToken;

                } while (!string.IsNullOrEmpty(paginationToken));

                return new SuperAdminUsersCountDto
                {
                    TotalUsers = totalUsers,
                    TotalSuperAdmin = totalSuperAdmin,
                    TotalLakeAdmin = totalLakeAdmin,
                    TotalLakeSubscribers = await _context.LakeSubscriptions.CountAsync(x => x.SubscriptionEndDate >= (DateTime.UtcNow))
                };
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.errorRetrievingTotalUserCount + ex.Message, ex);
            }
        }

        /// <summary>
        /// Deletes a user from the specified user pool and removes associated lakes.
        /// </summary>
        /// <param name="username">The username of the user to delete.</param>
        /// <returns>True if the user was successfully deleted, false if the user was not found.</returns>
        public async Task<bool> DeleteUserAsync(string username)
        {
            try
            {
                var request = new AdminDeleteUserRequest
                {
                    UserPoolId = _userPoolId,
                    Username = username
                };

                await _cognitoClient.AdminDeleteUserAsync(request);
                await _userService.DeleteUserLakesAsync(username);
                return true; // Return true if deletion is successful
            }
            catch (UserNotFoundException)
            {
                return false; // Return false if user not found
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.errorDeletingUser + ex.Message, ex);
            }
        }

        /// <summary>
        /// Updates the role of a user in the specified user pool.
        /// </summary>
        /// <param name="username">The username of the user to update.</param>
        /// <param name="role">The new role to assign to the user.</param>
        /// <returns>True if the user's role was successfully updated, false if the user was not found.</returns>
        public async Task<bool> UpdateUserRoleAsync(string username, string role)
        {
            try
            {
                AdminUpdateUserAttributesRequest request = new AdminUpdateUserAttributesRequest
                {
                    UserPoolId = _userPoolId,
                    Username = username,
                    UserAttributes = new List<AttributeType>
                        {
                            new AttributeType
                            {
                                Name = "custom:role",
                                Value = role
                            }
                        }
                };

                await _cognitoClient.AdminUpdateUserAttributesAsync(request);

                UserRole? userRoles = await _context.UserRoles.FirstOrDefaultAsync(x => x.UserId == username);
                if (userRoles != null)
                {
                    userRoles.Role = role;
                    userRoles.UserName = await _commonService.GetUserNameBySubAsync(username);
                    userRoles.UserEmail = await _commonService.GetUserEmailBySubAsync(username);
                    userRoles.LastUpdatedBy = username;
                    userRoles.LastUpdatedTime = DateTime.UtcNow;
                    _context.UserRoles.Update(userRoles);
                }
                else
                {
                    UserRole userRole = new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = username,
                        Role = role,
                        UserName = await _commonService.GetUserNameBySubAsync(username),
                        UserEmail = await _commonService.GetUserEmailBySubAsync(username),
                        CreatedBy = username
                    };
                    _context.UserRoles.Add(userRole);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (UserNotFoundException)
            {
                return false;
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.errorUpdatingUserRole + ex.Message, ex);
            }
        }

        /// <summary>
        /// Retrieves the unique identifier (sub) of a user by their email.
        /// </summary>
        /// <param name="email">The email of the user.</param>
        /// <returns>The unique identifier (sub) of the user, or null if the user is not found.</returns>
        public async Task<string?> GetUserSubByEmailAsync(string email)
        {
            try
            {
                var request = new ListUsersRequest
                {
                    UserPoolId = _userPoolId,
                    Filter = $"email = \"{email}\""
                };

                var response = await _cognitoClient.ListUsersAsync(request);

                // Check if user exists
                if (response.Users.Count == 0) return null;

                // Extract and return the "sub" attribute
                return response.Users
                               .First()
                               .Attributes
                               .FirstOrDefault(attr => attr.Name == "sub")
                               ?.Value;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving user: {ex.Message}");
                throw;
            }              
        }
    }
}
