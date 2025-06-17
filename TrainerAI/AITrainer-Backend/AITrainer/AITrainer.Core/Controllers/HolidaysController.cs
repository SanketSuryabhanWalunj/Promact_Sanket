using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.Services.Holidays;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HolidaysController : ControllerBase
    {
        private readonly IHolidaysService _holidaysService;

        public HolidaysController(IHolidaysService holidaysService)
        {
            _holidaysService = holidaysService;
        }

        [HttpGet("getholidays")]
        public async Task<IActionResult> GetHolidays()
        {
            List<Holiday> holidays = await _holidaysService.GetHolidays();
            return Ok(holidays);
        }
    }
}
