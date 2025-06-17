using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.JournalTemplates
{
    public interface IJournalTemplateRepository
    {
        Task AddAsync(JournalTemplate journalTemplate);

        Task<JournalTemplate?> FindAsyncByName(string name, string? userId);

        Task<Course> FindAsyncByCourseId(string courseId);

        Task<JournalTemplate> FindAsyncByJournalTemplateId(string journalTemplateId);

        //Task<List<TemplateInfoDto>> GetList(int firstIndex, int lastIndex);
        Task<List<TemplateInfoDto>> GetList(string userId);

        Task DeleteTemplate(string id);

        Task<JournalTemplate> FindAsyncByTemplateId(string id);

        Task updateTemplate(JournalTemplate journalTemplate);

        Task<int> Count();
        Task<List<TemplateDto>> GetTemplateListAsync(string userId);

        Task<JournalTemplateInfo> GetId(string userId,string topicId);

        string FindAsyncJournal(string topicId, string internshipId);

        Task<bool> CheckStatus(string ?courseId, string? internshipId);
    }
}
