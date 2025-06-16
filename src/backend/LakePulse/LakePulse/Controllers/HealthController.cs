using LakePulse.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LakePulse.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// Method is to check the server health.
        /// </summary>
        /// <returns>OK status.</returns>
        [AllowAnonymous]
        [HttpGet("check")]
        public IActionResult GetHealthCheck()
        {
            return Ok(new { status = StringConstant.healthy, timestamp = DateTime.UtcNow });
        }
        
    }
}
