using AITrainer.AITrainer.Core.Dto.Journal;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Journals
{
    public class JournalRepository : IJournalRepository
    {
        private readonly ApplicationDbContext _context;
        public JournalRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        /// <summary>
        /// Adds a journal asynchronously to the database.
        /// </summary>
        /// <param name="journal">The journal entity to be added</param>
        /// <returns></returns>
        public async Task AddAsync(Journal journal)
        {
            await _context.Journals.AddAsync(journal);
            await _context.SaveChangesAsync();
        }


        /// <summary>
        /// Retrieves the details of an intern.
        /// </summary>
        /// <param name="userId">The user ID of the intern</param>
        /// <param name="TopicId">The ID of the topic</param>
        /// <param name="internshipId">The ID of the internship</param>
        /// <returns>The details of the intern</returns>
        public async Task<JournalInfo> InternDetails(string userId, string TopicId, string internshipId)
        {
            var internId = await _context.Intern
                .Where(u => u.UserId == userId)
                .Select(u => u.Id)
                .FirstOrDefaultAsync();

            var topic = await _context.Topics.FirstOrDefaultAsync(u => u.Id == TopicId);


            return new JournalInfo
            {
                InternId = internId,
                InternshipId = internshipId,
            };
        }


        /// <summary>
        /// Checks for existing journal data based on topic, intern, and journal date.
        /// </summary>
        /// <param name="TopicId">The ID of the topic related to the journal entry</param>
        /// <param name="journalDate">The date of the journal entry</param>
        /// <param name="jsonData">The JSON data to be saved in the journal entry</param>
        /// <param name="internshipId">The ID of the internship related to the journal entry</param>
        /// <returns>The updated journal entry</returns>
        public async Task<Journal> CheckJournal(string TopicId, DateTime journalDate, string jsonData,string internshipId)
        {
            var journalData = await _context.Journals
                .Where(u => u.Internship_Id == internshipId && u.Topic_Id == TopicId && u.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (journalData == null)
            {
                return null;
            }

            journalData.IsDeleted = true;

            await _context.SaveChangesAsync();

            journalData.Id = Guid.NewGuid().ToString();
            journalData.UpdatedDate = journalDate;
            journalData.IsDeleted = false;
            journalData.Data = jsonData;

            await _context.Journals.AddAsync(journalData);
            await _context.SaveChangesAsync();

            return journalData;
        }


        /// <summary>
        /// Retrieves the evaluation status of the journal for the specified internship and topic.
        /// </summary>
        /// <param name="internshipId">The ID of the internship</param>
        /// <param name="TopicId">The ID of the topic</param>
        /// <returns>A JournalStatus object indicating if the journal is evaluated and published</returns>
        public async Task<JournalStatus> JournalEvaluationStatus(string internshipId, string TopicId)
        {
            var journalSubmission = await _context.Journals.Where(i=>i.Internship_Id == internshipId && i.Topic_Id == TopicId && i.IsDeleted == false).FirstOrDefaultAsync();
            if(journalSubmission != null)
            {
                var journalEvaluated = await _context.JournalFeedbacks.Where(i=>i.JournalId ==  journalSubmission.Id && i.InternshipId == internshipId && i.IsDeleted ==false).FirstOrDefaultAsync();
                if (journalEvaluated != null) 
                {
                    bool isPublished = journalEvaluated.IsPublished;
                    return new JournalStatus
                    {
                        isEvaluated = true,
                        isPublished = isPublished,
                    };
                }
            }

            return new JournalStatus
            {
                isEvaluated = false,
                isPublished = false,
            };          
        }
    }
}
