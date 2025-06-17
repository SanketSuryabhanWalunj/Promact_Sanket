using LakePulse.DTOs;

namespace LakePulse.Services.Cache
{
    public interface ICacheService
    {
        void AddLakeDataToCache<T>(string key, T value);
        T? GetDataFromCache<T>(string key) where T : class;
        void RemoveLakeDataFromCache(string key);
    }
}
