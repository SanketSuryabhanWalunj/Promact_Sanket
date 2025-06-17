using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel.Models;
using System.Drawing;

namespace AITrainer.Services.Feedbacks
{
    public interface IFeedbackService
    {
        /// <summary>
        /// Retrieves the required overall feedback information for a batch of interns based on the provided internship IDs, intern information, batch name, and user ID.
        /// </summary>
        /// <param name="internshipIds">The list of unique identifiers of internships for which overall feedback information is requested.</param>
        /// <param name="internInfo">The information about the intern.</param>
        /// <param name="batchName">The name of the batch associated with the interns (optional).</param>
        /// <param name="userId">The unique identifier of the user requesting the overall feedback information.</param>
        /// <returns>
        /// Upon successful retrieval, returns the batchwise internship information object containing the required overall feedback.
        /// </returns>
        Task<BatchwiseInternshipInfo> GetRequiredOverallFeedback(List<string> internshipIds, Intern internInfo, string? batchName, string userId);
        /// <summary>
        /// Generates overall feedback for a specific intern based on the provided feedback list, intern ID, and user ID.
        /// </summary>
        /// <param name="feedbackList">The list of feedback items contributing to the overall feedback.</param>
        /// <param name="internId">The unique identifier of the intern for whom the overall feedback is generated.</param>
        /// <param name="userId">The unique identifier of the user generating the overall feedback.</param>
        /// <returns>
        /// Upon successful generation, returns the created overall feedback object.
        /// </returns>
        Task<OverallFeedback> OverallFeedback(List<InternOverallFeedback> feedbackList, string internId, string userId);
        /// <summary>
        /// Publishes feedback for all interns with the latest feedback marked as published.
        /// </summary>
        /// <param name="internIds">The list of intern IDs for which feedback is to be published.</param>
        /// <param name="userId">The ID of the user initiating the publishing operation.</param>
        /// <param name="userName">The name of the user initiating the publishing operation.</param>
        /// <returns>
        /// A list of OverallFeedback objects representing the published feedback if successful; otherwise, null.
        /// </returns>
        Task<List<OverallFeedback>> PublishAllFeedbacksAsync(List<string> internIds,string userId, string userName);
    }
}
