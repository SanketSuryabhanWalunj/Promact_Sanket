using LakePulse.DTOs;
using LakePulse.Models;

namespace LakePulse.Services.Characteristic
{
    public interface ICharacteristicService
    {
        Task<IEnumerable<CharacteristicsDto>> GetAllCharacteristicAsync();
        Task<string> AddFavouriteCharacteristicAsync(string userId, string lakeId, string characteristicId);
        Task<string> RemoveFavouriteCharacteristicAsync(string userId, string lakeId, string characteristicId);
        Task<List<LakeCharacteristicDto>> GetFavouriteCharacteristicsAsync(string userId, string lakeId);
        Task<List<FavouriteCharacteristic>> GetAllFavouriteCharacteristicsAsync();
        Task<List<LakeCharacteristicChartDto>> GetChartAsync(string lakeId, string characteristicId, int duraionDays);
    }
}
