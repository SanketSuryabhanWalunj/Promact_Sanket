using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.BehaviouralTemplate
{
    public class BehaviouralTemplateRepository : IBehaviouralTemplateRepository
    {
        private readonly ApplicationDbContext _context;
        public BehaviouralTemplateRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Adds a new behavior template to the database.
        /// </summary>
        /// <param name="result">The behavior template to be added.</param>
        /// <returns>
        /// The added behavior template.
        /// </returns>
        public async Task<BehaviourTemplate> AddTemplate(BehaviourTemplate result)
        {
            await _context.BehaviourTemplates.AddAsync(result);
            _context.SaveChanges();
            return result;
        }

        /// <summary>
        /// Adds a new behavior category to the database.
        /// </summary>
        /// <param name="category">The behavior category to be added.</param>
        /// <returns>
        /// The added behavior category.
        /// </returns>
        public async Task<BehaviourCategory> AddCategory(BehaviourCategory category)
        {
            await _context.BehaviourCategories.AddAsync(category);
            _context.SaveChanges();
            return category;
        }

        /// <summary>
        /// Retrieves a list of behavior templates based on the user's organization.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>
        /// A list of behavior template response DTOs containing behavior template information and associated categories.
        /// </returns>
        public async Task<List<BehaviourTemplateResDto>> GetList(string userId)
        {
            var organizationId = await _context.Admin.Where(i => i.UserId == userId).Select(i => i.OrganizationId).FirstOrDefaultAsync();
            var usersInOrganization = await _context.Admin.Where(i => i.OrganizationId == organizationId).Select(i => i.UserId).ToListAsync();
            var results = await _context.BehaviourTemplates
                 .Where(i => !i.IsDeleted && usersInOrganization.Contains(i.CreatedBy))
                 .ToListAsync();

            var resultDtos = await _context.BehaviourCategories
                .Where(i => !i.IsDeleted && results.Select(i => i.Id).Contains(i.BehaviourTemplateId))
                .GroupBy(i => i.BehaviourTemplateId)
                .ToListAsync();

            return resultDtos.Select(group => new BehaviourTemplateResDto
            {
                Id = group.Key,
                TemplateName = results.First(i => i.Id == group.Key).TemplateName,
                Description = results.First(i => i.Id == group.Key).Description,
                CreatedBy = results.First(i => i.Id == group.Key).CreatedBy,
                CreatedDate = results.First(i => i.Id == group.Key).CreatedDate,
                UpdatedDate = results.First(i => i.Id == group.Key).UpdatedDate,
                IsDeleted = results.First(i => i.Id == group.Key).IsDeleted,
                Options = group.ToList()
            }).ToList();
        }

        /// <summary>
        /// Retrieves a behavior template by its ID.
        /// </summary>
        /// <param name="tempId">The ID of the behavior template.</param>
        /// <returns>
        /// A behavior template response DTO containing information about the behavior template and associated categories.
        /// </returns>
        public async Task<BehaviourTemplateResDto> GetTemplateById(string tempId)
        {
            var template = await _context.BehaviourTemplates.Where(i => i.Id == tempId && i.IsDeleted == false).FirstOrDefaultAsync();
            var templateCategory = await _context.BehaviourCategories.Where(i => i.BehaviourTemplateId == tempId && i.IsDeleted == false).ToListAsync();
            return new BehaviourTemplateResDto
            {
                Id = template.Id,
                TemplateName = template.TemplateName,
                Description = template.Description,
                CreatedBy = template.CreatedBy,
                CreatedDate = template.CreatedDate,
                UpdatedDate = template.UpdatedDate,
                IsDeleted = template.IsDeleted,
                Options = templateCategory
            };

        }

        /// <summary>
        /// Retrieves a behavior category by its ID and the ID of the associated behavior template.
        /// </summary>
        /// <param name="categoryId">The ID of the behavior category.</param>
        /// <param name="templateId">The ID of the associated behavior template.</param>
        /// <returns>
        /// The behavior category object corresponding to the provided IDs.
        /// </returns>
        public async Task<BehaviourCategory> GetCategoryById(string categoryId, string templateId)
        {
            var category = await _context.BehaviourCategories.Where(i => i.Id == categoryId && i.BehaviourTemplateId == templateId && i.IsDeleted == false).FirstOrDefaultAsync();
            return category;
        }

        /// <summary>
        /// Updates a behavior category in the database.
        /// </summary>
        /// <param name="category">The behavior category object containing the updated information.</param>
        /// <returns>
        /// The updated behavior category object.
        /// </returns>
        public async Task<BehaviourCategory> UpdateCategory(BehaviourCategory category)
        {
            _context.BehaviourCategories.Update(category);
            _context.SaveChanges();
            return category;

        }

        /// <summary>
        /// Updates a behavior template in the database.
        /// </summary>
        /// <param name="template">The behavior template object containing the updated information.</param>
        /// <returns>
        /// The updated behavior template object.
        /// </returns>
        public async Task<BehaviourTemplate> UpdateTemplate(BehaviourTemplate template)
        {
            _context.BehaviourTemplates.Update(template);
            _context.SaveChanges();
            return template;
        }

        /// <summary>
        /// Retrieves a behavior template from the database by its ID asynchronously.
        /// </summary>
        /// <param name="tempId">The ID of the behavior template to retrieve.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the behavior template object if found, otherwise null.
        /// </returns>
        public async Task<BehaviourTemplate> GetTemplateByIdAsync(string tempId)
        {
            var result = await _context.BehaviourTemplates.Where(i => i.Id == tempId && i.IsDeleted == false).FirstOrDefaultAsync();
            return result;

        }

        /// <summary>
        /// Retrieves a list of behavior categories associated with a behavior template by template ID asynchronously.
        /// </summary>
        /// <param name="templateId">The ID of the behavior template.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains a list of behavior categories if found, otherwise an empty list.
        /// </returns>
        public async Task<List<BehaviourCategory>> GetCategoriesByTemplateId(string templateId)
        {
            var result = await _context.BehaviourCategories.Where(i => i.BehaviourTemplateId == templateId && i.IsDeleted == false).ToListAsync();
            return result;
        }

        /// <summary>
        /// Retrieves the behavior template ID associated with an internship by internship ID asynchronously.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the behavior template ID if found, otherwise null.
        /// </returns>
        public async Task<IEnumerable<string>> GetTemplateByInternshipId(string internshipId)
        {
            List<string?> templates = await _context.Internship
                .Where(i => i.Id == internshipId && i.isDismissed == false)
                .Select(i => i.BehaviourTemplateId)
                .ToListAsync();
            string templatesString = string.Join(",", templates);
            string[] templateIdsArray = templatesString.Split(',');

            return templateIdsArray;
        }

        /// <summary>
        /// Retrieves the behavior template ID associated with a category by category ID asynchronously.
        /// </summary>
        /// <param name="categoryId">The ID of the behavior category.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the behavior template ID if found, otherwise null.
        /// </returns>
        public async Task<string> GetTemplateByCategory(string categoryId)
        {
            var res = await _context.BehaviourCategories.Where(i => i.Id == categoryId && i.IsDeleted == false).Select(i => i.BehaviourTemplateId).FirstOrDefaultAsync();
            return res;
        }

        /// <summary>
        /// Retrieves behavior templates by their IDs asynchronously.
        /// </summary>
        /// <param name="tempIds">The IDs of the behavior templates to retrieve.</param>
        /// <returns>A task representing the asynchronous operation. 
        /// The task result contains a list of BehaviorTemplateResDto objects.</returns>
        public async Task<List<BehaviourTemplateResDto>> GetTemplatesById(IEnumerable<string> tempIds, string internshipId)
        {
            List<BehaviourTemplate> templates = await _context.BehaviourTemplates
                .Where(t => tempIds.Contains(t.Id) && !t.IsDeleted)
                .ToListAsync();

            List<BehaviourCategory> templateCategories = await _context.BehaviourCategories
                .Where(c => tempIds.Contains(c.BehaviourTemplateId) && !c.IsDeleted)
                .ToListAsync();

            // Join BehaviourTemplates, BehaviourCategories, and GeneralInternshipFeedbacks
            List<BehaviourTemplateResDto> templateDetails = (from template in templates
                                   join category in templateCategories on template.Id equals category.BehaviourTemplateId
                                   join feedback in _context.GeneralInternshipFeedbacks.Where(f => f.InternshipId == internshipId && f.IsDeleted == false) on category.Id equals feedback.BehaviourCategoryId into gj
                                   from subFeedback in gj.DefaultIfEmpty()
                                   select new BehaviourTemplateResDto
                                   {
                                       Id = template.Id,
                                       TemplateName = template.TemplateName,
                                       Description = template.Description,
                                       CreatedBy = template.CreatedBy,
                                       CreatedDate = template.CreatedDate,
                                       UpdatedDate = template.UpdatedDate,
                                       IsDeleted = template.IsDeleted,
                                       // Check if a published feedback exists for the category
                                       IsPublished = subFeedback != null && subFeedback.IsPublished.HasValue && subFeedback.IsPublished.Value,
                                       Options = templateCategories.Where(tc => tc.BehaviourTemplateId == template.Id).Distinct().ToList()
                                   }).ToList();

            return templateDetails;
        }

        /// <summary>
        /// The method is designed to retrieve a list of template names that match the provided `templateName` parameter.
        /// </summary>
        /// <param name="userId">Current login user.</param>
        /// <param name="templateName">Template Name.</param>
        /// <returns>List of templates that match the provided parameter name.</returns>
        public async Task<List<BehaviourTemplate>> GetTemplateByTemplateName(string? userId, string templateName)
        {
            string? organizationId = await _context.Admin.Where(i => i.UserId == userId).Select(i => i.OrganizationId).FirstOrDefaultAsync();
            List<string> usersInOrganization = await _context.Admin.Where(i => i.OrganizationId == organizationId).Select(i => i.UserId).ToListAsync();
            List<BehaviourTemplate> templates = await _context.BehaviourTemplates
                 .Where(i => !i.IsDeleted && usersInOrganization.Contains(i.CreatedBy) && i.TemplateName.ToLower() == templateName.ToLower())
                 .ToListAsync();

            return templates;
        }

    }
}
