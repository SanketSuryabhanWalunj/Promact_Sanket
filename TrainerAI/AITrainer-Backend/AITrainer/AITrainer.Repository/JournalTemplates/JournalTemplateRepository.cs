using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.JournalTemplates
{
    public class JournalTemplateRepository : IJournalTemplateRepository
    {
        private readonly ApplicationDbContext _context;
        public JournalTemplateRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        /// <summary>
        /// Adds a new journal template to the database.
        /// </summary>
        /// <param name="journalTemplate">The journal template to be added</param>
        /// <returns>A task representing the asynchronous operation</returns>
        public async Task AddAsync(JournalTemplate journalTemplate)
        {
            await _context.JournalTemplate.AddAsync(journalTemplate);

            await _context.SaveChangesAsync();
        }


        /// <summary>
        /// Counts the number of non-deleted journal templates in the database.
        /// </summary>
        /// <returns>The count of non-deleted journal templates</returns>
        public async Task<int> Count()
        {
            int userCount = _context.JournalTemplate
                .Where(u => u.IsDeleted != true)
                .Count();

            return userCount;
        }


        /// <summary>
        /// Deletes a journal template by setting its IsDeleted property to true.
        /// </summary>
        /// <param name="id">The ID of the journal template to delete</param>
        public async Task DeleteTemplate(string id)
        {
            var template = await _context.JournalTemplate.FirstOrDefaultAsync(u => u.Id == id);

            template.IsDeleted = true;

            _context.JournalTemplate.Update(template);
            _context.SaveChanges();
        }


        /// <summary>
        /// Finds a course asynchronously by its ID.
        /// </summary>
        /// <param name="courseId">The ID of the course to find</param>
        /// <returns>The course if found, otherwise null</returns>
        public async Task<Course> FindAsyncByCourseId(string courseId)
        {
            return await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        }


        /// <summary>
        /// Finds a journal template asynchronously by its ID.
        /// </summary>
        /// <param name="journalTemplateId">The ID of the journal template to find</param>
        /// <returns>The journal template if found, otherwise null</returns>
        public async Task<JournalTemplate> FindAsyncByJournalTemplateId(string journalTemplateId)
        {
            return await _context.JournalTemplate.FindAsync(journalTemplateId);
        }


        /// <summary>
        /// Finds a journal template asynchronously by its name.
        /// </summary>
        /// <param name="name">The name of the journal template to find</param>
        /// <param name="userId">User id that we want to find with.</param>
        /// <returns>The journal template if found, otherwise null</returns>
        public async Task<JournalTemplate?> FindAsyncByName(string name, string? userId)
        {
            string? organiztionId = await _context.Admin
              .Where(u => u.UserId == userId)
              .Select(u => u.OrganizationId)
          .FirstOrDefaultAsync();

            List<string> usersInOrganization = await _context.Admin
                 .Where(u => u.OrganizationId == organiztionId)
                 .Select(u => u.UserId)
                .ToListAsync();

            JournalTemplate? template = await _context.JournalTemplate.FirstOrDefaultAsync(x => x.TemplateName.ToLower() ==name.ToLower() && !x.IsDeleted && usersInOrganization.Contains(x.CreatedBy));
            return template;
        }


        /// <summary>
        /// Finds a journal template asynchronously by its ID.
        /// </summary>
        /// <param name="id">The ID of the journal template to find</param>
        /// <returns>The journal template if found, otherwise null</returns>
        public async Task<JournalTemplate> FindAsyncByTemplateId(string id)
        {
            return await _context.JournalTemplate.FirstOrDefaultAsync(u => u.Id == id);
        }


        /// <summary>
        /// Retrieves the journal template ID asynchronously based on the user ID and topic ID.
        /// </summary>
        /// <param name="userId">The ID of the user</param>
        /// <param name="topicId">The ID of the topic</param>
        /// <returns>The journal template information if found, otherwise null</returns>
        public async Task<JournalTemplateInfo> GetId(string userId, string topicId)
        {
            var courseId = await _context.Topics.Where(i => i.Id == topicId).Select(i => i.CourseId).FirstOrDefaultAsync();
            var result = (from intern in _context.Intern
                          join internship in _context.Internship on intern.Id equals internship.InternId
                          where intern.UserId == userId && internship.Status == true
                          select new JournalTemplateInfo
                          {
                              InternId = intern.Id,
                              CourseId = courseId
                          }).FirstOrDefault();

            return result;
        }


        /// <summary>
        /// Retrieves a list of journal templates asynchronously based on the user ID.
        /// </summary>
        /// <param name="userId">The ID of the user</param>
        /// <returns>The list of journal templates if found, otherwise an empty list</returns>
        public async Task<List<TemplateInfoDto>> GetList(string userId)
        {
            var organiztionId = await _context.Admin
               .Where(u => u.UserId == userId)
               .Select(u => u.OrganizationId)
           .FirstOrDefaultAsync();

            var usersInOrganization = await _context.Admin
                 .Where(u => u.OrganizationId == organiztionId)
                 .Select(u => u.UserId)
                .ToListAsync();

            return await _context.JournalTemplate
                .Where(u => u.IsDeleted != true)
                 .Where(i => usersInOrganization.Contains(i.CreatedBy))
                .OrderByDescending(u => u.CreatedDate)
                .Select(u => new TemplateInfoDto
                {
                    Id = u.Id,
                    TemplateName = u.TemplateName,
                    IsDeleted = u.IsDeleted,
                }).ToListAsync();
        }


        /// <summary>
        /// Retrieves a list of template DTOs asynchronously based on the user ID.
        /// </summary>
        /// <param name="userId">The ID of the user</param>
        /// <returns>The list of template DTOs if found, otherwise an empty list</returns>
        public async Task<List<TemplateDto>> GetTemplateListAsync(string userId)
        {
            var organiztionId = await _context.Admin
               .Where(u => u.UserId == userId)
               .Select(u => u.OrganizationId)
           .FirstOrDefaultAsync();

            var usersInOrganization = await _context.Admin
                 .Where(u => u.OrganizationId == organiztionId)
                 .Select(u => u.UserId)
                .ToListAsync();
            return await _context.JournalTemplate
                 .Where(u => u.IsDeleted != true)
                 .Where(i => usersInOrganization.Contains(i.CreatedBy))
                 .Select(jt => new TemplateDto
                 {
                     TemplateId = jt.Id,
                     TemplateName = jt.TemplateName,
                 }).ToListAsync();
        }


        /// <summary>
        /// Updates a journal template asynchronously.
        /// </summary>
        /// <param name="journalTemplate">The journal template to be updated</param>
        public async Task updateTemplate(JournalTemplate journalTemplate)
        {
            _context.JournalTemplate.Update(journalTemplate);
            await _context.SaveChangesAsync();
        }


        /// <summary>
        /// Finds journal data asynchronously based on intern ID and topic ID.
        /// </summary>
        /// <param name="topicId">The ID of the topic</param>
        /// <param name="internshipId">The ID of the topic</param>
        /// <returns>The journal data</returns>
        public string FindAsyncJournal(string topicId, string internshipId)
        {
            var journal = _context.Journals
                .Where(u => u.Internship_Id == internshipId && u.Topic_Id == topicId && u.IsDeleted == false)
                .Select(u => u.Data)
                .FirstOrDefault();

            return journal;
        }


        /// <summary>
        /// Checks the status of a course to determine if it has an associated journal template.
        /// </summary>
        /// <param name="courseId">The ID of the course</param>
        /// <param name="internshipId">The ID of the internship</param>
        /// <returns>True if the course has an associated journal template; otherwise, false</returns>
        public async Task<bool> CheckStatus(string? courseId, string? internshipId)
        {
            if (courseId == null)
            {
                courseId = await _context.Internship.Where(i => i.Id == internshipId).Select(i => i.CourseId).FirstOrDefaultAsync();
            }
            var course = await _context.Courses
        .Where(i => i.Id == courseId && !i.IsDeleted)
        .FirstOrDefaultAsync();

            if (course?.JournalTemplate_Id == null)
            {
                return false;
            }
            return true;
        }
    }
}
