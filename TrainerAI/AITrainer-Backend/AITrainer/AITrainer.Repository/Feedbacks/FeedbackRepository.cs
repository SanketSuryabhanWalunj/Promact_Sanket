using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.DomainModel;
using Microsoft.AspNetCore.Identity;
using AITrainer.AITrainer.Core.Dto.Internship;
using Microsoft.EntityFrameworkCore;
using AITrainer.AITrainer.Core.Dto.Feedback;
using MySqlX.XDevAPI.Common;

namespace AITrainer.AITrainer.Repository.Feedbacks
{
    public class FeedbackRepository : IFeedbackRepository
    {
        #region Dependencies
        private readonly ApplicationDbContext _dbContext;
        #endregion

        #region Constructors
        public FeedbackRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        #endregion

        #region Public methods

        /// <summary>
        /// Retrieves feedback of all interns in the batch
        /// </summary>
        /// <param name="internIds"></param>
        /// <returns> Retrieves feedback of all interns in the batch</returns>
        public async Task<List<Feedback>> GetFeedbackDetails(List<string> internIds)
        {
            List<OverallFeedback> overallFeedback = _dbContext.OverallFeedbacks
                                         .Where(f => internIds.Contains(f.InternId) && !f.IsDeleted)
                                         .OrderBy(f => f.CreatedDate)
                                         .ToList();
            List<Feedback> feedbackDetails = _dbContext.Internship
                .Where(internship => internIds.Contains(internship.InternId) && internship.isDismissed == false)
                .Join(
                    _dbContext.Intern,
                    internship => internship.InternId,
                    intern => intern.Id,
                    (internship, intern) => new { Internship = internship, Intern = intern }
                )
                .Join(
                    _dbContext.Courses,
                    combined => combined.Internship.CourseId,
                    course => course.Id,
                    (combined, course) => new { combined.Intern, combined.Internship, combined.Intern.CareerPathId, CourseName = course.Name }
                )
                .GroupBy(
                    x => new { x.Intern.Id, x.Intern.FirstName, x.Intern.LastName, x.Intern.Email, x.Intern.CareerPathId},
                    (key, grouped) => new
                    {
                        Intern = key,
                        Courses = grouped.Select(x => x.CourseName).ToList()
                    }
                )
                .Select(result => new Feedback
                {
                    Id = result.Intern.Id,
                    Name = result.Intern.FirstName + " " + result.Intern.LastName,
                    EmailId = result.Intern.Email,
                    CareerPath = _dbContext.CareerPaths.Where(i => i.Id == result.Intern.CareerPathId).Select( i => i.Name).FirstOrDefault(),
                    Courses = string.Join(", ", result.Courses),
                    OverallFeedback = _dbContext.OverallFeedbacks.OrderByDescending(f => f.CreatedDate)
                                        .FirstOrDefault(f => f.InternId == result.Intern.Id && internIds.Contains(f.InternId) && !f.IsDeleted)

                })
                .ToList();

            return feedbackDetails;
        }
        /// <summary>
        /// Retrieves the intern ID associated with the given user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern.</param>
        /// <returns>
        /// Returns the intern ID if found, otherwise returns null.
        /// </returns>
        public async Task<string> GetInternId(string userId)
        {
            string internId = await _dbContext.Intern.Where(f => f.UserId == userId && !f.IsDeleted).Select(i => i.Id).FirstOrDefaultAsync();
            return internId;
        }

        /// <summary>
        /// Retrieves overall feedback for an intern based on their intern ID.
        /// </summary>
        /// <param name="internId">The intern ID.</param>
        /// <returns>
        /// Returns a list of overall feedbacks for the intern if found and published, otherwise returns an empty list.
        /// </returns>
        public async Task<List<OverallFeedback>> GetOverAllFeedbackbyInternId(string internId)
        {
            List<OverallFeedback> feedbacks = await _dbContext.OverallFeedbacks.Where(f => f.InternId.Equals(internId) && !f.IsDeleted && f.IsPublished).OrderBy(i => i.CreatedDate).ToListAsync();
            return feedbacks;
        }

            /// <summary>
            /// Creates overall feedback for a specific intern based on the provided feedback data.
            /// </summary>
            /// <param name="overallFeedback">The data representing the overall feedback for the intern.</param>
            /// <param name="internId">The unique identifier of the intern for whom the feedback is created.</param>
            /// <param name="userId">The unique identifier of the user creating the feedback.</param>
            /// <returns>
            /// An asynchronous task representing the creation of overall feedback.
            /// Upon successful creation, returns the created overall feedback object.
            /// </returns>
            public async Task<OverallFeedback> CreateOverallFeedback(OverallFeedback feedback, string internId, string userId, string userName)
        {
            
            await _dbContext.OverallFeedbacks.AddAsync(feedback);
            await _dbContext.SaveChangesAsync();
            return feedback;
        }

        /// <summary>
        /// Updates the overall feedback based on the provided feedback data and user information.
        /// </summary>
        /// <param name="overallFeedback">The data representing the updated overall feedback.</param>
        /// <param name="userId">The unique identifier of the user performing the update.</param>
        /// <param name="userName">The name of the user performing the update.</param>
        /// <returns>
        /// Upon successful update, returns the updated overall feedback object.
        /// </returns>
        public async Task<OverallFeedback> UpdateOverallFeedback(UpdateOverallFeedbackDTO overallFeedback, string userId, string userName)
        {
            OverallFeedback feedback = await _dbContext.OverallFeedbacks.AsNoTracking().FirstAsync(i => i.Id == overallFeedback.Id);
            feedback.BehaviourPerformance = overallFeedback.BehaviourPerformance;
            feedback.TechnicalPerformance = overallFeedback.TechnicalPerformance;
            feedback.RightFit = overallFeedback.RightFit;
            feedback.DetailedFeedback = overallFeedback.DetailedFeedback;
            feedback.UpdatedDate = DateTime.UtcNow;
            feedback.UpdatedById = userId;
            feedback.UpdatedByName = userName;

            _dbContext.OverallFeedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
            return feedback;
        }

        /// <summary>
        /// Retrieves the previous feedbacks given for a specific intern.
        /// </summary>
        /// <param name="internId">The unique identifier of the intern for whom to retrieve previous feedbacks.</param>
        /// <returns>
        /// Upon successful retrieval, returns a list of previous feedbacks for the intern.
        /// </returns>
        public async Task<List<OverallFeedback>> GetPreviousFeedbacks(string internId)
        {
            List<OverallFeedback> feedback = await _dbContext.OverallFeedbacks.AsNoTracking().Where(i => i.InternId == internId).OrderByDescending(f => f.CreatedDate).ToListAsync();
            return feedback;
        }

        /// <summary>
        /// Publishes the feedback with the specified ID.
        /// </summary>
        /// <param name="feedbackId">The unique identifier of the feedback to be published.</param>
        /// <param name="userId">The unique identifier of the user performing the publish action.</param>
        /// <param name="userName">The name of the user performing the publish action.</param>
        /// <returns>
        /// Upon successful publishing, returns the published feedback object.
        /// </returns>
        public async Task<OverallFeedback> PublishFeedback(string feedbackId, string userId, string userName)
        {
            OverallFeedback feedback = await _dbContext.OverallFeedbacks.AsNoTracking().FirstOrDefaultAsync(i => i.Id == feedbackId);
            feedback.IsPublished = true;
            feedback.UpdatedDate = DateTime.UtcNow;
            feedback.UpdatedById = userId;
            feedback.UpdatedByName = userName;

            _dbContext.OverallFeedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
            return feedback;
        }

        /// <summary>
        /// Retrieves overall feedback for the provided list of intern IDs asynchronously, 
        /// groups the feedback by intern ID, and returns it as a dictionary.
        /// </summary>
        /// <param name="internIds">The list of intern IDs for which to retrieve feedback.</param>
        /// <returns>
        /// A task representing the asynchronous operation, which upon completion returns a dictionary. 
        /// The keys of the dictionary represent intern IDs, and the corresponding values are lists of OverallFeedback objects.
        /// </returns>
        public async Task<Dictionary<string, List<OverallFeedback>>> GetAllOverallFeedbacks(List<string> internIds)
        {
            List<OverallFeedback> feedbacks = await _dbContext.OverallFeedbacks
                .AsNoTracking()
                .Where(i => internIds.Contains(i.InternId) && !i.IsDeleted)
                .OrderByDescending(f => f.CreatedDate)
                .ToListAsync();

            Dictionary<string, List<OverallFeedback>> groupedFeedbacks = feedbacks.GroupBy(f => f.InternId)
                                                                                    .ToDictionary(g => g.Key, g => g.ToList());
            
            return groupedFeedbacks;
        }
        /// <summary>
        /// Publishes all provided feedbacks by updating their properties and saving changes to the database.
        /// </summary>
        /// <param name="feedbacks">The list of feedbacks to publish.</param>
        /// <returns>
        /// An integer representing the number of entities written to the database.
        /// </returns>
        public async Task<int> PublishAllFeedbacksAsync(List<OverallFeedback> feedbacks)
        {
            _dbContext.OverallFeedbacks.UpdateRange(feedbacks);
            int IsSuccessful = await _dbContext.SaveChangesAsync();
            return IsSuccessful;
        }

        #endregion

    }
}
