using Amazon.SimpleEmail.Model;
using LakePulse.Boathouse.Email;
using LakePulse.Data;
using LakePulse.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LakePulse.Controllers
{
    [Authorize(Roles = "Super Admin, Admin, User")]
    [Route("api/email")]
    [ApiController]
    public class BoathouseController : ControllerBase
    {
        #region Private Fields
        private readonly IBoathouseService _boathouseService;
        #endregion

        #region Constructor
        public BoathouseController(IBoathouseService boathouseService)
        {
            _boathouseService = boathouseService;
        }
        #endregion

        #region Public Methods
        /// <summary>  
        /// Sends an email to the boathouse using the provided email details.  
        /// </summary>  
        /// <param name="boathouseEmailDto">The email details including subject, recipient email, sender name, and message.</param>  
        /// <returns>An ActionResult indicating the success of the email sending operation.</returns>  
        [HttpPost("boathouse")]
        public async Task<ActionResult> SendBoathouseEmailAsync([FromBody] BoathouseEmailDto boathouseEmailDto)
        {
            await _boathouseService.SendBoathouseEmailAsync(boathouseEmailDto);
            return Ok(new { Message = StringConstant.boathouseEmailEentSuccessfully });
        }
        #endregion
    }
}
