using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.DomainModel;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Holidays
{
    public class HolidaysRepository :IHolidaysRepository 
    {
        private readonly ApplicationDbContext _dbContext;

        public HolidaysRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        /// <summary>
        /// Retrieves holiday details.
        /// </summary>
        /// <returns>Returns a list of holidays for the year</returns>
        public async Task<List<Holiday>> GetHolidays()
        {
            List<Holiday> holidays = await _dbContext.Holidays.ToListAsync();

            foreach (var holiday in holidays)
            {
                holiday.Date = holiday.Date.ToUniversalTime();
            }

            return holidays;
        }
    }
}
