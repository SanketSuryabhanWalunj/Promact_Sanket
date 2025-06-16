using LakePulse.Data;
using LakePulse.Services.Cache;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LakePulse.Controllers
{
    [Authorize]
    [Route("api/cache")]
    [ApiController]
    public class CacheController : ControllerBase
    {
        private readonly ICacheService _cacheService;
        private static readonly string LakeLatLongCacheKey = StringConstant.lakeData;
        public CacheController(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        /// <summary>
        /// Retrieves lake data from the cache.
        /// </summary>
        [HttpGet("lake-cache")]
        public IActionResult GetLakeDataCache()
        {
            var result = _cacheService.GetDataFromCache<object>(LakeLatLongCacheKey);
            return Ok(result);
        }

        /// <summary>
        /// Deletes lake data from the cache.
        /// </summary>
        [HttpDelete("lake-cache")]
        public IActionResult DeleteLakeDataCache()
        {
            _cacheService.RemoveLakeDataFromCache(LakeLatLongCacheKey);
            return Ok();
        }
    }
}
