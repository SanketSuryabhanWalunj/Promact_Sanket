using LakePulse.Data;
using LakePulse.Models;
using LakePulse.Services.Subscription;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
    [Authorize]
    [Route("api/lakeSubscription")]
    [ApiController]
    public class LakeSubscriptionController : ControllerBase
    {
        private readonly ILakeSubscriptionService _lakeSubscriptionService;

        public LakeSubscriptionController(ILakeSubscriptionService lakeSubscriptionService)
        {
            _lakeSubscriptionService = lakeSubscriptionService;
        }

        /// <summary>
        /// Gets the subscription status of a user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The subscription status of the user.</returns>
        [HttpGet("user-subscription-status")]
        public async Task<ActionResult> GetUserSubscriptionStatusAsync([Required] string userId)
        {
            bool result = await _lakeSubscriptionService.GetLakeSubscriptionsStatusByUserIdAsync(userId);
            return Ok(result);
        }

        /// <summary>
        /// Gets the active subscription details of a user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The active subscription details of the user.</returns>
        [HttpGet("user-active-subscription")]
        public async Task<ActionResult> GetUserActiveSubscriptionDetailsAsync([Required] string userId)
        {
            LakeSubscription? activeSubscription = await _lakeSubscriptionService.GetUserActiveLakeSubscriptionDetailAsync(userId);
            if (activeSubscription == null)
            {
                return NotFound(StringConstant.NoActiveSubscription);
            }
            return Ok(activeSubscription);
        }

        /// <summary>
        /// Gets all subscriptions of a user by their user ID.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A list of subscriptions of the user.</returns>
        [HttpGet("user-subscriptions")]
        public async Task<ActionResult> GetUserSubscriptionsAsync([Required] string userId)
        {
            List<LakeSubscription> subscriptions = await _lakeSubscriptionService.GetUserLakeSubscriptionDetailsAsync(userId);
            return Ok(subscriptions);
        }

    }
}
