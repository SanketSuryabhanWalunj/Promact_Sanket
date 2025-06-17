using AutoMapper;
using Dapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Log;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LakePulse.Services.FeatureData
{
    public class FeaturesDataService : IFeaturesDataService
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IDataLogService _dataLogService;

        public FeaturesDataService(IConfiguration configuration, ApplicationDbContext context, IMapper mapper, IDataLogService dataLogService)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("RedshiftConnection");
            _context = context;
            _mapper = mapper;
            _dataLogService = dataLogService;
        }

        /// <summary>
        /// Retrieves a list of features by category for a specific lake.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="category">The category of the features.</param>
        /// <returns>A list of features with their recent results.</returns>
        /// <exception cref="Exception">Thrown when an error occurs while accessing the database, mapping the data, or any unexpected error.</exception>
        public async Task<List<FeaturesResponseDto>> GetFeaturesByCategoryAsync(string lakeId, string category)
        {
            try
            {
                IEnumerable<dynamic> featureDataResult;
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    string featureDataQuery = $"SELECT * FROM main.lake_features_vw WHERE main.lake_features_vw.lakepulse_id = {lakeId}";
                    featureDataResult = await connection.QueryAsync(featureDataQuery);
                }

                List<Models.Features> features = await _context.features.Where(x => x.category == category).ToListAsync();
                List<FeaturesResponseDto> featureData = _mapper.Map<List<FeaturesResponseDto>>(features);

                featureData.ForEach(x =>
                {
                    dynamic? row = featureDataResult.FirstOrDefault();
                    if (row != null && !string.IsNullOrEmpty(x.FeatureId))
                    {
                        var dict = (IDictionary<string, object>)row; // Convert dynamic row to dictionary
                        if (dict.ContainsKey(x.FeatureId)) // Check if column exists
                        {
                            if(x.DataType == "date")
                            {
                                string? date = (dict[x.FeatureId]?.ToString());
                                x.RecentResult = date != null ? DateTime.Parse(date).ToString("dd-MM-yyyy HH:mm:ss") : null;
                            }
                            else
                            {
                                x.RecentResult = (dict[x.FeatureId]?.ToString());
                            }
                            
                        }
                    }
                });

                return featureData;
            }
            catch (NpgsqlException ex)
            {
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (AutoMapperMappingException ex)
            {
                throw new Exception(StringConstant.errorMappingData, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

        /// <summary>
        /// Updates the recent result of features in the database.
        /// </summary>
        /// <param name="features">A list of features with their updated values.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        /// <exception cref="Exception">Thrown when an error occurs while accessing the database or any unexpected error.</exception>
        public async Task GetFeatureRecentResultAsync(List<RecentResultRequestDto> features)
        {
            try
            {
                using (NpgsqlConnection connection = new NpgsqlConnection(_connectionString))
                {
                    List<DataHubEditLog> dataHubEditLogs = new List<DataHubEditLog>();
                    await connection.OpenAsync();
                    foreach (RecentResultRequestDto feature in features)
                    {
                        if (feature.DataSource == "features")
                        {
                            string sql = $"UPDATE main.lake_features SET {feature.FieldId} = @Value WHERE lakepulse_id = @LakeId";
                            await connection.ExecuteAsync(sql, new { Value = feature.UpdatedValue, LakeId = feature.LakeId });
                        }
                        else if (feature.DataSource == "metadata")
                        {
                            string sql = $"UPDATE main.lake_metadata SET {feature.FieldId} = @Value WHERE lakepulse_id = @LakeId";
                            await connection.ExecuteAsync(sql, new { Value = feature.UpdatedValue, LakeId = feature.LakeId });
                        }
                        dataHubEditLogs.Add(new DataHubEditLog
                        {
                            LakePulseId = feature.LakeId,
                            UserEmail = feature.UserEmail,
                            FeatureId = feature.FieldId,
                            OldValue = feature.PreviousValue?.ToString(),
                            NewValue = feature.UpdatedValue?.ToString(),
                            CreatedBy= feature.UserEmail
                        });
                    }
                    if (dataHubEditLogs.Count > 0)
                    {
                        await _dataLogService.AddLogData(dataHubEditLogs);
                    }
                }
            }
            catch (NpgsqlException ex)
            {
                throw new Exception(StringConstant.errorAccessingDatabase, ex);
            }
            catch (Exception ex)
            {
                throw new Exception(StringConstant.unexpectedError, ex);
            }
        }

    }
}
