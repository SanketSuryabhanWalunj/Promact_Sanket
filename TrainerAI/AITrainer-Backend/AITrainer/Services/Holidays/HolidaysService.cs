using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Holidays;

namespace AITrainer.Services.Holidays
{
    public class HolidaysService : IHolidaysService
    {
        private readonly IHolidaysRepository _holidaysRepository;

        public HolidaysService(IHolidaysRepository holidaysRepository)
        {
            _holidaysRepository = holidaysRepository;
        }
        /// <summary>
        /// Retrieves holiday details.
        /// </summary>
        /// <returns>Returns a list of holidays for the year</returns>
        public async Task<List<Holiday>> GetHolidays()
        {
            List<Holiday> holidays = await _holidaysRepository.GetHolidays();
            return holidays;
        }
    }
}
