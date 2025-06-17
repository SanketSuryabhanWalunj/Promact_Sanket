using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.JournalFeedbacks
{
    public interface IJournalFeedbackRepository
    {
        Task<Topic>GetJournalTopic(string topicId);
        Task<JournalFeedback> AddJournalFeedback(JournalFeedback journalFeedback);
        Task<JournalFeedback> DeleteJournalFeedback(string id);
        Task<JournalFeedback> GetJournalFeedbackById(string id);
        Task<List<JournalFeedback>> GetJournalFeedbacks();
        Task<JournalFeedback> UpdateJournalFeedback(JournalFeedback journalFeedback);
        Task<Journal> FindJournalByIdAsync(string journalId);
        Task<JournalFeedback> FindJournalFeedbackByIdAsync(string journalId);
        Task<Journal> createNullSubmition(JournalFeedbackRequestDto journals);
    }
}
