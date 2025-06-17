using AITrainer.AITrainer.Core.Dto.AssignmentFeedbacks;
using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace AITrainer.AITrainer.Repository.AssignmentFeedbacks
{
    public class AssignmentFeedbackRepository : IAssignmentFeedbackRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public AssignmentFeedbackRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        /// <summary>
        /// Creates a new assignment feedback entry in the database.
        /// </summary>
        /// <param name="assignment">The assignment feedback object to be created.</param>
        /// <param name="assignmentId">The ID of the assignment associated with the feedback.</param>
        /// <returns>Returns the newly created assignment feedback object.</returns>
        public async Task<AssignmentFeedbackResponse> CreatedAsync(AssignmentFeedback assignment, string assignmentId)
        {
            await _context.AssignmentFeedbacks.AddAsync(assignment);

            await _context.SaveChangesAsync();

            var reviwer = await _userManager.FindByIdAsync(assignment.ReviewerId);

            var totalMarks = await _context.Assignments
                .Where(u => u.Id == assignmentId)
                .Select(u => u.Marks)
                .FirstOrDefaultAsync();

            var result = new AssignmentFeedbackResponse
            {
                Id = assignment.Id,
                ReviewerName = reviwer.FirstName,
                Feedback = assignment.Feedback,
                SubmitionId=assignment.SubmitedAssgnimentId,
                Score = assignment.Score,
                CreatedDate = assignment.CreatedDate,
                TotalMarks = totalMarks,
                IsPublished = assignment.IsPublished
            };

            return result;
        }

        /// <summary>
        /// Retrieves assignment feedback based on submission ID and assignment ID.
        /// </summary>
        /// <param name="id">The ID of the submission associated with the feedback.</param>
        /// <param name="assignmentId">The ID of the assignment associated with the feedback.</param>
        /// <returns>
        /// Returns the assignment feedback response if found; otherwise, returns null.
        /// </returns>
        public async Task<AssignmentFeedbackResponse> GetAssignmentFeedback(string id, string assignmentId)
        {
            var assignmetFeedback = await _context.AssignmentFeedbacks
                .Where(u => u.SubmitedAssgnimentId == id && u.IsDeleted==false)
                .FirstOrDefaultAsync();

            var totalMarks = await _context.Assignments
                .Where(u => u.Id == assignmentId)
                .Select(u => u.Marks)
                .FirstOrDefaultAsync();

            if(assignmetFeedback == null)
            {
                return null;
            }

            var reviwer = await _userManager.FindByIdAsync(assignmetFeedback.ReviewerId);

            var result = new AssignmentFeedbackResponse
            {
                Id = assignmetFeedback.Id,
                ReviewerName = reviwer.FirstName,
                Feedback = assignmetFeedback.Feedback,
                Score = assignmetFeedback.Score,
                CreatedDate = assignmetFeedback.CreatedDate,
                TotalMarks = totalMarks,
                IsPublished = assignmetFeedback.IsPublished
            };

            return result;
        }

        /// <summary>
        /// Updates assignment feedback based on the provided request and user ID.
        /// </summary>
        /// <param name="update">The request containing the updated feedback information.</param>
        /// <param name="userId">The ID of the user performing the update.</param>
        /// <returns>
        /// Returns the updated assignment feedback response if successful; otherwise, returns null.
        /// </returns>
        public async Task<AssignmentFeedbackResponse> UpdateAssignmentFeedback(UpdateAssignmentFeedbackRequest update, string userId)
        {
            var assignmentFeedback = await _context.AssignmentFeedbacks
                .FirstOrDefaultAsync(u => u.Id == update.Id);

            if(assignmentFeedback == null) 
            {
                return null;
            }

            assignmentFeedback.UpdatedDate = DateTime.UtcNow;
            assignmentFeedback.Feedback = update.Feedback;
            assignmentFeedback.Score = update.Score;
            assignmentFeedback.ReviewerId = userId;
            assignmentFeedback.UpdatedBy = userId;
            assignmentFeedback.CreatedBy = userId;
            assignmentFeedback.IsEdited = true;

             _context.AssignmentFeedbacks.Update(assignmentFeedback);
            await _context.SaveChangesAsync();

            var reviwer = await _userManager.FindByIdAsync(assignmentFeedback.ReviewerId);

            var totalMarks = await _context.Assignments
             .Where(u => u.Id == update.assignmentId)
             .Select(u => u.Marks)
             .FirstOrDefaultAsync();

            var result = new AssignmentFeedbackResponse
            {
                Id = assignmentFeedback.Id,
                ReviewerName = reviwer.FirstName,
                Feedback = assignmentFeedback.Feedback,
                Score = assignmentFeedback.Score,
                CreatedDate = assignmentFeedback.CreatedDate,
                TotalMarks = totalMarks,
                IsPublished = assignmentFeedback.IsPublished,
                IsEdited = true
            };
            return result;
        }

        /// <summary>
        /// Publishes assignment feedback with the specified feedback ID.
        /// </summary>
        /// <param name="feedbackId">The ID of the feedback to be published.</param>
        /// <returns>
        /// Returns true if the feedback is successfully published; otherwise, returns false.
        /// </returns>
        public async Task<bool> PublishFeedback (string feedbackId)
        {
            var assignmentFeedback = await _context.AssignmentFeedbacks
                    .FirstOrDefaultAsync(u => u.Id == feedbackId);

            if (assignmentFeedback == null)
            {
                return false;
            }
            assignmentFeedback.IsPublished = true;
            _context.AssignmentFeedbacks.Update(assignmentFeedback);
            await _context.SaveChangesAsync();
            return true;

        }

        /// <summary>
        /// Sets the GitHub link to "NA" and creates an entry in the AssignmentSubmission table.
        /// </summary>
        /// <param name="InternshipId">The ID of the internship related to the assignment submission.</param>
        /// <param name="AssignmentId">The ID of the assignment related to the submission.</param>
        /// <returns>
        /// Returns the ID of the created assignment submission.
        /// </returns>
        public async Task<string> setNullEntry(string InternshipId, string AssignmentId)
        {
            var TopicId = await _context.Assignments.Where(i => i.Id == AssignmentId && i.IsDeleted == false).Select(i => i.TopicId).FirstOrDefaultAsync();
            var assignmentsubmission = new AssignmentSubmission
            {
                Id = Guid.NewGuid().ToString(),
                InternshipId = InternshipId,
                TopicId = TopicId,
                AssignmentId = AssignmentId,
                GithubLink = "NA",
                SubmitedDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            await _context.AssignmentSubmissions.AddAsync(assignmentsubmission);
            await _context.SaveChangesAsync();

            return assignmentsubmission.Id;
        }


    }

}
