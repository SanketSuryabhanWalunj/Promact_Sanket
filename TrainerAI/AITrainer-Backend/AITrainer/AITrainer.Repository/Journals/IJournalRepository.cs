using AITrainer.AITrainer.Core.Dto.Journal;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Journals
{
    public interface IJournalRepository
    {
        Task AddAsync(Journal journal);

        Task<JournalInfo> InternDetails(string userId, string TopicId, string internshipId);

        Task<Journal> CheckJournal(string TopicId, DateTime journalDate, string jsonData, string internshipId);
        Task<JournalStatus> JournalEvaluationStatus(string internshipId, string TopicId);
    }
}
