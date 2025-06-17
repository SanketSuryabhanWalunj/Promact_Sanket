using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.BehaviouralTemplate;
using AITrainer.Services.BehaviouralTemplate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BehaviouralTemplateController : ControllerBase

    {
        private readonly IBehaviouralTemplateService _behaveiouralTemplateService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IBehaviouralTemplateRepository _repository;
        public BehaviouralTemplateController(IBehaviouralTemplateRepository behaviouralTemplateRepository, IBehaviouralTemplateService behaviouralTemplateService, IHttpContextAccessor httpContextAccessor)
        {
            _behaveiouralTemplateService = behaviouralTemplateService;
            _httpContextAccessor = httpContextAccessor;
            _repository = behaviouralTemplateRepository;
        }

        /// <summary>
        /// Creates a new behavioural template using the provided data
        /// </summary>
        /// <param name="createDto">The data representing the new behavioural template</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the template creation</returns>
        [HttpPost("behavioural-template")]
        public async Task<ActionResult> CreteTemplate(CreateBehaviouralTemplateDto createDto)
        {
            BehaviourTemplate? result = await _behaveiouralTemplateService.CreateTemplate(createDto);
            if (result == null)
            {
                return BadRequest(new { message = "Template with same name is already present." });
            }

            return Ok(result);
        }

        /// <summary>
        /// Retrieves all behavioural templates based on pagination parameters
        /// </summary>
        /// <param name="currentPage">The current page number</param>
        /// <param name="defualtList">The default number of items per page</param>
        /// <returns>Returns an ActionResult with the list of behavioural templates and pagination information</returns>
        [HttpGet("get-Templates")]
        public async Task<ActionResult> GetAllTemplate(int? currentPage, int? defualtList)
        {
            var result = await _behaveiouralTemplateService.GetAllTemplates(currentPage, defualtList);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves a behavioural template by its ID
        /// </summary>
        /// <param name="id">The ID of the template to be retrieved</param>
        /// <returns>Returns an ActionResult with the template information if found, otherwise returns a not found message</returns>
        [HttpGet("GetById")]
        public async Task<ActionResult> GetTemplateById(string id)
        {
            var result = await _repository.GetTemplateById(id);
            return Ok(result);

        }

        /// <summary>
        /// Updates an existing behavioural template using the provided data
        /// </summary>
        /// <param name="editDto">The data representing the edited template</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the template update</returns>
        [HttpPut("template-update")]
        public async Task<ActionResult> UpdateTemplate(EditTemplateDto editDto)
        {
            BehaviourTemplateResDto? result = await _behaveiouralTemplateService.EditTemplate(editDto);
            if (result == null)
            {
                return BadRequest(new { message = "Template with same name is already present." });
            }

            return Ok(result);
        }

        /// <summary>
        /// Deletes a behavioural template with the specified ID
        /// </summary>
        /// <param name="Id">The ID of the template to be deleted</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the template deletion</returns>
        [HttpDelete("delete-template")]

        public async Task<ActionResult> DeleteTemplate(string Id)
        {
            var result = await _repository.GetTemplateById(Id);

            if (result == null)
            {
                return NotFound(new { message = "Not found any template" });
            }

            await _behaveiouralTemplateService.DeleteTemplate(Id);

            return Ok(new { message = "Template deleted successfully" });
        }

        /// <summary>
        /// Retrieves a behavioural template associated with a specific internship ID
        /// </summary>
        /// <param name="internshipId">The ID of the internship for which the template is to be retrieved</param>
        /// <returns>Returns an ActionResult with the template information if found, otherwise returns a bad request message</returns>
        [HttpGet("templateByInternship")]
        public async Task<ActionResult> GetByInternshipId(string internshipId)
        {
            List<BehaviourTemplateResDto> result = await _behaveiouralTemplateService.GetBehaviouralTemplateByInternshipId(internshipId);
            if (result == null)
            {
                return BadRequest("Not Found any Id");
            }
            return Ok(result);
        }


    }
}
