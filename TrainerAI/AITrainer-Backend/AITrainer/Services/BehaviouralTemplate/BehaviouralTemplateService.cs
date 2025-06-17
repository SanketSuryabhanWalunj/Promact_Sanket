using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.BehaviouralTemplate;
using System.Security.Claims;

namespace AITrainer.Services.BehaviouralTemplate
{
    public class BehaviouralTemplateService : IBehaviouralTemplateService
    {
        private readonly IBehaviouralTemplateRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public BehaviouralTemplateService(IBehaviouralTemplateRepository behaviouralTemplateRepository, IHttpContextAccessor httpContext)
        {
            _repository = behaviouralTemplateRepository;
            _httpContextAccessor = httpContext;
        }

        /// <summary>
        /// Creates a new behavioural template with categories based on the provided DTO.
        /// </summary>
        /// <param name="createDto">Data transfer object containing the details for the new template and its categories.</param>
        /// <returns>The newly created BehaviourTemplate object.</returns>

        public async Task<BehaviourTemplate?> CreateTemplate(CreateBehaviouralTemplateDto createDto)
        {
            string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<BehaviourTemplate> templates =  await _repository.GetTemplateByTemplateName(userId, createDto.TemplateName);
            if (templates.Any())
            {
                return null;
            }

            BehaviourTemplate result = new()
            {
                Id = Guid.NewGuid().ToString(),
                TemplateName = createDto.TemplateName,
                Description = createDto.Description,
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            BehaviourTemplate addTemplate = await _repository.AddTemplate(result);

            foreach (TemplateCategories category in createDto.Options)
            {
                BehaviourCategory templateCategory = new()
                {
                    Id = Guid.NewGuid().ToString(),
                    BehaviourTemplateId = result.Id,
                    CategoryName = category.CategoryName,
                    TotalMarks = category.TotalMarks,
                    CreatedBy = userId,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow,
                    IsDeleted = false
                };

                var addCategory = await _repository.AddCategory(templateCategory);
            }

            return addTemplate;

        }

        /// <summary>
        /// Retrieves a paginated list of all behavioural templates created by the current user.
        /// Pagination parameters are optional. If not provided, all templates are returned.
        /// </summary>
        /// <param name="currentPage">The current page number for pagination (optional).</param>
        /// <param name="defaultList">The default number of items per page for pagination (optional).</param>
        /// <returns>A list of BehaviourTemplateResDto objects containing the template details.</returns>
        public async Task<List<BehaviourTemplateResDto>> GetAllTemplates(int? currentPage, int? defualtList)
        {
            string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? lastIndex = defualtList * currentPage;

            int? firstIndex = lastIndex - defualtList;

            List<BehaviourTemplateResDto> templateList = await _repository.GetList(userId);

            List<BehaviourTemplateResDto> Data = templateList;

            return Data;
        }

        /// <summary>
        /// Edits an existing behavioural template based on the provided DTO, updating template details and categories.
        /// Categories can be added or updated, and unused categories are marked as deleted.
        /// </summary>
        /// <param name="editDto">Data transfer object containing the updated details for the template and its categories.</param>
        /// <returns>The updated BehaviourTemplateResDto object.</returns>
        public async Task<BehaviourTemplateResDto?> EditTemplate(EditTemplateDto editDto)
        {
            string? userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<BehaviourTemplate> templates = await _repository.GetTemplateByTemplateName(userId, editDto.TemplateName);
            if (templates.Any())
            {
                return null;
            }

            BehaviourTemplateResDto template = await _repository.GetTemplateById(editDto.Id);
            BehaviourTemplate EditTemplate = await _repository.GetTemplateByIdAsync(editDto.Id);
            EditTemplate.TemplateName = editDto.TemplateName;
            EditTemplate.UpdatedDate = DateTime.UtcNow;
            BehaviourTemplate updateTemplate = await _repository.UpdateTemplate(EditTemplate);
            List<BehaviourCategory> existingCategories = await _repository.GetCategoriesByTemplateId(editDto.Id);
            foreach (BehaviouralCategoryDto item in editDto.Options)
            {
                if (item.Id == "" || item.Id == null)
                {
                    BehaviourCategory templateCategory = new()
                    {
                        Id = Guid.NewGuid().ToString(),
                        BehaviourTemplateId = editDto.Id,
                        CategoryName = item.CategoryName,
                        TotalMarks = item.TotalMarks,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow,
                        IsDeleted = false
                    };

                    BehaviourCategory addCategory = await _repository.AddCategory(templateCategory);

                }
                else
                {
                    BehaviourCategory category = await _repository.GetCategoryById(item.Id, template.Id);
                    category.CategoryName = item.CategoryName;
                    category.TotalMarks = item.TotalMarks;
                    category.UpdatedDate = DateTime.UtcNow;

                    BehaviourCategory updateCategory = await _repository.UpdateCategory(category);
                }
            }

            List<BehaviourCategory> categoriesToDelete = existingCategories.Where(ec => !editDto.Options.Any(o => o.Id == ec.Id && (o.Id != null || o.Id != ""))).ToList();
            foreach (BehaviourCategory categoryToDelete in categoriesToDelete)
            {
                categoryToDelete.IsDeleted = true;
                categoryToDelete.UpdatedDate = DateTime.UtcNow;

                BehaviourCategory updateCategory = await _repository.UpdateCategory(categoryToDelete);
            }
            var edited = await _repository.GetTemplateById(editDto.Id);

            return edited;
        }

        /// <summary>
        /// Deletes a behavioural template and its associated categories by marking them as deleted.
        /// </summary>
        /// <param name="id">The ID of the template to delete.</param>
        /// <returns>Task completed once the template and its categories are marked as deleted.</returns>
        public async Task DeleteTemplate(string id)
        {
            BehaviourTemplate template = await _repository.GetTemplateByIdAsync(id);
            template.IsDeleted = true;
            BehaviourTemplate updateTemplate = await _repository.UpdateTemplate(template);
            List<BehaviourCategory> existingCategories = await _repository.GetCategoriesByTemplateId(id);
            foreach (BehaviourCategory categoryToDelete in existingCategories)
            {
                categoryToDelete.IsDeleted = true;
                categoryToDelete.UpdatedDate = DateTime.UtcNow;

                BehaviourCategory updateCategory = await _repository.UpdateCategory(categoryToDelete);
            }
        }

        /// <summary>
        /// Retrieves the behavioural template associated with a specific internship ID.
        /// </summary>
        /// <param name="id">The ID of the internship for which to retrieve the associated template.</param>
        /// <returns>The BehaviourTemplateResDto object containing details of the associated template.</returns>
        public async Task<List<BehaviourTemplateResDto>> GetBehaviouralTemplateByInternshipId(string id)
        {
            
            IEnumerable<string> templateIds = await _repository.GetTemplateByInternshipId(id);

            List<BehaviourTemplateResDto> templateDetails = await _repository.GetTemplatesById(templateIds,id);

            return templateDetails;
        }
    }
}
