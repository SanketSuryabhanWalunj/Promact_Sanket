using LakePulse.Data;
using LakePulse.DTOs;
using Microsoft.Extensions.Caching.Memory;

namespace LakePulse.Services.Cache
{
    public class CacheService : ICacheService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<CacheService> _logger;
        private readonly IMemoryCache _memoryCache;

        public CacheService(IMemoryCache memoryCache,
            ILogger<CacheService> logger,
            IConfiguration configuration)
        {
            _memoryCache = memoryCache;
            _logger = logger;
            _configuration = configuration;
        }


        /// <summary>
        /// Adds lake data to the cache.
        /// </summary>
        /// <typeparam name="T">The type of the data to cache.</typeparam>
        /// <param name="key">The cache key.</param>
        /// <param name="value">The data to cache.</param>
        public void AddLakeDataToCache<T>(string key, T value)
        {
            try
            {
                int timespam = _configuration.GetValue<int>("App:CacheTimeOut");
                MemoryCacheEntryOptions cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(timespam),
                };

                _memoryCache.Set(key, value, cacheOptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }


        /// <summary>
        /// Retrieves data from the cache.
        /// </summary>
        /// <typeparam name="T">The type of the data to retrieve.</typeparam>
        /// <param name="key">The cache key.</param>
        /// <returns>The cached data if available; otherwise, null.</returns>
        public T? GetDataFromCache<T>(string key) where T : class
        {
            try
            {
                if (_memoryCache.TryGetValue(key, out T? cachedData))
                {
                    return cachedData;
                }
                return null; // Cache miss
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }

        /// <summary>
        /// Removes data from the cache.
        /// </summary>
        /// <param name="key">The cache key.</param>
        public void RemoveLakeDataFromCache(string key)
        {
            try
            {
                _memoryCache.Remove(key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.internalServerError);
                throw;
            }
        }
    }
}
