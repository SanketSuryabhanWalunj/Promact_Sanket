using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.DomainModel;
using Microsoft.EntityFrameworkCore;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks;
using AITrainer.AITrainer.Core.Dto.Intern;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AITrainer.AITrainer.Repository.JournalFeedbacks
{
    public class JournalFeedbackRepository : IJournalFeedbackRepository
    {
        private readonly ApplicationDbContext _context;

        public JournalFeedbackRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        /// <summary>
        /// Retrieves a list of journal feedback entries from the database asynchronously.
        /// </summary>
        /// <returns> A list of journal feedback entries. </returns>
        public async Task<List<JournalFeedback>> GetJournalFeedbacks()
        {
            return await _context.JournalFeedbacks.ToListAsync();
        }


        /// <summary>
        /// Retrieves a journal feedback entry from the database asynchronously based on the provided ID.
        /// </summary>
        /// <param name="id">The ID of the journal feedback entry to retrieve</param>
        /// <returns> The journal feedback entry corresponding to the provided ID, or null if not found. </returns>
        public async Task<JournalFeedback> GetJournalFeedbackById(string id)
        {
            return await _context.JournalFeedbacks.FirstOrDefaultAsync(x => x.Id == id);
        }


        /// <summary>
        /// Adds a new journal feedback entry to the database asynchronously.
        /// </summary>
        /// <param name="journalFeedback">The journal feedback entry to add</param>
        /// <returns>The added journal feedback entry</returns>
        public async Task<JournalFeedback> AddJournalFeedback(JournalFeedback journalFeedback)
        {
            _context.JournalFeedbacks.Add(journalFeedback);
            await _context.SaveChangesAsync();
            return journalFeedback;
        }


        /// <summary>
        /// Updates an existing journal feedback entry in the database asynchronously.
        /// </summary>
        /// <param name="journalFeedback">The journal feedback entry to update</param>
        /// <returns>The updated journal feedback entry</returns>
        public async Task<JournalFeedback> UpdateJournalFeedback(JournalFeedback journalFeedback)
        {
            _context.JournalFeedbacks.Update(journalFeedback);
            await _context.SaveChangesAsync();
            return journalFeedback;
        }


        /// <summary>
        /// Deletes a journal feedback entry from the database asynchronously.
        /// </summary>
        /// <param name="id">The ID of the journal feedback entry to delete</param>
        /// <returns>The deleted journal feedback entry if found and deleted successfully; otherwise, null</returns>
        public async Task<JournalFeedback> DeleteJournalFeedback(string id)
        {
            var journalFeedback = await _context.JournalFeedbacks.FirstOrDefaultAsync(x => x.Id == id);
            if (journalFeedback != null)
            {
                journalFeedback.IsDeleted = true;
                _context.JournalFeedbacks.Update(journalFeedback);
                await _context.SaveChangesAsync();
                return journalFeedback;
            }
            return null;
        }


        /// <summary>
        /// Retrieves a journal topic from the database asynchronously based on the provided topic ID.
        /// </summary>
        /// <param name="topicId">The ID of the journal topic to retrieve</param>
        /// <returns>The journal topic if found; otherwise, null</returns>
        public async Task<Topic> GetJournalTopic(string topicId)
        {
            var topic = await _context.Topics.FirstOrDefaultAsync(y => y.Id == topicId);
            return topic;
        }


        /// <summary>
        /// Retrieves a journal from the database asynchronously based on the provided journal ID.
        /// </summary>
        /// <param name="journalId">The ID of the journal to retrieve</param>
        /// <returns>The journal if found; otherwise, null </returns>
        public async Task<Journal> FindJournalByIdAsync(string journalId)
        {
            return await _context.Journals.FirstOrDefaultAsync(y => y.Id == journalId);
        }


        /// <summary>
        /// Retrieves journal feedback from the database asynchronously based on the provided journal ID.
        /// </summary>
        /// <param name="journalId">The ID of the journal associated with the feedback</param>
        /// <returns>The journal feedback if found; otherwise, null </returns>
        public async Task<JournalFeedback> FindJournalFeedbackByIdAsync(string journalId)
        {
            return await _context.JournalFeedbacks.FirstOrDefaultAsync(u => u.JournalId == journalId);
        }


        /// <summary>
        /// Creates a null journal submission for a given journal feedback request asynchronously.
        /// </summary>
        /// <param name="journals">The journal feedback request DTO containing necessary information</param>
        /// <returns>The created null journal submission </returns>
        public async Task<Journal> createNullSubmition(JournalFeedbackRequestDto journals)
        {
            var internId = await _context.Internship.Where(i => i.Id == journals.InternshipId)
                .Select(i => i.InternId).FirstOrDefaultAsync();
            var TopicId = journals.TopicId;
            var journal = new Journal
            {
                Id = Guid.NewGuid().ToString(),
                Internship_Id = journals.InternshipId,
                Intern_Id = internId,
                Topic_Id = TopicId,
                Data = "NA",
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false
            };

            await _context.Journals.AddAsync(journal);
            await _context.SaveChangesAsync();
            return journal;
        }
    }
}


