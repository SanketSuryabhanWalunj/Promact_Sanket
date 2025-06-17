using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Util
{
    public class SeedDatabase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IWebHostEnvironment _hostingEnvironment;
        public SeedDatabase(ApplicationDbContext dbContext, IWebHostEnvironment hostingEnvironment)
        {
            _dbContext = dbContext;
            _hostingEnvironment = hostingEnvironment;

        }

        public async Task Seed()
        {
            await SeedHolidays();
        }
        private async Task SeedHolidays()
        {
            if (!await _dbContext.Holidays.AnyAsync())
            {
                _dbContext.Holidays.AddRange(
                    new Holiday { Id = 1, Date = DateTime.SpecifyKind(new DateTime(2024, 1, 26, 0, 0, 0), DateTimeKind.Utc), WeekDay = "Friday", HolidayName = "Republic Day", WorkLocation = "All" },
                    new Holiday { Id = 2, Date = DateTime.SpecifyKind(new DateTime(2024, 8, 15, 0, 0, 0), DateTimeKind.Utc), WeekDay = "Thursday", HolidayName = "Independence Day", WorkLocation = "All" },
                    new Holiday { Id = 3, Date = DateTime.SpecifyKind(new DateTime(2024, 10, 2, 0, 0, 0), DateTimeKind.Utc), WeekDay = "Wednesday", HolidayName = "Gandhi Jayanti", WorkLocation = "All" }
                );
                await _dbContext.SaveChangesAsync();
            }
        }

    }
}
