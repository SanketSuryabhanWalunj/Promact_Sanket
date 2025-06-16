using LakePulse.DTOs;

namespace LakePulse.Services.FeatureData
{
    public interface IFeaturesDataService
    {
        /// <summary>
        /// Retrieves a list of features by category for a specified lake.
        /// </summary>
        /// <param name="lakeId">The identifier of the lake.</param>
        /// <param name="category">The category of features to retrieve.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of FeaturesResponseDto.</returns>
        Task<List<FeaturesResponseDto>> GetFeaturesByCategoryAsync(string lakeId, string category);

        /// <summary>
        /// Retrieves the most recent result for a list of features.
        /// </summary>
        /// <param name="features">The list of features to retrieve recent results for.</param>
        /// <returns>A task that represents the asynchronous operation.</returns>
        Task GetFeatureRecentResultAsync(List<RecentResultRequestDto> features);
    }
}
