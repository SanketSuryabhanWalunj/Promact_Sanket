using LakePulse.Data;
using LakePulse.Models;
using Microsoft.EntityFrameworkCore;

namespace LakePulse.Services.Subscription
{
    public class LakeSubscriptionService : ILakeSubscriptionService
    {
        private readonly ApplicationDbContext _context;

        public LakeSubscriptionService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Checks if the user has any active lake subscriptions.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>True if the user has an active subscription, otherwise false.</returns>
        public async Task<bool> GetLakeSubscriptionsStatusByUserIdAsync(string userId)
        {
            try
            {
                LakeSubscription? userSubscriptions = await _context.LakeSubscriptions.FirstOrDefaultAsync(x => x.UserId == userId && x.SubscriptionEndDate >= (DateTime.UtcNow));
                return userSubscriptions != null;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        /// <summary>
        /// Gets the active lake subscription details for a specific user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the active lake subscription details.</returns>
        public async Task<LakeSubscription?> GetUserActiveLakeSubscriptionDetailAsync(string userId)
        {
            try
            {
                LakeSubscription? userSubscriptions = await _context.LakeSubscriptions.FirstOrDefaultAsync(x => x.UserId == userId && x.SubscriptionEndDate >= (DateTime.UtcNow));
                return userSubscriptions;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// Gets all lake subscription details for a specific user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of lake subscription details.</returns>
        public async Task<List<LakeSubscription>> GetUserLakeSubscriptionDetailsAsync(string userId)
        {
            try
            {
                List<LakeSubscription> userSubscriptions = await _context.LakeSubscriptions.Where(x => x.UserId == userId).ToListAsync();
                return userSubscriptions;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

    }
}
