using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.MentorDashboard
{
    public class MentorDashboardRepository : IMentorDashboardRepository
    {
        #region Dependencies
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        #endregion
        #region Constructors
        public MentorDashboardRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager) 
        {
            _context = context;
            _userManager = userManager;
        }
        #endregion
        #region Public methods
       /// <summary>
       /// Retrieves the list of batches to which the mentors is assigned with
       /// </summary>
       /// <param name="userId"></param>
       /// <returns>A list of batches</returns>
        public async Task<List<Batch>> GetMentorBatches(string userId)
        {
            var organiztionId = await _context.Admin.Where(u => u.UserId == userId).Select(u => u.OrganizationId).FirstOrDefaultAsync();

            var user = await _context.Admin.Where(u => u.OrganizationId == organiztionId).Select(u => u.UserId).ToListAsync();

            var batches = await _context.Batch.Where(u => u.IsDeleted == false && user.Contains(u.CreatedBy)).OrderByDescending(u => u.CreatedDate)
                .ToListAsync();

            return batches;

        }

        /// <summary>
        /// Retrieves details of mentors based on provided course IDs.
        /// </summary>
        /// <param name="courseIds">List of course IDs for filtering mentors.</param>
        /// <returns>A list of ApplicationUser objects containing mentor details.</returns>
        public async Task<List<ApplicationUser>> GetMentorDetails(List<string> courseIds, string? BatchId)
        {
            IQueryable<Internship> internshipsQuery = _context.Internship
                .Where(i => courseIds.Contains(i.CourseId));

            if (BatchId != null)
            {
                var interns = await _context.Intern
                    .Where(i => i.IsDeleted == false && i.BatchId == BatchId)
                    .Select(i => i.Id)
                    .ToListAsync();

                internshipsQuery = internshipsQuery.Where(i => interns.Contains(i.InternId));
            }

            var mentorIds = await internshipsQuery
                .Select(i => i.MentorId)
                .ToListAsync();

            var uniqueMentorIds = mentorIds.SelectMany(ids => ids.Split(','))
                .Distinct()
                .ToList();

            var users = await _userManager.Users.Where(u => uniqueMentorIds.Contains(u.Id)).ToListAsync();

            return users;
        }
        /// <summary>
        /// Retrieves all the Internships in the batch
        /// </summary>
        /// <param name="batchId"></param>
        /// <returns>A list of internships</returns>
      
        public async Task<List<Internship>> GetAllBatchInternship(string batchId)
        {
            List<string> internIds = await _context.Intern
                .Where(i => i.BatchId == batchId && !i.IsDeleted)
                .Select(i => i.Id)
                .ToListAsync();

            List<Internship> internships = await _context.Internship
             .Where(i => internIds.Contains(i.InternId) && !(i.isDismissed ?? false))
                .ToListAsync();

            return internships;
        }
        /// <summary>
        /// Retrieves the course that is assigned to the internship
        /// </summary>
        /// <param name="internshipId"></param>
        /// <returns>A course that is assigned to the internship</returns>
        public async Task<Course> GetCourse(string internshipId)
        {
            var internship = await _context.Internship.Where(i => i.Id == internshipId && i.isDismissed == false).FirstOrDefaultAsync();
            var course = await _context.Courses.Where(i => i.Id == internship.CourseId && i.IsDeleted == false).FirstOrDefaultAsync();
            return course;
        }

        /// <summary>
        /// Retrieves all existing courses.
        /// </summary>
        /// <returns>A list of Course objects representing existing courses.</returns>
        public async Task<List<Course>> GetAllCourses(string userId)
        {
            var organiztionId = await _context.Admin.Where(u => u.UserId == userId).Select(u => u.OrganizationId).FirstOrDefaultAsync();

            var user = await _context.Admin.Where(u => u.OrganizationId == organiztionId).Select(u => u.UserId).ToListAsync();

            return await _context.Courses.Where(c => !c.IsDeleted && user.Contains(c.CreatedBy)).OrderBy(c => c.Name).ToListAsync();

        }

        /// <summary>
        /// Retrieves the first name of the user based on their ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The first name of the user.</returns>
        public async Task<string> GetUserName(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return user.FirstName;
        }

        /// <summary>
        /// Retrieves active internships based on a list of course IDs.
        /// </summary>
        /// <param name="courseId">The list of course IDs.</param>
        /// <returns>A list of active internships.</returns>
        public async Task<List<Internship>> GetInternshipsByCourseAsync(List<string> courseId)
        {
            return await _context.Internship.Where(i => courseId.Contains(i.CourseId) && i.isDismissed != true).ToListAsync();
        }

        /// <summary>
        /// Retrieves all active internships.
        /// </summary>
        /// <returns>A list of active internships.</returns>
        public async Task<List<Internship>> GetActiveInternshipsAsync()
        {
            return await _context.Internship.Where(i => i.isDismissed != true).ToListAsync();
        }

        /// <summary>
        /// Retrieves all active interns.
        /// </summary>
        /// <returns>A list of active interns.</returns>
        public async Task<List<Intern>> GetActiveInternsAsync()
        {
            return await _context.Intern
                .Where(i => !i.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active courses.
        /// </summary>
        /// <returns>A list of active courses.</returns>
        public async Task<List<Course>> GetActiveCoursesAsync()
        {
            return await _context.Courses
                .Where(c => !c.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active topics.
        /// </summary>
        /// <returns>A list of active topics.</returns>
        public async Task<List<Topic>> GetActiveTopicsAsync()
        {
            return await _context.Topics
                .Where(t => !t.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active assignments.
        /// </summary>
        /// <returns>A list of active assignments.</returns>
        public async Task<List<Assignment>> GetActiveAssignmentsAsync()
        {
            return await _context.Assignments
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active assignment submissions.
        /// </summary>
        /// <returns>A list of active assignment submissions.</returns>
        public async Task<List<AssignmentSubmission>> GetActiveAssignmentSubmissionsAsync()
        {
            return await _context.AssignmentSubmissions
                .Where(s => !s.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active journals.
        /// </summary>
        /// <returns>A list of active journals.</returns>
        public async Task<List<Journal>> GetActiveJournalsAsync()
        {
            return await _context.Journals
                .Where(j => !j.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active assignment feedbacks.
        /// </summary>
        /// <returns>A list of active assignment feedbacks.</returns>
        public async Task<List<AssignmentFeedback>> GetActiveAssignmentFeedbacksAsync()
        {
            return await _context.AssignmentFeedbacks
                .Where(f => !f.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all active journal feedbacks.
        /// </summary>
        /// <returns>A list of active journal feedbacks.</returns>
        public async Task<List<JournalFeedback>> GetActiveJournalFeedbacksAsync()
        {
            return await _context.JournalFeedbacks
                .Where(f => !f.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a list of ApplicationUser objects representing mentors within the same organization as the specified user. 
        /// It identifies the organization of the given user by their userId, then finds all users (mentors) associated with that organization.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose organization is used to find other users (mentors) within the same organization.</param>
        /// <returns>A list of ApplicationUser objects representing the mentors within the same organization as the specified user.</returns>
        public async Task<List<ApplicationUser>> GetMentorList(string userId)
        {
            var organiztionId = await _context.Admin.Where(u => u.UserId == userId).Select(u => u.OrganizationId).FirstOrDefaultAsync();

            var user = await _context.Admin.Where(u => u.OrganizationId == organiztionId).Select(u => u.UserId).ToListAsync();
            var users = await _userManager.Users.Where(u => user.Contains(u.Id)).ToListAsync();
            return users;

        }

        /// <summary>
        /// Retrieves the Batch associated with the specified Internship.
        /// </summary>
        /// <param name="internship">The Internship object for which to retrieve the associated Batch.</param>
        /// <returns>The Batch associated with the specified Internship, or null if not found.</returns>
        public async Task<Batch> GetBatchIdAsync(Internship internship)
        {
            var intern = await _context.Intern
                .FirstOrDefaultAsync(i => i.Id == internship.InternId && !i.IsDeleted);

            if (intern == null)
                return null;

            var batch = await _context.Batch
                .FirstOrDefaultAsync(b => b.Id == intern.BatchId);

            return batch;
        }


        #endregion
    }
}
