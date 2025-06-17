using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Net.Mail;

namespace AITrainer.AITrainer.Repository.BugsAndFeedback
{
    public class BugsFeedbacksRepository: IBugsFeedbacksRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        public BugsFeedbacksRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;

        }

        public async Task<BugsFeedback> CreateFeedbackAsync(BugsFeedback feedback)
        {
            _context.BugsFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        /// <summary>
        /// Retrieves the mentor of an intern based on the intern's user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern.</param>
        /// <returns>
        /// Returns a string representing the user ID of the mentor.
        /// </returns>
        public async Task<string> GetMentorAsync(string userId)
        {
            return await _context.Intern.AsNoTracking().Where(i => i.UserId == userId).Select(i => i.CreatedBy).FirstOrDefaultAsync();
        
        }


        /// <summary>
        /// Retrieves a list of mentors for a list of interns.
        /// </summary>
        /// <param name="userIds">The list of user IDs of the interns.</param>
        /// <returns>
        /// Returns a list of AdminList objects representing the mentors of the interns.
        /// </returns
        public async Task<List<AdminList>> GetMentorListOfInternAsync(List<string> userIds)
        {
          
            List<string> allUserIds = await _context.Admin.AsNoTracking()
                            .Where(u => userIds.Contains(u.UserId))
                            .Select(u => u.OrganizationId)
                            .Distinct()
                            .Join(
                             _context.Admin.AsNoTracking(),
                             outer => outer,
                             inner => inner.OrganizationId,
                            (outer, inner) => inner.UserId
                            )
                            .ToListAsync();

            List<AdminList> mentors = await _userManager.Users.AsNoTracking()
                .Where(u => allUserIds.Contains(u.Id) && !u.isDeleted)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .Select(u => new AdminList
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                })
                .ToListAsync();

            return mentors;
        }


        /// <summary>
        /// Retrieves all bug reports of an intern based on the intern's user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern.</param>
        /// <returns>
        /// Returns a list of BugsFeedback objects representing all bug reports of the intern.
        /// </returns>
        public async Task <List<BugsFeedback>> GetallBugReportOfInternAsync(string userId)
        {
           return await _context.BugsFeedbacks.AsNoTracking()
               .Where(f => f.ReporterId == userId && f.IsDeleted == false)
                .Include(f => f.Attachments.Where(a => a.IsDeleted == false))
               .ToListAsync();

        }


        /// <summary>
        /// Finds a bug report by its ID asynchronously.
        /// </summary>
        /// <param name="feedbackId">The ID of the bug report to find.</param>
        /// <returns>
        /// Returns a BugsFeedback object representing the bug report with the specified ID.
        /// </returns>

        public async Task<BugsFeedback> FindBugByIdAsync(string feedbackId)
        {
            return await _context.BugsFeedbacks.AsNoTracking()
               .Where(f => f.Id == feedbackId && f.IsDeleted == false)
                .Include(f => f.Attachments.Where(a => a.IsDeleted == false))
               .FirstOrDefaultAsync();
        }

        /// <summary>
        /// Updates a bug feedback entity in the database asynchronously.
        /// </summary>
        /// <param name="feedback">The BugsFeedback object to be updated.</param>
        /// <returns>Returns the updated BugsFeedback object.</returns>
        public async Task<BugsFeedback> UpdateFeedbackAsync(BugsFeedback feedback)
        {
            _context.Update(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        /// <summary>
        /// Retrieves an image attachment from the database asynchronously based on its ID.
        /// </summary>
        /// <param name="id">The ID of the image attachment to retrieve.</param>
        /// <returns>
        /// Returns a DocumentAttachment object representing the image attachment with the specified ID.
        /// </returns>
        public async Task<DocumentAttachment> GetImageAsync(string id)
        {
            return await _context.Attachments.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
        }

        /// <summary>
        /// Retrieves the list of bugs and feedback reported to a mentor or by interns associated with the mentor.
        /// </summary>
        /// <param name="mentorId">The ID of the mentor. If null, bugs and feedback reported by all interns in the organization of mentor are retrieved else returns feedback repoted without any mentor.</param>
        /// <param name="internIds">The list of IDs of interns associated with the mentor.</param>
        /// <returns>The list of bugs and feedback.</returns>
        public async Task<List<BugsFeedback>> GetMentorBugsAsync(string? mentorId, List<string> internIds)
        {       
            if(mentorId == null)
            {
                return await _context.BugsFeedbacks.AsNoTracking().
                    Where(i => internIds.Contains(i.ReporterId) && !i.IsDeleted)
                     .Include(f => f.Attachments.Where(a => a.IsDeleted == false)).ToListAsync();
            }
            return await _context.BugsFeedbacks.AsNoTracking()
                                .Where(i => i.ReportedToId != null && i.ReportedToId.Contains(mentorId) ||
                                 (i.ReportedToId != null && i.ReportedToId.Count == 0 && internIds.Contains(i.ReporterId)))
                                .Where(i => !i.IsDeleted)
                                .Include(f => f.Attachments.Where(a => a.IsDeleted == false))
                                .ToListAsync();
        }

        /// <summary>
        /// Retrieves the details of reporters (interns).
        /// </summary>
        /// <param name="internIds">The list of IDs of interns.</param>
        /// <returns>The list of reporter details.</returns>
        public async Task<List<ReporterInfoDTO>> GetReporterDetailsAsync(List<string> internIds)
        {
            return await _context.Intern
         .AsNoTracking()
         .Where(i => internIds.Contains(i.UserId))
         .Select(i => new ReporterInfoDTO
         {
             ReporterId = i.UserId,
             ReporterName = i.FirstName + " " + i.LastName,
             ReporterCareerPath = _context.CareerPaths
                                  .Where(cp => cp.Id == i.CareerPathId)
                                  .Select(cp => cp.Name)
                                  .FirstOrDefault(),
             ReporterEmail = i.Email,
            
         })
         .ToListAsync();
        }

        /// <summary>
        /// Retrieves the IDs of all interns associated with a mentor.
        /// </summary>
        /// <param name="mentorId">The ID of the mentor.</param>
        /// <returns>The list of intern IDs.</returns>
        public async Task<List<string>> GetAllInternsOfMentorAsync(string mentorId)
        {
            List<string> allMentorIds = await _context.Admin.AsNoTracking()
                          .Where(u => mentorId.Contains(u.UserId))
                          .Select(u => u.OrganizationId)
                          .Distinct()
                          .Join(
                           _context.Admin.AsNoTracking(),
                           outer => outer,
                           inner => inner.OrganizationId,
                          (outer, inner) => inner.UserId
                          )
                          .ToListAsync();
            List<string> allInternIds =await _context.Intern.AsNoTracking()
                                        .Where(i=>allMentorIds.Contains(i.CreatedBy))
                                        .Select(i=>i.UserId).ToListAsync();
            return allInternIds;

        }

        /// <summary>
        /// Retrieves the type of an admin user by user ID.
        /// </summary>
        /// <param name="userId">The ID of the admin user.</param>
        /// <returns>The type of the admin user.</returns>
        public async Task<string> GetAdminTypeAsync(string userId)
        {
            ApplicationUser User = await _userManager.FindByIdAsync(userId);
            return User.Type;
        }


        /// <summary>
        /// Retrieves details of all mentors in the organization asynchronously based on the provided mentor's ID.
        /// </summary>
        /// <param name="mentorId">The ID of the mentor whose organization's mentors need to be retrieved.</param>
        /// <returns>Returns a list of AdminList objects representing the details of mentors in the organization.</returns>
        public async Task<List<AdminList>> getAllMentorsInOrganizationAsync(string mentorId)
        {
            List<string> allMentorIds = await _context.Admin.AsNoTracking()
                        .Where(u => mentorId.Contains(u.UserId))
                        .Select(u => u.OrganizationId)
                        .Distinct()
                        .Join(
                         _context.Admin.AsNoTracking(),
                         outer => outer,
                         inner => inner.OrganizationId,
                        (outer, inner) => inner.UserId
                        )
                        .ToListAsync();
            List<AdminList> mentors = await _userManager.Users.AsNoTracking()
               .Where(u => allMentorIds.Contains(u.Id) && !u.isDeleted)
               .OrderBy(u => u.FirstName)
               .ThenBy(u => u.LastName)
               .Select(u => new AdminList
               {
                   Id = u.Id,
                   FirstName = u.FirstName,
                   LastName = u.LastName,
               })
               .ToListAsync();
            return mentors;
        }
    }
}
