using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Holidays
{
    public interface IHolidaysRepository
    {
        /// <summary>
        /// Retrieves holiday details.
        /// </summary>
        /// <returns>Returns a list of holidays for the year</returns>
        Task<List<Holiday>> GetHolidays();
    }
}
