using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Lake;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LakePulse.Services.Characteristic
{
    public class CharacteristicService : ICharacteristicService
    {
        private readonly ILogger<LakeService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly ApplicationDbContext _context;

        public CharacteristicService(ILogger<LakeService> logger,
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("RedshiftConnection");
            _context = context;
        }

        /// <summary>
        /// Method to get all characteristics asynchronously.
        /// </summary>
        /// <returns>Task containing an IEnumerable of CharacteristicsDto.</returns>
        public async Task<IEnumerable<CharacteristicsDto>> GetAllCharacteristicAsync()
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string characteristicsQuery = "SELECT * FROM main.characteristics ORDER BY characteristic_name";
                    IEnumerable<dynamic> characteristicsResult = await connection.QueryAsync(characteristicsQuery);
                    List<CharacteristicsDto> characteristics = characteristicsResult.Select(c => new CharacteristicsDto
                    {
                        CharacteristicId = c.characteristic_id,
                        CharacteristicName = c.characteristic_name,
                        CharacteristicDescription = c.characteristic_description,
                        CharacteristicUnits = c.characteristic_units,
                        BoundType = c.bound_type,
                        LowerBound = (float?)c.lower_bound ?? 0.0f,
                        UpperBound = (float?)c.upper_bound ?? 0.0f
                    }).ToList();
                    return characteristics;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to add a favorite characteristic for a user and lake asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="characteristicId">The ID of the characteristic.</param>
        /// <returns>Task containing a string message indicating the result of the operation.</returns>
        public async Task<string> AddFavouriteCharacteristicAsync(string userId, string lakeId, string characteristicId)
        {
            try
            {
                UserLake? myLake = await _context.UserLakes.FirstOrDefaultAsync(x => x.UserId == userId && x.LakeId == lakeId);
                if (myLake == null)
                {
                    _logger.LogError(StringConstant.lakeNotFound);
                    return StringConstant.lakeNotFound;
                }

                if (await _context.FavouriteCharacteristics.AnyAsync(x => x.CharacteristicId == characteristicId && x.UserLakeId == myLake.Id))
                {
                    return StringConstant.characteristicAlreadyExists;
                }

                FavouriteCharacteristic userLakeCharacteristic = new()
                {
                    Id = Guid.NewGuid(),
                    CharacteristicId = characteristicId,
                    UserLakeId = myLake.Id,
                    CreatedBy = userId,
                    CreatedTime = DateTime.UtcNow
                };
                _context.FavouriteCharacteristics.Add(userLakeCharacteristic);
                await _context.SaveChangesAsync();
                return StringConstant.addedFavouriteCharacteristic;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to remove a favorite characteristic for a user and lake asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="characteristicId">The ID of the characteristic.</param>
        /// <returns>Task containing a string message indicating the result of the operation.</returns>
        public async Task<string> RemoveFavouriteCharacteristicAsync(string userId, string lakeId, string characteristicId)
        {
            try
            {
                UserLake? myLake = await _context.UserLakes.FirstOrDefaultAsync(x => x.UserId == userId && x.LakeId == lakeId);
                if (myLake == null)
                {
                    _logger.LogError(StringConstant.lakeNotFound);
                    return StringConstant.lakeNotFound;
                }

                FavouriteCharacteristic? favouriteCharacteristic = await _context.FavouriteCharacteristics
                    .FirstOrDefaultAsync(x => x.CharacteristicId == characteristicId && x.UserLakeId == myLake.Id);

                if (favouriteCharacteristic == null)
                {
                    return StringConstant.characteristicNotFound;
                }

                _context.FavouriteCharacteristics.Remove(favouriteCharacteristic);
                await _context.SaveChangesAsync();
                return StringConstant.removedFavouriteCharacteristic;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to get favorite characteristics for a user and lake asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <returns>Task containing a list of LakeCharacteristicDto.</returns>
        public async Task<List<LakeCharacteristicDto>> GetFavouriteCharacteristicsAsync(string userId, string lakeId)
        {
            try
            {
                UserLake? myLake = await _context.UserLakes.FirstOrDefaultAsync(x => x.UserId == userId && x.LakeId == lakeId);
                if (myLake == null)
                {
                    _logger.LogError(StringConstant.lakeNotFound);
                    return new List<LakeCharacteristicDto>();
                }

                List<string?> favouriteCharacteristics = await _context.FavouriteCharacteristics
                    .Where(x => x.UserLakeId == myLake.Id)
                    .Select(x => x.CharacteristicId)
                    .ToListAsync();

                if (!favouriteCharacteristics.Any())
                {
                    return new List<LakeCharacteristicDto>();
                }

                List<LakeCharacteristicDto> lakeCharacteristicDtos = new();
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string lakeCharacteristicQuery = $"SELECT activity_start_date, result_characteristic, AVG(result_measure) AS avg_result_measure FROM main.measurement_results_vw mr WHERE lakepulse_id = {lakeId} AND result_characteristic IN ({string.Join(",", favouriteCharacteristics.Select(CharacteristicId => $"'{CharacteristicId}'"))}) AND activity_start_date = ( SELECT MAX(activity_start_date) FROM main.measurement_results_vw WHERE lakepulse_id = {lakeId} ) GROUP BY activity_start_date, result_characteristic ORDER BY result_characteristic;";
                    IEnumerable<dynamic> lakeCharacteristicResult = await connection.QueryAsync(lakeCharacteristicQuery);

                    lakeCharacteristicDtos = lakeCharacteristicResult
                        .Select(item => new LakeCharacteristicDto
                        {
                            ResultCharacteristic = (string)item.result_characteristic,
                            ResultMeasure = (float)item.avg_result_measure,
                            ActivityStartDate = item.activity_start_date?.ToString(StringConstant.dateFormat),
                        }).ToList();
                }
                return lakeCharacteristicDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to get all favorite characteristics asynchronously.
        /// </summary>
        /// <returns>Task containing a list of FavouriteCharacteristic.</returns>
        public async Task<List<FavouriteCharacteristic>> GetAllFavouriteCharacteristicsAsync()
        {
            try
            {
                List<FavouriteCharacteristic> favouriteCharacteristics = await _context.FavouriteCharacteristics.ToListAsync();
                return favouriteCharacteristics;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to get chart data for a specific lake and characteristic over a specified duration.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="characteristicId">The ID of the characteristic.</param>
        /// <param name="duraionDays">The duration in days for which the data is to be fetched.</param>
        /// <returns>Task containing a list of LakeCharacteristicChartDto.</returns>
        public async Task<List<LakeCharacteristicChartDto>> GetChartAsync(string lakeId, string characteristicId, int duraionDays)
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string characteristicsQuery = "select cast(DATE_TRUNC('month', activity_start_date) as DATE) AS activity_month, location_identifier, avg(result_measure) as result_measure from main.measurement_results_vw  where lakepulse_id = @LakeId and activity_start_date >= CURRENT_DATE - @DuraionDays and result_characteristic = @CharacteristicId group by cast(DATE_TRUNC('month', activity_start_date) as DATE), location_identifier order by cast(DATE_TRUNC('month', activity_start_date) as DATE), location_identifier";

                    var parameters = new
                    {
                        LakeId = lakeId,
                        CharacteristicId = characteristicId,
                        DuraionDays = duraionDays
                    };
                    IEnumerable<dynamic> characteristicsResult = await connection.QueryAsync(characteristicsQuery, parameters);

                    List<LakeCharacteristicChartDto> lakeCharacteristics = characteristicsResult.Select(c => new LakeCharacteristicChartDto
                    {
                        LocationIdentifier = (string)c.location_identifier,
                        ResultMeasure = (float)c.result_measure,
                        ActivityStartDate = c.activity_month?.ToString(StringConstant.chartDateFormat),
                    }).ToList();

                    return lakeCharacteristics;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

    }
}
