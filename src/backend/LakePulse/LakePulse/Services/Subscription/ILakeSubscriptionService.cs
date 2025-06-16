using LakePulse.Models;

namespace LakePulse.Services.Subscription
{
    public interface ILakeSubscriptionService
    {
        /// <summary>
        /// Gets the subscription status of lakes for a specific user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a boolean indicating the subscription status.</returns>
        Task<bool> GetLakeSubscriptionsStatusByUserIdAsync(string userId);

        /// <summary>
        /// Gets the active lake subscription details for a specific user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the active lake subscription details.</returns>
        Task<LakeSubscription?> GetUserActiveLakeSubscriptionDetailAsync(string userId);

        /// <summary>
        /// Gets all lake subscription details for a specific user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of lake subscription details.</returns>
        Task<List<LakeSubscription>> GetUserLakeSubscriptionDetailsAsync(string userId);
    }
}
