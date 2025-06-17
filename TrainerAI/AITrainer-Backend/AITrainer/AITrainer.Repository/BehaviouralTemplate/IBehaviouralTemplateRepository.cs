using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AITrainer.AITrainer.Repository.BehaviouralTemplate
{
    public interface IBehaviouralTemplateRepository
    {
        Task<BehaviourTemplate> AddTemplate(BehaviourTemplate result);
        Task<BehaviourCategory> AddCategory(BehaviourCategory category);
        Task<List<BehaviourTemplateResDto>> GetList(string userId);
        Task<BehaviourTemplateResDto> GetTemplateById(string userId);
        Task<BehaviourTemplate> GetTemplateByIdAsync(string userId);
        Task<BehaviourCategory> GetCategoryById(string categoryId, string templateId);
        Task<List<BehaviourCategory>> GetCategoriesByTemplateId(string templateId);
        Task<BehaviourCategory> UpdateCategory(BehaviourCategory category);
        Task<BehaviourTemplate> UpdateTemplate(BehaviourTemplate category);
        Task<IEnumerable<string>> GetTemplateByInternshipId(string internshipId);
        Task<string> GetTemplateByCategory(string categoryId);     
        Task<List<BehaviourTemplateResDto>> GetTemplatesById(IEnumerable<string> tempIds, string internshipId);
        Task<List<BehaviourTemplate>> GetTemplateByTemplateName(string? userId, string templateName);
    }

}
