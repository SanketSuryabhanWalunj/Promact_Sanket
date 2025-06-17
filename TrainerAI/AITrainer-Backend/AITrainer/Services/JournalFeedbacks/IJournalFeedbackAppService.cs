using Microsoft.EntityFrameworkCore;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.Services.JournalFeedbacks
{
    public interface IJournalFeedbackAppService
    {
        Task<ActionResult> GenerateJournalFeedbackAsync(JournalFeedbackRequestDto journal);
        Task <ActionResult> GetJournalFeedback(string journalId);
        Task<bool> PublishJournalFeedback(string feedbackId);
        Task<JournalFeddbackResponse> UpdateJournalFeedback(UpdateJournalFeedback update);
    }
}
