using AITrainer.AITrainer.Core.Dto.CareerPaths;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.CareerPaths;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CareerPathController : ControllerBase
    {
        private readonly ICareerPathRepository _careerPathRepository;

        public CareerPathController(ICareerPathRepository careerPathRepository)
        {
            _careerPathRepository = careerPathRepository;
        }

        /// <summary>
        /// Retrieves all available career paths.
        /// </summary>
        /// <returns>A Task<IActionResult> containing the list of career paths.</returns>
        [HttpGet("ListCareerPaths")]
        public async Task<IActionResult> FetchAllCareerPaths()
        {
            List<CareerPath> careerPaths = await _careerPathRepository.GetAllCareerPathsAsync();
            return Ok(careerPaths);
        }

        /// <summary>
        /// Creates a career path.
        /// </summary>
        /// <param name="careerPath">The object containing CareerPath Name to be added.</param>
        /// <returns>A Task<IActionResult> containing the created career path.</returns>
        [HttpPost("CreateCareerPath")]
        public async Task<IActionResult> CreateCareerPath(CreateCareerPathRequestDto careerPath)
        {
            CareerPath newCareerPath = await _careerPathRepository.CreateCareerPathAsync(careerPath.CareerPathName);
            return Ok(newCareerPath);
        }

        /// <summary>
        /// Retrieves all available career paths.
        /// </summary>
        /// <param name="editCareerPath">The DTO used to edit career path.</param>
        /// <returns>A Task<IActionResult> containing updated career path.</returns>
        [HttpPut("EditCareerPath")]
        public async Task<IActionResult> EditCareerPath(EditCareerPathDto editCareerPath)
        {
            CareerPath updatedCareerPath = await _careerPathRepository.EditCareerPathAsync(editCareerPath);
            return Ok(updatedCareerPath);
        }

        /// <summary>
        /// Deletes career path.
        /// </summary>
        /// <param name="careerPathId">Career Path Id to delete career path.</param>
        /// <returns>A Task<IActionResult> Career Path which is deleted.</returns>
        [HttpDelete("DeleteCareerPath")]
        public async Task<IActionResult> DeleteCareerPath(string careerPathId)
        {
            CareerPath updatedCareerPath = await _careerPathRepository.DeleteCareerPathAsync(careerPathId);
            return Ok(updatedCareerPath);
        }
    }
}
