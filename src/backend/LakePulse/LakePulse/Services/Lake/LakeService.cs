using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Services.Cache;
using LakePulse.Services.Common;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;
namespace LakePulse.Services.Lake
{
    public class LakeService : ILakeService
    {
        private readonly ILogger<LakeService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly ICommonService _commonService;
        private readonly ICacheService _cacheService;
        private readonly ApplicationDbContext _context;
        private static readonly string LakeLatLongCacheKey = StringConstant.lakeData;

        public LakeService(ILogger<LakeService> logger,
            IConfiguration configuration,
            ICommonService commonService,
            ICacheService cacheService,
            ApplicationDbContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("RedshiftConnection");
            _commonService = commonService;
            _cacheService = cacheService;
            _context = context;
        }


        ///<summary>
        /// Searches for lakes by name and state with optional filtering and sorting.
        /// </summary>
        /// <param name="searchLakeRequestDto">The search request containing the name, state, filter, sort, page number, and page size.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the search results.</returns>
        public async Task<SearchLakeResponseDto> SearchLakeByNameAndStateAsync(SearchLakeRequestDto searchLakeRequestDto)
        {
            try
            {

                int offset = (searchLakeRequestDto.pageNumber - 1) * searchLakeRequestDto.pageSize;
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    var parameters = new
                    {
                        State = searchLakeRequestDto.state.ToLower(),
                        StateMultiple = $"%{searchLakeRequestDto.state.ToLower()}%",
                        Search = $"%{searchLakeRequestDto.search?.ToLower()}%"
                    };
                    string Sort = searchLakeRequestDto.sort?.ToLower() == StringConstant.ASC.ToLower() ? StringConstant.ASC : StringConstant.DESC;
                    string searchQuery = " AND (LOWER(lake_name) LIKE @Search OR LOWER(lake_name_alt1) LIKE @Search OR LOWER(lake_name_alt2) LIKE @Search OR LOWER(lake_name_alt3) LIKE @Search OR LOWER(lake_name_alt4) LIKE @Search)";

                    switch (searchLakeRequestDto.filter?.ToLower())
                    {
                        case StringConstant.members:
                            List<int> memberLakeIdList = await _context.UserLakes
                                .Where(x => x.LakeState == searchLakeRequestDto.state.ToUpper())
                                .Select(x => int.Parse(x.LakeId))
                                .ToListAsync();

                            if (memberLakeIdList.Count > 0)
                            {

                                string lakeIdsQuoted = string.Join(",", memberLakeIdList.Select(id => $"'{id}'"));
                                string totalRecordsMemberQuery =
                           "SELECT COUNT(*) " +
                           "FROM main.lake_metadata " +
                           $"WHERE lakepulse_id IN ({lakeIdsQuoted}) " +
                           "AND (LOWER(lake_state) = @State OR LOWER(lake_states_multiple) LIKE @StateMultiple)";

                                if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                                {
                                    totalRecordsMemberQuery += searchQuery;
                                }

                                var query = _context.UserLakes
                                   .Where(x => x.LakeState == searchLakeRequestDto.state.ToUpper())
                                   .GroupBy(x => x.LakeId)
                                   .Select(g => new
                                   {
                                       LakeId = int.Parse(g.Key),
                                       Count = g.Count()
                                   });
                                // Apply conditional ordering
                                if (searchLakeRequestDto.sort?.ToUpper() == StringConstant.DESC)
                                {
                                    query = query.OrderByDescending(x => x.Count);
                                }
                                else
                                {
                                    query = query.OrderBy(x => x.Count);
                                }

                                query = query.Skip(offset).Take(searchLakeRequestDto.pageSize);

                                List<(int LakeId, int Count)> memberLakeIdOffsetList = await query
                                    .Select(x => new ValueTuple<int, int>(x.LakeId, x.Count))
                                    .ToListAsync();

                                lakeIdsQuoted = string.Join(",", memberLakeIdOffsetList.Select(id => $"'{id.LakeId}'"));

                                string lakeMetaDataMemberQuery =
                               "SELECT lakepulse_id, lake_name, lake_state, lake_county, lake_lon, lake_lat " +
                               "FROM main.lake_metadata " +
                               $"WHERE lakepulse_id IN ({lakeIdsQuoted}) " +
                               "AND (LOWER(lake_state) = @State OR LOWER(lake_states_multiple) LIKE @StateMultiple)";

                                if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                                {
                                    lakeMetaDataMemberQuery += searchQuery;
                                }
                                lakeMetaDataMemberQuery += $" ORDER BY lake_name";


                                IEnumerable<dynamic> lakeMetaMemberResultCount = await connection.QueryAsync(totalRecordsMemberQuery, parameters);
                                IEnumerable<dynamic> lakeMetaMemberResult = await connection.QueryAsync(lakeMetaDataMemberQuery, parameters);

                                List<string?> lakepulseIdAdminList = lakeMetaMemberResult.Select(item => ((object)item.lakepulse_id).ToString()).ToList();
                                if (lakepulseIdAdminList.Count > 0)
                                {
                                    List<SearchLakeDto> result = await _commonService.CreateLakeDtosAsync(lakeMetaMemberResult, lakepulseIdAdminList);
                                    return new SearchLakeResponseDto
                                    {
                                        LakeDetailsList = result,
                                        TotalCount = (int)(lakeMetaMemberResultCount.Select(x => x.count).FirstOrDefault()),
                                    };
                                }
                            }

                            break;

                        case StringConstant.admins:
                            List<int> adminallLakeIdList = await _context.LakeAdmin
                                 .Where(x => x.LakeState == searchLakeRequestDto.state.ToUpper())
                                .Select(x => int.Parse(x.LakeId))
                                .ToListAsync();

                            if (adminallLakeIdList.Count > 0)
                            {
                                string lakeIdsQuoted = string.Join(",", adminallLakeIdList.Select(id => $"'{id}'"));
                                string totalRecordsAdminQuery =
                              "SELECT COUNT(*) " +
                              "FROM main.lake_metadata " +
                              $"WHERE lakepulse_id IN ({lakeIdsQuoted}) " +
                              "AND (LOWER(lake_state) = @State OR LOWER(lake_states_multiple) LIKE @StateMultiple)";

                                if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                                {
                                    totalRecordsAdminQuery += searchQuery;
                                }

                                var queryAdmin = _context.UserLakes
                                       .Where(x => x.LakeState == searchLakeRequestDto.state.ToUpper())
                                       .GroupBy(x => x.LakeId)
                                       .Select(g => new
                                       {
                                           LakeId = int.Parse(g.Key),
                                           Count = g.Count()
                                       });

                                // Apply conditional ordering
                                if (searchLakeRequestDto.sort?.ToUpper() == StringConstant.DESC)
                                {
                                    queryAdmin = queryAdmin.OrderByDescending(x => x.Count);
                                }
                                else
                                {
                                    queryAdmin = queryAdmin.OrderBy(x => x.Count);
                                }
                                queryAdmin = queryAdmin.Skip(offset).Take(searchLakeRequestDto.pageSize);

                                List<(int LakeId, int Count)> adminLakeIdList = await queryAdmin
                                    .Select(x => new ValueTuple<int, int>(x.LakeId, x.Count))
                                    .ToListAsync();

                                lakeIdsQuoted = string.Join(",", adminLakeIdList.Select(id => $"'{id.LakeId}'"));

                                string lakeMetaDataAdminQuery =
                               "SELECT lakepulse_id, lake_name, lake_state, lake_county, lake_lon, lake_lat " +
                               "FROM main.lake_metadata " +
                               $"WHERE lakepulse_id IN ({lakeIdsQuoted}) " +
                               "AND (LOWER(lake_state) = @State OR LOWER(lake_states_multiple) LIKE @StateMultiple)";

                                if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                                {
                                    lakeMetaDataAdminQuery += searchQuery;
                                }
                                lakeMetaDataAdminQuery += $" ORDER BY lake_name LIMIT";

                                IEnumerable<dynamic> lakeMetaAdminResultCount = await connection.QueryAsync(totalRecordsAdminQuery, parameters);
                                IEnumerable<dynamic> lakeMetaAdminResult = await connection.QueryAsync(lakeMetaDataAdminQuery, parameters);

                                List<string?> lakepulseIdAdminList = lakeMetaAdminResult.Select(item => ((object)item.lakepulse_id).ToString()).ToList();
                                if (lakepulseIdAdminList.Count > 0)
                                {
                                    List<SearchLakeDto> result = await _commonService.CreateLakeDtosAsync(lakeMetaAdminResult, lakepulseIdAdminList);
                                    return new SearchLakeResponseDto
                                    {
                                        LakeDetailsList = result,
                                        TotalCount = (int)(lakeMetaAdminResultCount.Select(x => x.count).FirstOrDefault()),
                                    };
                                }
                            }
                            break;

                        case StringConstant.updates:

                            string latestOneYearUpdatedLakeCount = "SELECT COUNT(*) AS count FROM (SELECT lakepulse_id FROM main.measurement_results_vw WHERE LOWER(lake_state) = @State AND activity_start_date >= CURRENT_DATE - 365 ";
                            if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                            {
                                latestOneYearUpdatedLakeCount += "AND (LOWER(lake_name) LIKE @Search)";
                            }
                            latestOneYearUpdatedLakeCount += "GROUP BY lakepulse_id ) AS subquery";

                            string latestOneYearUpdatedLake = "SELECT lakepulse_id FROM main.measurement_results_vw where LOWER(lake_state) = @State and activity_start_date >= CURRENT_DATE - 365 ";
                            if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                            {
                                latestOneYearUpdatedLake += "AND (LOWER(lake_name) LIKE @Search)";
                            }

                            latestOneYearUpdatedLake += $"group by lakepulse_id, activity_start_date ORDER BY activity_start_date {Sort} LIMIT {searchLakeRequestDto.pageSize} OFFSET {offset}";

                            var parametersLatestUpdateLake = new
                            {
                                State = searchLakeRequestDto.state.ToLower(),
                                Search = $"%{searchLakeRequestDto.search?.ToLower()}%"
                            };

                            IEnumerable<dynamic> latestOneYearUpdatedLakeResultCount = await connection.QueryAsync(latestOneYearUpdatedLakeCount, parametersLatestUpdateLake);

                            IEnumerable<dynamic> latestOneYearUpdatedLakeResult = await connection.QueryAsync(latestOneYearUpdatedLake, parametersLatestUpdateLake);
                            List<string?> lakepulseIds = latestOneYearUpdatedLakeResult.Select(item => ((object)item.lakepulse_id).ToString()).ToList();

                            if (lakepulseIds.Count > 0)
                            {
                                string updateLakeIdsQuoted = string.Join(",", lakepulseIds.Select(id => $"'{id}'"));
                                string updatedLakDataQuery = $"SELECT lakepulse_id, lake_name, lake_state, lake_county, lake_lon, lake_lat FROM main.lake_metadata WHERE lakepulse_id IN ({updateLakeIdsQuoted})";
                                IEnumerable<dynamic> latestOneYearUpdatedLakeMetaResult = await connection.QueryAsync(updatedLakDataQuery);

                                List<SearchLakeDto> result = await _commonService.CreateLakeDtosAsync(latestOneYearUpdatedLakeMetaResult, lakepulseIds);
                                return new SearchLakeResponseDto
                                {
                                    LakeDetailsList = result,
                                    TotalCount = (int)(latestOneYearUpdatedLakeResultCount.Select(x => x.count).FirstOrDefault()),
                                };

                            }
                            break;

                        default:
                            string totalRecordsQuery =
                           "SELECT COUNT(*) " +
                           "FROM main.lake_metadata " +
                           "WHERE (LOWER(lake_state) = @State OR LOWER(lake_states_multiple) LIKE @StateMultiple)";

                            if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                            {
                                totalRecordsQuery += searchQuery;
                            }

                            string lakeMetaDataQuery =
                                "SELECT lakepulse_id, lake_name, lake_state, lake_county, lake_lon, lake_lat " +
                                "FROM main.lake_metadata " +
                                "WHERE (LOWER(lake_state) = @State OR LOWER(lake_states_multiple) LIKE @StateMultiple)";

                            if (!string.IsNullOrWhiteSpace(searchLakeRequestDto.search))
                            {
                                lakeMetaDataQuery += searchQuery;
                            }
                            lakeMetaDataQuery += $" ORDER BY lake_name {Sort} LIMIT {searchLakeRequestDto.pageSize} OFFSET {offset}";

                            IEnumerable<dynamic> lakeMetaResultCount = await connection.QueryAsync(totalRecordsQuery, parameters);
                            IEnumerable<dynamic> lakeMetaResult = await connection.QueryAsync(lakeMetaDataQuery, parameters);

                            List<string?> lakepulseIdList = lakeMetaResult.Select(item => ((object)item.lakepulse_id).ToString()).ToList();
                            if (lakepulseIdList.Count > 0)
                            {
                                List<SearchLakeDto> result = await _commonService.CreateLakeDtosAsync(lakeMetaResult, lakepulseIdList);
                                return new SearchLakeResponseDto
                                {
                                    LakeDetailsList = result,
                                    TotalCount = (int)(lakeMetaResultCount.Select(x => x.count).FirstOrDefault()),
                                };

                            }
                            break;
                    }
                    return new SearchLakeResponseDto();

                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }


        /// <summary>  
        /// Retrieves the latitude and longitude details of all lakes.  
        /// If the data is not available in the cache, it fetches the data from the database, caches it, and returns the result.  
        /// </summary>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the latitude and longitude details of all lakes.</returns>  
        public async Task<LakeLatLongDetailsDto> GetAllLakeLatLongAsync()
        {
            try
            {
                LakeLatLongDetailsDto? lakeLatLongDetails = _cacheService.GetDataFromCache<LakeLatLongDetailsDto>(LakeLatLongCacheKey);
                if (lakeLatLongDetails == null)
                {
                    using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                    {
                        await connection.OpenAsync();
                        string totalRecordsQuery = "SELECT COUNT(*) FROM main.lake_metadata ";
                        string lakeMeataDataQuery = "SELECT lakepulse_id, lake_lon, lake_lat, lake_name FROM main.lake_metadata ORDER BY lake_name";
                        IEnumerable<dynamic> lakeCount = await connection.QueryAsync(totalRecordsQuery);
                        IEnumerable<dynamic> lakeMetaResultList = await connection.QueryAsync(lakeMeataDataQuery);
                        lakeLatLongDetails = new LakeLatLongDetailsDto
                        {
                            LakeDetailsList = lakeMetaResultList
                           .Select(item => new LakeLatLongDto
                           {
                               A = item.lakepulse_id,
                               C = item.lake_lon,
                               B = item.lake_lat,
                               D = item.lake_name
                           }).ToList(),
                            TotalLakeCount = (int)(lakeCount.Select(x => x.count).FirstOrDefault()),
                        };

                        _cacheService.AddLakeDataToCache(LakeLatLongCacheKey, lakeLatLongDetails);
                    }
                }

                return lakeLatLongDetails;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>  
        /// Retrieves lake details by their IDs with optional filtering and sorting.  
        /// </summary>  
        /// <param name="lakeIds">The list of lake IDs.</param>  
        /// <param name="filter">The filter to apply to the query.</param>  
        /// <param name="sort">The sort order to apply to the query.</param>  
        /// <param name="pageNumber">The page number for pagination.</param>  
        /// <param name="pageSize">The number of items per page.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the list of lake details.</returns>
        public async Task<List<SearchLakeDto>> GetLakeDetailsByIdsAsync(List<int> lakeIds, string? filter, string? sort, int pageNumber, int pageSize)
        {
            try
            {
                if (lakeIds.Count == 0)
                {
                    return new List<SearchLakeDto>();
                }
                List<int> paginationIds = lakeIds.Skip(pageSize * (pageNumber - 1)).Take(pageSize).ToList();

                List<string> stringFilterLakeIds = paginationIds.Select(id => id.ToString()).ToList();

                if (filter == StringConstant.members)
                {
                    stringFilterLakeIds = await _context.UserLakes
                        .Where(x => stringFilterLakeIds.Contains(x.LakeId))
                        .Select(x => x.LakeId)
                        .Distinct()
                        .ToListAsync();
                }
                else if (filter == StringConstant.admins)
                {
                    stringFilterLakeIds = await _context.LakeAdmin
                        .Where(x => stringFilterLakeIds.Contains(x.LakeId))
                        .Select(x => x.LakeId)
                        .Distinct()
                        .ToListAsync();
                }

                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string lakeIdsQuoted = string.Join(",", stringFilterLakeIds.Select(id => $"'{id}'"));
                    string lakeMetaDataQuery = $"SELECT lakepulse_id, lake_name, lake_state, lake_lon, lake_lat FROM main.lake_metadata WHERE lakepulse_id IN ({lakeIdsQuoted})";
                    IEnumerable<dynamic> lakeMetaResult = await connection.QueryAsync(lakeMetaDataQuery);
                    List<string?> lakepulseIdList = lakeMetaResult.Select(item => ((object)item.lakepulse_id).ToString()).ToList();
                    if (lakepulseIdList.Count > 0)
                    {
                        List<SearchLakeDto> result = await _commonService.CreateLakeDtosAsync(lakeMetaResult, lakepulseIdList);
                        if (filter == StringConstant.members)
                        {
                            if (sort?.ToUpper() == StringConstant.DESC)
                            {
                                result = result.OrderByDescending(x => x.communityUsers).ToList();
                            }
                            else
                            {
                                result = result.OrderBy(x => x.communityUsers).ToList();
                            }

                        }
                        else if (filter == StringConstant.admins)
                        {
                            if (sort?.ToUpper() == StringConstant.DESC)
                            {
                                result = result.OrderByDescending(x => x.communityAdmin).ToList();
                            }
                            else
                            {
                                result = result.OrderBy(x => x.communityAdmin).ToList();
                            }
                        }
                        else if (filter == StringConstant.updates)
                        {
                            result = result.FindAll(x =>
                            {
                                DateTime recentDate;
                                return DateTime.TryParse(x.recentDataCollection, out recentDate)
                                       && recentDate > DateTime.Today.AddYears(-1);
                            });
                            if (sort?.ToUpper() == StringConstant.DESC)
                            {
                                result = result.OrderByDescending(x => x.recentDataCollection).ToList();
                            }
                            else
                            {
                                result = result.OrderBy(x => x.recentDataCollection).ToList();
                            }
                        }
                        else
                        {
                            if (sort?.ToUpper() == StringConstant.DESC)
                            {
                                result = result.OrderByDescending(x => x.lakeName).ToList();
                            }
                            else
                            {
                                result = result.OrderBy(x => x.lakeName).ToList();
                            }
                        }

                        return result;
                    }
                    return new List<SearchLakeDto>();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method is to get the state name from state table.
        /// </summary>
        /// <returns>Task list of key value pair of lake name and its shortcut.</returns>
        public async Task<List<KeyValuePair<string, string>>> GetAllStatesAsync()
        {
            try
            {
                List<KeyValuePair<string, string>> result = await _commonService.GetAllStateListAsync();
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Method to get all details of a lake by its ID.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <returns>Returns a LakeDetailsDto containing the lake's overview and characteristics.</returns>
        public async Task<LakeDetailsDto> GetLakeAllDetailsByIdAsync(int lakeId)
        {
            try
            {
                const double conversionFactor = 4046.8564224;
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string lakeMetaDataQuery = $"SELECT lakepulse_id, lake_name, lake_county, lake_state,lake_totalarea_acres, lake_lon, lake_lat, lake_waterarea_acres FROM main.lake_metadata WHERE main.lake_metadata.lakepulse_id = {lakeId}";
                    IEnumerable<dynamic> lakeMetaDataResult = await connection.QueryAsync(lakeMetaDataQuery);
                    List<KeyValuePair<string, string>> stateList = await _commonService.GetAllStateListAsync();
                    LakeOverviewDto lakeOverviewDto = new()
                    {
                        LakePulseId = lakeMetaDataResult.Select(item => (int)item.lakepulse_id).FirstOrDefault(),
                        LakeName = lakeMetaDataResult.Select(item => (string)item.lake_name).FirstOrDefault(),
                        LakeCounty = lakeMetaDataResult.Select(item => (string)item.lake_county).FirstOrDefault(),
                        LakeState = stateList.Find(x => x.Value == lakeMetaDataResult.Select(item => (string)item.lake_state).FirstOrDefault()).Key,
                        LakeLatitude = lakeMetaDataResult.Select(item => (double)item.lake_lat).FirstOrDefault(),
                        LakeLongitude = lakeMetaDataResult.Select(item => (double)item.lake_lon).FirstOrDefault(),
                        LakeAreaAcres = lakeMetaDataResult.Select(item => (double?)(item.lake_totalarea_acres) ?? 0.0).FirstOrDefault(),
                        LakeWaterAreaAcres = lakeMetaDataResult.Select(item => (double?)(item.lake_waterarea_acres) ?? 0.0).FirstOrDefault()
,
                    };

                    string lakeCharacteristicQuery = $"WITH MaxDateResults AS ( SELECT result_characteristic, location_identifier, MAX(activity_start_date) AS max_date FROM main.measurement_results_vw WHERE lakepulse_id = {lakeId} GROUP BY result_characteristic, location_identifier ) SELECT t.location_identifier, t.activity_start_date, t.result_characteristic, avg(t.result_measure) as avg_result_measure FROM main.measurement_results_vw t INNER JOIN MaxDateResults mdr ON t.result_characteristic = mdr.result_characteristic AND t.location_identifier = mdr.location_identifier AND t.activity_start_date = mdr.max_date WHERE lakepulse_id = {lakeId} group by t.activity_start_date, t.location_identifier, t.result_characteristic ORDER BY t.activity_start_date DESC, t.location_identifier, t.result_characteristic;";
                    IEnumerable<dynamic> lakeCharacteristicResult = await connection.QueryAsync(lakeCharacteristicQuery);

                    List<LakeCharacteristicDto> lakeCharacteristicDtos = lakeCharacteristicResult
                        .Select(item => new LakeCharacteristicDto
                        {
                            LocationIdentifier = (string)item.location_identifier,
                            ResultCharacteristic = (string)item.result_characteristic,
                            ResultMeasure = (float?)item.avg_result_measure,
                            ActivityStartDate = item.activity_start_date?.ToString(StringConstant.dateFormat),

                        }).ToList();

                    string lakeSensorLocationQuery = $"select location_name, location_latitude, location_longitude , location_identifier, MAX(activity_start_date) AS max_date from main.measurement_results_vw mr where lakepulse_id = {lakeId} group by location_name, location_latitude, location_longitude, location_identifier order by location_latitude, location_longitude";
                    IEnumerable<dynamic> lakeSensorLocationResult = await connection.QueryAsync(lakeSensorLocationQuery);
                    List<SensorLocationDto> sensorList = lakeSensorLocationResult.Select(item => new SensorLocationDto
                    {
                        LocationName = (string)item.location_name,
                        SensorLatitude = (double)item.location_latitude,
                        SensorLongitude = (double)item.location_longitude,
                        LocationIdentifier = (string)item.location_identifier,
                        maxActivityStartDate = item.max_date?.ToString(StringConstant.dateFormat)
                    }).ToList();

                    List<string> lakeIdList = new List<string> { lakeId.ToString() };
                    List<ComunityMembersDto> comunityUsers = await _commonService.GetLakesCommunityUserCountsAsync(lakeIdList);

                    return new LakeDetailsDto
                    {
                        LakeOverview = lakeOverviewDto,
                        LakeCharacteristicList = lakeCharacteristicDtos,
                        SensorLocations = sensorList,
                        comunityMembersDto = comunityUsers.FirstOrDefault(),
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Gets the measurement results of a lake with pagination, filtering, and sorting.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="filters">The filters to apply to the query.</param>
        /// <param name="sortColumns">The columns to sort by and their sort directions.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the measurement results.</returns>
        public async Task<LakeMeasurementResultDto> GetLakeMeasurementResultsAsync(int lakeId, int pageNumber, int pageSize, List<KeyValueDto<string>>? filters, List<KeyValueDto<string>>? sortColumns)
        {
            try
            {
                int offset = (pageNumber - 1) * pageSize;
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string lakeMeasurementResultQuery = @"SELECT * FROM main.measurement_results_vw mr WHERE lakepulse_id = @lakeId";

                    // Add dynamic filtering for multiple columns
                    if (filters != null && filters.Count > 0)
                    {
                        foreach (var filter in filters)
                        {
                            string column = filter.Key;
                            string value = filter.Value;
                            lakeMeasurementResultQuery += $" AND {column} LIKE @{column}";
                        }
                    }

                    if (sortColumns != null && sortColumns.Count > 0)
                    {
                        int i = 0;
                        lakeMeasurementResultQuery += " ORDER BY ";
                        foreach (var sortColumn in sortColumns)
                        {
                            string column = sortColumn.Key;
                            string direction = sortColumn.Value;
                            lakeMeasurementResultQuery += $"{column} {direction}";
                            if (i < sortColumns.Count - 1)
                            {
                                lakeMeasurementResultQuery += ", ";
                            }
                            i++;
                        }
                    }
                    else
                    {
                        lakeMeasurementResultQuery += " ORDER BY activity_start_date DESC";
                    }

                    // Add pagination
                    lakeMeasurementResultQuery += $" LIMIT @pageSize OFFSET @offset";

                    // Build the count query
                    string lakeMeasurementResultCountQuery = @"SELECT COUNT(*) FROM main.measurement_results_vw mr WHERE lakepulse_id = @lakeId";

                    // Add dynamic filtering to the count query
                    if (filters != null && filters.Count > 0)
                    {
                        foreach (var filter in filters)
                        {
                            string column = filter.Key;
                            string value = filter.Value;
                            lakeMeasurementResultCountQuery += $" AND {column} LIKE @{column}";
                        }
                    }

                    // Create parameters
                    var parameters = new DynamicParameters();
                    parameters.Add("@lakeId", lakeId);
                    parameters.Add("@pageSize", pageSize);
                    parameters.Add("@offset", offset);

                    // Add filter parameters
                    if (filters != null)
                    {
                        foreach (var filter in filters)
                        {
                            parameters.Add($"@{filter.Key}", $"%{filter.Value}%");
                        }
                    }

                    IEnumerable<int> lakeMeasurementResultCount = await connection.QueryAsync<int>(lakeMeasurementResultCountQuery, parameters);
                    IEnumerable<dynamic> lakeMeasurementResult = await connection.QueryAsync(lakeMeasurementResultQuery, parameters);

                    List<MeasurementResultDto> measurementResultDtos = lakeMeasurementResult
                        .Select(item => new MeasurementResultDto
                        {
                            activity_depth_height_measure = (float?)item.activity_depth_height_measure,
                            activity_start_date = item.activity_start_date,
                            activity_start_time = (string)item.activity_start_time,
                            lake_county = (string)item.lake_county,
                            lake_name = (string)item.lake_name,
                            lake_state = (string)item.lake_state,
                            lakepulse_id = (int)item.lakepulse_id,
                            location_identifier = (string)item.location_identifier,
                            location_latitude = (float?)item.location_latitude,
                            location_longitude = (float?)item.location_longitude,
                            location_name = (string)item.location_name,
                            location_state = (string)item.location_state,
                            result_characteristic = (string)item.result_characteristic,
                            result_measure = (float?)item.result_measure,
                            result_month = (string)item.result_month,
                            result_month_year = (string)item.result_month_year,
                            result_year = (string)item.result_year,
                            result_measure_unit = (string)item.result_measure_unit,
                            measurement_source = (string)item.measurement_source
                        }).ToList();
                    LakeMeasurementResultDto lakeMeasurementResultDto = new()
                    {
                        MeasurementResultList = measurementResultDtos,
                        TotalCount = lakeMeasurementResultCount.FirstOrDefault(),
                    };
                    return lakeMeasurementResultDto;
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
