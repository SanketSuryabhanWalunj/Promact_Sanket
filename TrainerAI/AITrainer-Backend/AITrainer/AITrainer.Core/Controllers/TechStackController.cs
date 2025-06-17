using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.TechStacks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Authorize(Roles = "SuperAdmin")]
    [Route("api/[controller]")]
    [ApiController]
    public class TechStackController : ControllerBase
    {
        public readonly ITechStackRepository _techStackRepository;
        public TechStackController(ITechStackRepository techStackRepository)
        {
            _techStackRepository = techStackRepository;
        }

        /// <summary>
        /// Retrieves all available technology stacks.
        /// </summary>
        /// <returns>A Task<IActionResult> containing the list of technology stacks.</returns>
        [HttpGet("List-TechStacks")]
        public async Task<IActionResult> FetchAllTechStacks()
        {
            var techStacks = await _techStackRepository.GetAllTechStacksAsync();
            return Ok(techStacks);
        }
    }
}
