using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Assignments
{
    /// <summary>
    /// Interface for managing assignments in the AITrainer application.
    /// </summary>
    public interface IAssignmentRepository
    {
        /// <summary>
        /// Adds a new assignment to the repository asynchronously.
        /// </summary>
        /// <param name="assignment">The assignment to add.</param>
        /// <returns>A newly added assignment.</returns>
        Task<Assignment> AddAssignmentAsync(Assignment assignment);

        /// <summary>
        /// Soft Delete an assignment from the repository asynchronously.
        /// </summary>
        /// <param name="assignment">The assignment to delete.</param>
        /// <returns>The deleted assignment.</returns>
        Task<Assignment> DeleteAssignmentAsync(Assignment assignment);

        /// <summary>
        /// Retrieves an assignment from the repository asynchronously using its ID.
        /// </summary>
        /// <param name="id">The ID of the assignment to retrieve.</param>
        /// <returns>The retrieved assignment.</returns>
        Task<Assignment?> GetAssignmentAsync(string id);

        /// <summary>
        /// Retrieves a list of assignments from the repository asynchronously using the topic ID.
        /// </summary>
        /// <param name="topicId">The ID of the topic.</param>
        /// <returns>A list of assignments for the topic.</returns>
        Task<List<Assignment>> GetAssignmentsAsync(string topicId);

        /// <summary>
        /// Updates an assignment in the repository asynchronously.
        /// </summary>
        /// <param name="assignment">The assignment to update.</param>
        /// <returns>The updated assignment.</returns>
        Task<Assignment> UpdateAssignmentAsync(Assignment assignment);
        Task<Assignment> findAssignmentById(string assignmentId);
        Task<Topic> GetTopicIdFromAssignment(string topicId);
        Task<Course> GetCourseIdFromTopic(string courseId);
        Task<Topic> UpdateTopicAsync(Topic findTopicId);
        Task<Course> UpdateCourseAsync(Course findCourseId);
        Task<AssignmentSubmission> DeleteSubmittedAssignmentAsync(AssignmentSubmission assignmentSubmission);
        Task<AssignmentSubmission> GetAssignmentSubmission(string InternshipId, string SubmissionId);


    }
}