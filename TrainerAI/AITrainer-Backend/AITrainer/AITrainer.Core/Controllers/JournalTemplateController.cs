using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.JournalTemplates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JournalTemplateController : ControllerBase
    {
        private readonly IJournalTemplateRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JournalTemplateController(IJournalTemplateRepository repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }


        /// <summary>
        /// Creates a journal template.
        /// </summary>
        /// <param name="template">Data containing the journal template information.</param>
        /// <returns>
        /// Returns Ok if the template is successfully created.
        /// Returns Conflict if a template with the same name already exists.
        /// </returns>
        [HttpPost("created-templete")]
        public async Task<ActionResult> CreateTemplete(JournalTemplateDto template)
        {
            string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            JournalTemplate? journalIsExits = await _repository.FindAsyncByName(template.TemplateName, userId);
            if (journalIsExits != null)
            {
                return Conflict(new { message = "Template name already exits" });
            }

            string jasonData = JsonSerializer.Serialize(template.Options);
            JournalTemplate journal = new()
            {
                Id = Guid.NewGuid().ToString(),
                TemplateName = template.TemplateName,
                Data = jasonData,
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            await _repository.AddAsync(journal);
            return Ok(new { message = "Templete successfully created" });
        }


        /// <summary>
        /// Retrieves the template for a specific topic.
        /// </summary>
        /// <param name="topicId">The ID of the topic to retrieve the template for.</param>
        /// <param name="internshipId">The ID of the internship to retrieve the template for.</param>
        /// <returns>
        /// Returns Ok with the template data if found.
        /// Returns NotFound if no course, journal, or template is found.
        /// </returns>
        [HttpGet("GetTemplate")]
        public async Task<ActionResult> GetTopic(string topicId, string internshipId)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _repository.GetId(userId, topicId);
            var course = await _repository.FindAsyncByCourseId(result.CourseId);

            if (course == null)
            {
                return NotFound(new { message = "Not found any course" });
            }

            var Checkjournal = _repository.FindAsyncJournal(topicId, internshipId);
            string data;

            if (Checkjournal != null)
            {
                data = Checkjournal;
            }

            else
            {
                var template = await _repository.FindAsyncByJournalTemplateId(course.JournalTemplate_Id);

                data = template.Data;

                if (template == null)
                {
                    return NotFound(new { message = "Not found any template" });
                }
            }

            var jsonData = JsonSerializer.Deserialize<List<OptionDataDto>>(data);

            return Ok(jsonData);
        }


        /// <summary>
        /// Retrieves a paginated list of journal templates.
        /// </summary>
        /// <param name="currentPage">The current page number of the paginated list.</param>
        /// <param name="defaultList">The default number of items per page.</param>
        /// <returns>
        /// Returns Ok with a paginated list of journal templates if successful.
        /// Returns NotFound if no templates are found.
        /// </returns>
        [HttpGet("list-template")]
        public async Task<ActionResult> GetList(int currentPage, int defualtList)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var lastIndex = defualtList * currentPage;

            var firstIndex = lastIndex - defualtList;

            var templateList = await _repository.GetList(userId);

            var count = templateList.Count();

            var pageNumber = (int)Math.Ceiling((double)count / defualtList);

            if (templateList == null)
            {
                return NotFound(new { message = "Not found any template" });
            }

            var respone = new PaginatedResponse<TemplateInfoDto>
            {
                Data = templateList.Skip(firstIndex).Take(lastIndex - firstIndex),
                TotalPages = pageNumber,
            };

            return Ok(respone);
        }


        /// <summary>
        /// Deletes a journal template.
        /// </summary>
        /// <param name="Id">The ID of the template to be deleted.</param>
        /// <returns>
        /// Returns Ok if the template is successfully deleted.
        /// Returns NotFound if the specified template is not found.
        /// </returns>
        [HttpDelete("delet-template")]
        public async Task<ActionResult> DeleteTemplate(string Id)
        {
            var result = await _repository.FindAsyncByTemplateId(Id);

            if (result == null)
            {
                return NotFound(new { message = "Not found any template" });
            }

            await _repository.DeleteTemplate(Id);

            return Ok(new { message = "Template deleted successfully" });
        }


        /// <summary>
        /// Retrieves a specific journal template by its ID.
        /// </summary>
        /// <param name="id">The ID of the journal template to retrieve.</param>
        /// <returns>
        /// Returns Ok with the details of the requested journal template if found.
        /// Returns NotFound if no template is found with the specified ID.
        /// </returns>
        [HttpGet("GetList")]
        public async Task<ActionResult> GetList(string id)
        {
            var template = await _repository.FindAsyncByJournalTemplateId(id);

            if (template == null)
            {
                return NotFound(new { message = "Not found any templates" });
            }

            var jsonData = JsonSerializer.Deserialize<List<OptionDataDto>>(template.Data);

            var journal = new JournalTemplateDto
            {
                TemplateName = template.TemplateName,
                Options = jsonData,
            };

            return Ok(journal);
        }


        /// <summary>
        /// Updates an existing journal template.
        /// </summary>
        /// <param name="journalTemplate">Data containing the updated journal template information.</param>
        /// <returns>
        /// Returns Ok if the template is successfully updated.
        /// Returns NotFound if the specified template is not found.
        /// </returns>
        [HttpPut("update-template")]
        public async Task<ActionResult> UpdateTemplate(JournalTemplateUpdateDto journalTemplate)
        {
            string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            JournalTemplate? journalIsExits = await _repository.FindAsyncByName(journalTemplate.TemplateName, userId);
            if (journalIsExits != null)
            {
                return Conflict(new { message = "Template name already exits" });
            }

            JournalTemplate template = await _repository.FindAsyncByJournalTemplateId(journalTemplate.Id);
            if (template == null)
            {
                return NotFound(new { message = "Not found any templates" });
            }

            string jasonData = JsonSerializer.Serialize(journalTemplate.Options);
            template.TemplateName = journalTemplate.TemplateName;
            template.UpdatedDate = DateTime.UtcNow;
            template.Data = jasonData;
            await _repository.updateTemplate(template);
            return Ok(new { message = "Template updated successfully" });
        }


        /// <summary>
        /// Retrieves a list of journal templates.
        /// </summary>
        /// <returns> Returns Ok with the list of journal templates if successful. </returns>
        [HttpGet("GetTemplateList")]
        public async Task<ActionResult> GetJournalTemplateList()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var templateList = await _repository.GetTemplateListAsync(userId);

            return Ok(new { message = templateList });
        }


        /// <summary>
        /// Checks the status of a template assignment.
        /// </summary>
        /// <param name="courseId">Optional. The ID of the course.</param>
        /// <param name="internshipId">Optional. The ID of the internship.</param>
        /// <returns> Returns a boolean indicating whether the template is assigned or not. </returns>
        [HttpGet("GetTemplateStatus")]
        public Task<bool> CheckTemplateAssigned(string? courseId, string? internshipId)
        {
            var result = _repository.CheckStatus(courseId, internshipId);
            return result;
        }
    }
}
