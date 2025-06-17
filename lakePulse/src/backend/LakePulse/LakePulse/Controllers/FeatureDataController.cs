using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.Services.FeatureData;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
    [Authorize(Roles = "Super Admin,Admin, User")]
    [Route("api/features-data")]
    [ApiController]
    public class FeatureDataController : ControllerBase
    {

        private readonly IFeaturesDataService _featuresDataService;

        public FeatureDataController(IFeaturesDataService featuresDataService)
        {
            _featuresDataService = featuresDataService;
        }

        /// <summary>
        /// Retrieves features by category for a specified lake.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="category">The category of features to retrieve.</param>
        /// <returns>A list of features for the specified category and lake.</returns>
        [HttpGet("get-features-by-category")]
        public async Task<ActionResult> GetFeaturesByCategoryAsync([Required] string lakeId, [Required] string category)
        {
            List<FeaturesResponseDto> lakeFeatureList = await _featuresDataService.GetFeaturesByCategoryAsync(lakeId, category);
            return Ok(lakeFeatureList);
        }

        /// <summary>
        /// Updates the recent result of features.
        /// </summary>
        /// <param name="features">The list of recent result request DTOs.</param>
        /// <returns>An ActionResult indicating the outcome of the operation.</returns>
        [HttpPost("feature-recent-result")]
        public async Task<ActionResult> UpdateFeatureRecentResultAsync([FromBody] List<RecentResultRequestDto> features)
        {
            if (features == null || features.Count == 0)
            {
                return BadRequest(StringConstant.NoFeaturesProvided);
            }
            await _featuresDataService.GetFeatureRecentResultAsync(features);
            return Ok();
        }

    }
}
