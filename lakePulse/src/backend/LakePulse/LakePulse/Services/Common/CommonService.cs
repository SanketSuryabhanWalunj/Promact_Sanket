using Amazon.CognitoIdentityProvider;
using Amazon.CognitoIdentityProvider.Model;
using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Lake;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LakePulse.Services.Common
{
    public class CommonService : ICommonService
    {
        #region Private Fields
        private readonly ILogger<LakeService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly ApplicationDbContext _context;
        private readonly string _userPoolId;
        private readonly IAmazonCognitoIdentityProvider _cognitoClient;
        #endregion

        #region Constructor
        public CommonService(ILogger<LakeService> logger,
            IConfiguration configuration,
            ApplicationDbContext context,
            IAmazonCognitoIdentityProvider cognitoClient)
        {
            _logger = logger;
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("RedshiftConnection");
            _context = context;
            _userPoolId = _configuration["AWS:UserPoolId"];
            _cognitoClient = cognitoClient ?? throw new ArgumentNullException(nameof(cognitoClient));
        }
        #endregion

        #region Public Methods
        /// <summary>
        /// Method to create lake dto using the lakemeta data, lake measurent, lake measurement pivot tables.
        /// </summary>
        /// <param name="lakeMetaDataResult">Lake mata data dynamic list.</param>
        /// <param name="lakepulseIdList">Lake id list.</param>
        /// <returns>List SearchLakeDto combination of all data.</returns>
        public async Task<List<SearchLakeDto>> CreateLakeDtosAsync(IEnumerable<dynamic> lakeMetaDataResult, List<string> lakepulseIdList)
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    string lakepulseIdListQuoted = string.Join(",", lakepulseIdList.Select(id => $"'{id}'"));
                    string lakeMeasurementViewQuery = $"SELECT * FROM main.measurement_results_summary_vw WHERE lakepulse_id IN ({lakepulseIdListQuoted}) ;";
                    IEnumerable<dynamic> lakeMeasurementViewResult = await connection.QueryAsync(lakeMeasurementViewQuery);
                    List<KeyValuePair<string, string>> stateList = await GetAllStateListAsync();

                    List<ComunityMembersDto> communityUser = await GetLakesCommunityUserCountsAsync(lakepulseIdList);
                    List<SearchLakeDto> result = lakeMetaDataResult.Select(item =>
                    {
                        DateTime? maxDate = lakeMeasurementViewResult
                        .Where(x => x.lakepulse_id == item.lakepulse_id)
                        .Select(x => x.max_activity_start_date)
                        .FirstOrDefault();

                        DateTime? minDate = lakeMeasurementViewResult
                            .Where(x => x.lakepulse_id == item.lakepulse_id)
                            .Select(x => x.min_activity_start_date)
                            .FirstOrDefault();

                        int spanYears = (maxDate.HasValue && minDate.HasValue)
                            ? (int)((maxDate.Value - minDate.Value).Days / 365.25)
                            : 0;


                        return new SearchLakeDto
                        {
                            lakePulseId = item.lakepulse_id,
                            lakeName = item.lake_name,
                            lakeState = stateList.Find(x => x.Value == item.lake_state).Key,
                            lakeCounty = item.lake_county,
                            longitude = item.lake_lon,
                            latitude = item.lake_lat,
                            totalStations = (int)(lakeMeasurementViewResult
                            .Where(x => x.lakepulse_id == item.lakepulse_id)
                            .Select(x => x.distinct_location_count)
                            .FirstOrDefault() ?? 0),
                            totalSamples = (int)(lakeMeasurementViewResult
                            .Where(x => x.lakepulse_id == item.lakepulse_id)
                            .Select(x => x.total_samples_count)
                            .FirstOrDefault() ?? 0),
                            recentDataCollection = maxDate.ToString() ?? string.Empty,
                            spanYears = spanYears,
                            communityUsers = communityUser.Find(x => x.LakePulseId == item.lakepulse_id.ToString()).UserCount,
                            communityAdmin = communityUser.Find(x => x.LakePulseId == item.lakepulse_id.ToString()).AdminCount,
                            communitySubscriber = communityUser.Find(x => x.LakePulseId == item.lakepulse_id.ToString()).SubscriberCount

                        };
                    }).ToList();

                    return result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Retrieves a list of all states with their abbreviations.
        /// </summary>
        /// <returns>List of key-value pairs where the key is the state name and the value is the state abbreviation.</returns>
        public async Task<List<KeyValuePair<string, string>>> GetAllStateListAsync()
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    string getStatedQuery = "SELECT * FROM main.states ORDER BY state_name ";
                    IEnumerable<dynamic> stateResult = await connection.QueryAsync(getStatedQuery);
                    List<KeyValuePair<string, string>> stateKeyValueList = stateResult
                        .Select(state => new KeyValuePair<string, string>((string)state.state_name, (string)state.state_abb))
                        .ToList();
                    return stateKeyValueList;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>  
        /// Retrieves the full name of a user based on their email address.  
        /// </summary>  
        /// <param name="email">The email address of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the full name of the user if found, otherwise null.</returns>  
        public async Task<string?> GetUserNameByEmailAsync(string email)
        {
            try
            {

                if (string.IsNullOrEmpty(email))
                {
                    return null;
                }

                ListUsersRequest request = new ListUsersRequest
                {
                    UserPoolId = _userPoolId,
                    Filter = $"email = \"{email}\""
                };

                ListUsersResponse response = await _cognitoClient.ListUsersAsync(request);

                // Check if user exists    
                if (response.Users.Count == 0) return null;
                string firstName = response.Users.First().Attributes.FirstOrDefault(attr => attr.Name == "given_name")?.Value;
                string familyName = response.Users.First().Attributes.FirstOrDefault(attr => attr.Name == "family_name")?.Value;
                return familyName + " " + firstName;
            }
            catch (AmazonCognitoIdentityProviderException ex)
            {
                throw new InvalidOperationException(StringConstant.errorRetrievingUserInformation, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Retrieves the community user counts for a list of lakes.  
        /// </summary>  
        /// <param name="lakepulseIdList">The list of lakepulse IDs for which to retrieve community user counts.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of community member details for each lake.</returns>  
        public async Task<List<ComunityMembersDto>> GetLakesCommunityUserCountsAsync(List<string> lakepulseIdList)
        {
            try
            {
                List<UserLake> userLakes = await _context.UserLakes
                          .Where(ul => lakepulseIdList.Contains(ul.LakeId)).ToListAsync();

                List<UserRole> userRolesList = await _context.UserRoles
                    .Where(ur => userLakes.Select(ul => ul.UserId).Contains(ur.UserId))
                    .ToListAsync();
                List<string> userList = userRolesList.Where(ur => ur.Role == StringConstant.UserRole).Select(ur => ur.UserId).Distinct().ToList();
                List<LakeSubscription> subscribtion = await _context.LakeSubscriptions.Where(x => userList.Contains(x.UserId) && x.SubscriptionEndDate >= (DateTime.UtcNow)).ToListAsync();
                List<ComunityMembersDto> communityMembers = new List<ComunityMembersDto>();
                foreach (var lakePulseId in lakepulseIdList)
                {
                    List<UserLake> lakeUsers = userLakes.Where(ul => ul.LakeId == lakePulseId).ToList();
                    List<UserRole> lakeUserRoles = userRolesList.Where(ur => lakeUsers.Select(ul => ul.UserId).Contains(ur.UserId)).ToList();
                    List<string> users = lakeUserRoles.Where(ur => ur.Role == StringConstant.UserRole).Select(ur => ur.UserId).Distinct().ToList();
                    List<LakeSubscription> subscribedUsers = subscribtion.Where(x => users.Contains(x.UserId)).ToList();
                    List<string> subscribedUserIds = subscribedUsers.Select(x => x.UserId).ToList();
                    communityMembers.Add(new ComunityMembersDto
                    {
                        LakePulseId = lakePulseId,
                        AdminCount = lakeUserRoles.Count(ur => ur.Role == StringConstant.LakeAdminRole),
                        UserCount = Math.Max(0, lakeUserRoles.Count(ur => ur.Role == StringConstant.UserRole) - subscribedUsers.Count),
                        SubscriberCount = subscribedUsers.Count,
                        AdminNames = lakeUserRoles.FindAll(x => x.Role == StringConstant.LakeAdminRole).Select(x => x.UserName).Distinct().ToList(),
                        UserNames = lakeUserRoles.Where(x => x.Role == StringConstant.UserRole && !subscribedUserIds.Contains(x.UserId)).Select(x => x.UserName).Distinct().ToList(),
                        SubscriberNames = lakeUserRoles.Where(x => x.Role == StringConstant.UserRole && subscribedUserIds.Contains(x.UserId)).Select(x => x.UserName).Distinct().ToList()
                    }
                   );
                }

                return communityMembers;
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.errorRetrievingCommunityUser, ex);
            }
        }

        /// <summary>  
        /// Retrieves the role of a user based on their unique identifier (sub).  
        /// </summary>  
        /// <param name="sub">The unique identifier of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the user's role as a string.</returns>  
        public async Task<string> GetUserRoleBySubAsync(string sub)
        {
            try
            {
                ListUsersRequest request = new ListUsersRequest
                {
                    UserPoolId = _userPoolId,
                    Filter = $"sub = \"{sub}\""
                };

                ListUsersResponse response = await _cognitoClient.ListUsersAsync(request);
                UserType? user = response.Users.FirstOrDefault();
                if (user != null)
                {
                    string roleAttribute = (user.Attributes.FirstOrDefault(attr => attr.Name == "custom:role")?.Value) ?? StringConstant.UserRole;
                    if (roleAttribute != null)
                    {
                        return roleAttribute;
                    }
                }

                return StringConstant.UserRole;
            }
            catch (AmazonCognitoIdentityProviderException ex)
            {
                throw new InvalidOperationException(StringConstant.errorRetrievingUserInformation, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Retrieves the full name of a user based on their unique identifier (sub).  
        /// </summary>  
        /// <param name="sub">The unique identifier of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the full name of the user if found, otherwise null.</returns>  
        public async Task<string> GetUserNameBySubAsync(string sub)
        {
            try
            {
                if (string.IsNullOrEmpty(sub))
                {
                    return null;
                }

                ListUsersRequest request = new ListUsersRequest
                {
                    UserPoolId = _userPoolId,
                    Filter = $"sub = \"{sub}\""
                };

                ListUsersResponse response = await _cognitoClient.ListUsersAsync(request);

                // Check if user exists    
                if (response.Users.Count == 0) return null;

                string firstName = response.Users.First().Attributes.FirstOrDefault(attr => attr.Name == "given_name")?.Value;
                string familyName = response.Users.First().Attributes.FirstOrDefault(attr => attr.Name == "family_name")?.Value;
                return familyName + " " + firstName;
            }
            catch (AmazonCognitoIdentityProviderException ex)
            {
                throw new InvalidOperationException(StringConstant.errorRetrievingUserInformation, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Retrieves the email address associated with the specified subject identifier.  
        /// </summary>  
        /// <param name="sub">The subject identifier of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the email address if found; otherwise, null.</returns>  
        public async Task<string?> GetUserEmailBySubAsync(string sub)
        {
            try
            {
                if (string.IsNullOrEmpty(sub))
                {
                    return null;
                }

                ListUsersRequest request = new ListUsersRequest
                {
                    UserPoolId = _userPoolId,
                    Filter = $"sub = \"{sub}\""
                };

                ListUsersResponse response = await _cognitoClient.ListUsersAsync(request);

                // Check if user exists    
                if (response.Users.Count == 0) return null;

                string? email = response.Users.First().Attributes.FirstOrDefault(attr => attr.Name == "email")?.Value;
                return email;
            }
            catch (AmazonCognitoIdentityProviderException ex)
            {
                throw new InvalidOperationException(StringConstant.errorRetrievingUserInformation, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>  
        /// Retrieves the lake name associated with the specified LakePulse ID.  
        /// </summary>  
        /// <param name="lakepulseId">The LakePulse ID of the lake.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the lake name as a string.</returns>  
        public async Task<string> GetLakeNameByLakePulseId(string lakepulseId)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                string lakeNameQuery = $"select lake_name from main.lake_metadata where lakepulse_id = {lakepulseId}";
                IEnumerable<dynamic> lakeName = await connection.QueryAsync(lakeNameQuery);
                return lakeName.FirstOrDefault()?.lake_name ?? string.Empty;
            }
        }
        #endregion
    }
}

