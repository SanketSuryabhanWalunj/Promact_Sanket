
using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Assignments
{
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly ApplicationDbContext _context;

        public AssignmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves a list of assignments associated with a specific topic.
        /// </summary>
        /// <param name="topicId">The ID of the topic for which assignments are being retrieved.</param>
        /// <returns>
        /// Returns a list of assignments belonging to the specified topic.
        /// </returns>
        public async Task<List<Assignment>> GetAssignmentsAsync(string topicId)
        {
            return await _context.Assignments.Where(a => a.TopicId == topicId && a.IsDeleted == false).ToListAsync();
        }

        /// <summary>
        /// Retrieves an assignment by its ID.
        /// </summary>
        /// <param name="id">The ID of the assignment to retrieve.</param>
        /// <returns>
        /// Returns the assignment if found; otherwise, returns null.
        /// </returns>
        public async Task<Assignment?> GetAssignmentAsync(string id)
        {
            return await _context.Assignments.FirstOrDefaultAsync(a => a.Id == id && a.IsDeleted == false);
        }

        /// <summary>
        /// Adds a new assignment to the database.
        /// </summary>
        /// <param name="assignment">The assignment to add.</param>
        /// <returns>
        /// Returns the added assignment.
        /// </returns>
        public async Task<Assignment> AddAssignmentAsync(Assignment assignment)
        {
            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }

        /// <summary>
        /// Updates an existing assignment in the database.
        /// </summary>
        /// <param name="assignment">The assignment to update.</param>
        /// <returns>
        /// Returns the updated assignment.
        /// </returns>
        public async Task<Assignment> UpdateAssignmentAsync(Assignment assignment)
        {
            _context.Assignments.Update(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }

        /// <summary>
        /// Marks an assignment as deleted in the database.
        /// </summary>
        /// <param name="assignment">The assignment to mark as deleted.</param>
        /// <returns>
        /// Returns the deleted assignment.
        /// </returns>
        public async Task<Assignment> DeleteAssignmentAsync(Assignment assignment)
        {
            _context.Assignments.Update(assignment);
            await _context.SaveChangesAsync();
            return assignment;
        }

        /// <summary>
        /// Retrieves an assignment from the database by its ID.
        /// </summary>
        /// <param name="assignmentId">The ID of the assignment to retrieve.</param>
        /// <returns>
        /// Returns the assignment with the specified ID, if found; otherwise, returns null
        public async Task<Assignment> findAssignmentById(string assignmentId)
        {
            var findAssignment = await _context.Assignments.FirstOrDefaultAsync(a => a.Id == assignmentId);

            return findAssignment;
        }

        /// <summary>
        /// Retrieves a topic from the database by its ID.
        /// </summary>
        /// <param name="topicId">The ID of the topic to retrieve.</param>
        /// <returns>
        /// Returns the topic with the specified ID, if found; otherwise, returns null.
        /// </returns>
        public async Task<Topic> GetTopicIdFromAssignment(string topicId)
        {
            var findTopic=await _context.Topics.FirstOrDefaultAsync(t=> t.Id == topicId);

            return findTopic;
        }

        /// <summary>
        /// Retrieves a course from the database by its ID.
        /// </summary>
        /// <param name="courseId">The ID of the course to retrieve.</param>
        /// <returns>
        /// Returns the course with the specified ID, if found; otherwise, returns null.
        /// </returns>
        public async Task<Course> GetCourseIdFromTopic(string courseId)
        {
            var findCourse=await _context.Courses.FirstOrDefaultAsync(c=> c.Id == courseId);

            return findCourse;
        }

        /// <summary>
        /// Updates a topic in the database.
        /// </summary>
        /// <param name="findTopicId">The topic object containing the updated information.</param>
        /// <returns>
        /// Returns the updated topic object if the operation is successful.
        /// </returns>
        public async Task<Topic> UpdateTopicAsync(Topic findTopicId)
        {
             _context.Topics.Update(findTopicId);
            await _context.SaveChangesAsync();

            return findTopicId;
        }

        /// <summary>
        /// Updates a course in the database.
        /// </summary>
        /// <param name="findCourseId">The course object containing the updated information.</param>
        /// <returns>
        /// Returns the updated course object if the operation is successful.
        /// </returns>
        public async Task<Course> UpdateCourseAsync(Course findCourseId)
        {
            _context.Courses.Update(findCourseId);
            await _context.SaveChangesAsync();

            return findCourseId;
        }

        /// <summary>
        /// Deletes a submitted assignment from the database.
        /// </summary>
        /// <param name="assignmentSubmission">The submitted assignment object to be deleted.</param>
        /// <returns>
        /// Returns the deleted submitted assignment object if the operation is successful.
        /// </returns>
        public async Task<AssignmentSubmission> DeleteSubmittedAssignmentAsync(AssignmentSubmission assignmentSubmission)
        {
            _context.AssignmentSubmissions.Update(assignmentSubmission);
            await _context.SaveChangesAsync();
            return assignmentSubmission;
        }

        /// <summary>
        /// Retrieves an assignment submission from the database based on the InternshipId and SubmissionId.
        /// </summary>
        /// <param name="InternshipId">The InternshipId associated with the assignment submission.</param>
        /// <param name="SubmissionId">The SubmissionId of the assignment submission.</param>
        /// <returns>
        /// Returns the assignment submission object if found, otherwise returns null.
        /// </returns>
        public async Task<AssignmentSubmission> GetAssignmentSubmission(string InternshipId, string SubmissionId)
        {
            var findAssignment = await _context.AssignmentSubmissions.FirstOrDefaultAsync(t => t.Id == SubmissionId && t.InternshipId == InternshipId);
            return findAssignment;
        }
    }
}
