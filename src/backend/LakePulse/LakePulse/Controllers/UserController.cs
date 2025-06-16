using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
    [Authorize]
    [Route("api/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Method is for get all user my lakes. 
        /// </summary>
        /// <returns>List of my lakes.</returns>
        [HttpGet("my-lake-list")]
        public async Task<ActionResult> GetAllMyLakeAsync()
        {
            List<UserLake> result = await _userService.GetAllMyLakeAsync();
            return Ok(result);
        }

        /// <summary>
        /// Method to get the count of lakes associated with a user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <returns>Count of lakes associated with the user.</returns>
        [HttpGet("my-lakes-count-by-user-id")]
        public async Task<ActionResult> GetMyLakesCountByUserIdAsync([Required] string userId)
        {
            int result = await _userService.GetMyLakesCountByUserIdAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Method is to get the list of user saved lakes.
        /// </summary>
        /// <param name="userId">User Id.</param>
        /// <returns>List of lakes.</returns>
        [HttpGet("my-lakes-by-id")]
        public async Task<IActionResult> GetMyLakesListAsync([Required] string userId)
        {
            List<MyLakeDto> result = await _userService.GetMyLakesByUserIdAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Method to add a lake to the user's list of lakes.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="lakeId">Lake id.</param>
        /// <returns>Result of the operation.</returns>
        [HttpPost("my-lake")]
        public async Task<ActionResult> AddMyLakeAsync([Required] string userId, [Required] string lakeId)
        {
            string result = await _userService.AddLakesInMyLakeAsync(userId, lakeId);
            return Ok(result);
        }

        /// <summary>
        /// Method is for delete the my lake by mylakeId.
        /// </summary>
        /// <param name="userId">Lake id.</param>
        /// <param name="lakeId">Lake id of readshift database.</param>
        /// <returns>String.</returns>
        [HttpDelete("my-lake")]
        public async Task<ActionResult> DeleteMyLakeAsync([Required] string userId, [Required] string lakeId)
        {
            string result = await _userService.DeleteMyLakeAsync(userId, lakeId);
            return Ok(result);
        }

        /// <summary>
        /// Method to delete all lakes associated with a user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <returns>Task.</returns>
        [HttpDelete("user-lakes")]
        public async Task<ActionResult> DeleteUserLakesAsync([Required] string userId)
        {
            await _userService.DeleteUserLakesAsync(userId);
            return Ok();
        }

    }
}
