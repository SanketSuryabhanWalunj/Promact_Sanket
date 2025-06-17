using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.Services.BehaviouralTemplate
{
    public interface IBehaviouralTemplateService
    {
        Task<BehaviourTemplate?> CreateTemplate(CreateBehaviouralTemplateDto createDto);
        Task<List<BehaviourTemplateResDto>> GetAllTemplates(int? currentPage, int? defualtList);
        Task<BehaviourTemplateResDto?> EditTemplate(EditTemplateDto editDto);
        Task DeleteTemplate(string id);
        Task<List<BehaviourTemplateResDto>> GetBehaviouralTemplateByInternshipId(string id);
    }
}
