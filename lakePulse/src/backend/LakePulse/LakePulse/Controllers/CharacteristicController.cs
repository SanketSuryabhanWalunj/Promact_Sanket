using LakePulse.DTOs;
using LakePulse.Models;
using LakePulse.Services.Characteristic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
    [Authorize]
    [Route("api/characteristic")]
    [ApiController]
    public class CharacteristicController : ControllerBase
    {
        private readonly ICharacteristicService _characteristicService;

        public CharacteristicController(ICharacteristicService characteristicService)
        {
            _characteristicService = characteristicService;
        }

        /// <summary>
        /// Retrieves all characteristics.
        /// </summary>
        /// <returns>A list of characteristics.</returns>
        [HttpGet("characteristics")]
        public async Task<IActionResult> GetAllCharacteristics()
        {
            IEnumerable<CharacteristicsDto> characteristics = await _characteristicService.GetAllCharacteristicAsync();
            return Ok(characteristics);
        }

        /// <summary>
        /// Method to get all favorite characteristics asynchronously.
        /// </summary>
        /// <returns>Task containing a list of FavouriteCharacteristic.</returns>
        [HttpGet("favourites")]
        public async Task<ActionResult> GetAllFavouriteCharacteristicsAsync()
        {
            List<FavouriteCharacteristic> result = await _characteristicService.GetAllFavouriteCharacteristicsAsync();
            return Ok(result);
        }


        /// <summary>
        /// Method to get favorite characteristics for a specific user and lake asynchronously.  
        /// </summary>  
        /// <param name="userId">The ID of the user.</param>  
        /// <param name="lakeId">The ID of the lake.</param>  
        /// <returns>Task containing a list of LakeCharacteristicDto.</returns>  
        [HttpGet("user-favourite")]
        public async Task<ActionResult> GetFavouriteCharacteristicsAsync([Required] string userId, [Required] string lakeId)
        {
            List<LakeCharacteristicDto> result = await _characteristicService.GetFavouriteCharacteristicsAsync(userId, lakeId);
            return Ok(result);
        }

        /// <summary>
        /// Method to get chart data for a specific lake and characteristic over a specified duration.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="characteristicId">The ID of the characteristic.</param>
        /// <param name="duraionDays">The duration in days for which the data is to be fetched.</param>
        /// <returns>Task containing a list of LakeCharacteristicChartDto.</returns>
        [HttpGet("chart")]
        public async Task<ActionResult> GetChartAsync([Required] string lakeId, [Required] string characteristicId, [Required] int duraionDays)
        {
            List<LakeCharacteristicChartDto> result = await _characteristicService.GetChartAsync(lakeId, characteristicId, duraionDays);
            return Ok(result);
        }

        /// <summary>
        /// Method to add a favorite characteristic for a user and lake asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="characteristicId">The ID of the characteristic.</param>
        /// <returns>Task containing a string message indicating the result of the operation.</returns>
        [HttpPost("user-favourite")]
        public async Task<ActionResult> AddFavouriteCharacteristicAsync([Required] string userId, [Required] string lakeId, [Required] string characteristicId)
        {
            string result = await _characteristicService.AddFavouriteCharacteristicAsync(userId, lakeId, characteristicId);
            return Ok(result);
        }

        /// <summary>
        /// Method to remove a favorite characteristic for a user and lake asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="characteristicId">The ID of the characteristic.</param>
        /// <returns>Task containing a string message indicating the result of the operation.</returns>
        [HttpDelete("user-favourite")]
        public async Task<ActionResult> RemoveFavouriteCharacteristicAsync([Required] string userId, [Required] string lakeId, [Required] string characteristicId)
        {
            string result = await _characteristicService.RemoveFavouriteCharacteristicAsync(userId, lakeId, characteristicId);
            return Ok(result);
        }
    }
}
