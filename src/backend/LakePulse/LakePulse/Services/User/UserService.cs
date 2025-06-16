using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Characteristic;
using LakePulse.Services.Common;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LakePulse.Services.User
{
    public class UserService : IUserService
    {
        private readonly ILogger<UserService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly ApplicationDbContext _context;
        private readonly ICommonService _commonService;
        private readonly ICharacteristicService _characteristicService;
        private readonly IServiceProvider _serviceProvider;

        public UserService(ILogger<UserService> logger,
            IConfiguration configuration,
            ApplicationDbContext context,
            ICommonService commonService,
            ICharacteristicService characteristicService,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("RedshiftConnection");
            _context = context;
            _commonService = commonService;
            _characteristicService = characteristicService;
            _serviceProvider = serviceProvider;
        }

        /// <summary>
        /// Method is to get the my lakes data from the redshift database.
        /// </summary>
        /// <param name="userId">user id.</param>
        /// <returns>List of MyLakeDto.</returns>
        public async Task<List<MyLakeDto>> GetMyLakesByUserIdAsync(string userId)
        {
            try
            {
                List<UserLake> myLakes = await _context.UserLakes.Where(x => x.UserId == userId).ToListAsync();
                if (myLakes.Count > 0)
                {
                    using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        List<string> lakepulseIdList = myLakes.Select(item => (item.LakeId)).ToList();
                        string lakeMetaDataQuery = $"SELECT lakepulse_id, lake_name, lake_state, lake_county, lake_lon, lake_lat FROM main.lake_metadata WHERE main.lake_metadata.lakepulse_id IN ({string.Join(",", myLakes.Select(x => x.LakeId))})";
                        IEnumerable<dynamic> lakeMetaDataResult = await connection.QueryAsync(lakeMetaDataQuery);
                        List<SearchLakeDto> result = await _commonService.CreateLakeDtosAsync(lakeMetaDataResult, lakepulseIdList);

                        List<MyLakeDto> myLakeDto = (await Task.WhenAll(result.Select(async lake =>
                        {
                            using var scope = _serviceProvider.CreateScope();
                            ICharacteristicService characteristicService = scope.ServiceProvider.GetRequiredService<ICharacteristicService>();
                            List<LakeCharacteristicDto> lakeCharacteristics = await characteristicService.GetFavouriteCharacteristicsAsync(userId, lake.lakePulseId.ToString());

                            return new MyLakeDto
                            {
                                lakePulseId = lake.lakePulseId,
                                lakeName = lake.lakeName,
                                lakeState = lakeMetaDataResult.FirstOrDefault(x => x.lakepulse_id == lake.lakePulseId)?.lake_state,
                                latitude = lake.latitude,
                                longitude = lake.longitude,
                                totalSamples = lake.totalSamples,
                                totalStations = lake.totalStations,
                                spanYears = lake.spanYears,
                                communityAdmin = lake.communityAdmin,
                                communityUsers = lake.communityUsers,
                                communitySubscriber = lake.communitySubscriber,
                                recentDataCollection = lake.recentDataCollection,
                                lakeCounty = lakeMetaDataResult.FirstOrDefault(x => x.lakepulse_id == lake.lakePulseId)?.lake_county,
                                lakeCharacteristics = lakeCharacteristics,
                            };
                        }))).ToList();


                        return myLakeDto;
                    }
                }
                return new List<MyLakeDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method is to add lakes in user my lakes.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="lakeId">Lake id.</param>
        /// <returns>String indicating the result of the operation.</returns>
        public async Task<string> AddLakesInMyLakeAsync(string userId, string lakeId)
        {
            try
            {
                string? state;
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string stateQuery = $"select lm.lake_state from main.lake_metadata lm where lm.lakepulse_id = {lakeId}";
                    IEnumerable<dynamic> lakeStateResult = await connection.QueryAsync(stateQuery);
                     state = lakeStateResult.FirstOrDefault()?.lake_state;
                }

                    UserLake? myLake = await _context.UserLakes.FirstOrDefaultAsync(x => x.UserId == userId && x.LakeId == lakeId);
                if (myLake != null)
                    return StringConstant.lakeExist;

                UserLake myLakes = new()
                {
                    Id = Guid.NewGuid(),
                    LakeId = lakeId,
                    UserId = userId,
                    LakeState = state,
                    CreatedBy = userId
                };
                _context.UserLakes.Add(myLakes);

                UserRole? userRoles = await _context.UserRoles.FirstOrDefaultAsync(x => x.UserId == userId);
                if (userRoles != null)
                {
                    userRoles.Role = await _commonService.GetUserRoleBySubAsync(userId);
                    userRoles.UserName = await _commonService.GetUserNameBySubAsync(userId);
                    userRoles.UserEmail = await _commonService.GetUserEmailBySubAsync(userId);
                    userRoles.LastUpdatedBy = userId;
                    userRoles.LastUpdatedTime = DateTime.UtcNow;
                    _context.UserRoles.Update(userRoles);
                }
                else
                {
                    UserRole userRole = new()
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        Role = await _commonService.GetUserRoleBySubAsync(userId),
                        UserName = await _commonService.GetUserNameBySubAsync(userId),
                        UserEmail = await _commonService.GetUserEmailBySubAsync(userId),
                        CreatedBy = userId
                    };
                    _context.UserRoles.Add(userRole);
                }

                await _context.SaveChangesAsync();
                return StringConstant.lakeAddedInUserList;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method is to get all user my lakes.
        /// </summary>
        /// <returns>List of my userLake.</returns>
        public async Task<List<UserLake>> GetAllMyLakeAsync()
        {
            try
            {
                List<UserLake> myLakes = await _context.UserLakes.ToListAsync();
                return myLakes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method is to delete the user saved lakes.
        /// </summary>
        /// <param name="userId">Lake id.</param>
        /// <param name="lakeId">Lake id of readshift database.</param>
        /// <returns>String.</returns>
        public async Task<string> DeleteMyLakeAsync(string userId, string lakeId)
        {
            try
            {
                UserLake? myLake = await _context.UserLakes.FirstOrDefaultAsync(x => x.UserId == userId && x.LakeId == lakeId);
                if (myLake == null)
                    return StringConstant.lakeNotFound;

                _context.UserLakes.Remove(myLake);
                await _context.SaveChangesAsync();
                return StringConstant.lakeDeleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to delete all lakes associated with a user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <returns>Task.</returns>
        public async Task DeleteUserLakesAsync(string userId)
        {
            try
            {
                List<UserLake> userLakes = await _context.UserLakes.Where(x => x.UserId == userId).ToListAsync();
                if (userLakes.Any())
                {
                    _context.UserLakes.RemoveRange(userLakes);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to get the count of lakes associated with a user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <returns>Count of lakes associated with the user.</returns>
        public async Task<int> GetMyLakesCountByUserIdAsync(string userId)
        {
            try
            {
                int count = await _context.UserLakes.CountAsync(x => x.UserId == userId);
                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

    }
}
