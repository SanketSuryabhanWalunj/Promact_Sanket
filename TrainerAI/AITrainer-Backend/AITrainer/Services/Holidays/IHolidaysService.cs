using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.Services.Holidays
{
    public interface IHolidaysService
    {
        /// <summary>
        /// Retrieves holiday details.
        /// </summary>
        /// <returns>Returns a list of holidays for the year</returns>
        Task<List<Holiday>> GetHolidays();
    }
}
