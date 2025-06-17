using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Feedbacks
{
    public interface IFeedbackRepository
    {
        /// <summary>
        /// Retrieves the detailed feedback for a list of interns identified by their unique intern IDs.
        /// </summary>
        /// <param name="internIds">The list of unique identifiers of interns for whom feedback details are requested.</param>
        /// <returns>
        /// Upon successful retrieval, returns a list of feedback objects corresponding to the provided intern IDs.
        /// </returns>
        Task<List<Feedback>> GetFeedbackDetails(List<string> internIds);
        /// <summary>
        /// Creates overall feedback for a specific intern based on the provided feedback data.
        /// </summary>
        /// <param name="overallFeedback">The data representing the overall feedback for the intern.</param>
        /// <param name="internId">The unique identifier of the intern for whom the feedback is created.</param>
        /// <param name="userId">The unique identifier of the user creating the feedback.</param>
        /// <returns>
        /// Upon successful creation, returns the created overall feedback object.
        /// </returns>
        Task<OverallFeedback> CreateOverallFeedback(OverallFeedback overallFeedback, string internId, string userId, string userName);
        /// <summary>
        /// Updates the overall feedback for a specific intern.
        /// </summary>
        /// <param name="overallFeedback">The updated data representing the overall feedback for the intern.</param>
        /// <param name="userId">The unique identifier of the user updating the feedback.</param>
        /// <param name="userName">The name of the user updating the feedback.</param>
        /// <returns>
        /// Upon successful update, returns the updated overall feedback object.
        /// </returns>
        Task<OverallFeedback> UpdateOverallFeedback(UpdateOverallFeedbackDTO overallFeedback, string userId,string userName);
        /// <summary>
        /// Retrieves a list of previous feedbacks provided for a specific intern.
        /// </summary>
        /// <param name="internId">The unique identifier of the intern for whom previous feedbacks are requested.</param>
        /// <returns>
        /// Upon successful retrieval, returns a list of previous feedback objects for the specified intern.
        /// </returns>
        Task<List<OverallFeedback>> GetPreviousFeedbacks(string internId);
        /// <summary>
        /// Publishes the feedback for a specific intern, making it available for review.
        /// </summary>
        /// <param name="feedbackId">The unique identifier of the feedback to be published.</param>
        /// <param name="userId">The unique identifier of the user publishing the feedback.</param>
        /// <param name="userName">The name of the user publishing the feedback.</param>
        /// <returns>
        /// Upon successful publishing, returns the published feedback object.
        /// </returns>
        Task<OverallFeedback> PublishFeedback(string feedbackId, string userId, string userName);
        /// <summary>
        /// Asynchronously retrieves the intern ID associated with the given user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. The task result is the intern ID if found, otherwise null.
        /// </returns>
        Task<string> GetInternId(string userId);
        /// <summary>
        /// Asynchronously retrieves overall feedback for an intern based on their intern ID.
        /// </summary>
        /// <param name="internId">The intern ID.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. The task result is a list of overall feedbacks for the intern if found and published, otherwise an empty list.
        /// </returns>
        Task<List<OverallFeedback>> GetOverAllFeedbackbyInternId(string internId);
        /// <summary>
        /// Retrieves overall feedback for the provided list of intern IDs asynchronously, 
        /// grouped by intern ID and returned as a dictionary.
        /// </summary>
        /// <param name="internIds">The list of intern IDs for which to retrieve feedback.</param>
        /// <returns>
        /// A task representing the asynchronous operation, which upon completion returns a dictionary. 
        /// The keys of the dictionary represent intern IDs, and the corresponding values are lists of OverallFeedback objects.
        /// </returns>
        Task<Dictionary<string, List<OverallFeedback>>> GetAllOverallFeedbacks(List<string> internIds);
        /// <summary>
        /// Publishes all provided feedbacks by updating their properties and saving changes to the database asynchronously.
        /// </summary>
        /// <param name="feedbacks">The list of feedbacks to publish.</param>
        /// <returns>
        /// A task representing the asynchronous operation, which upon completion returns an integer representing the 
        /// number of entities written to the database.
        /// </returns>
        Task<int> PublishAllFeedbacksAsync(List<OverallFeedback> feedbacks);
    }
}
