using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Feedback;
using Volo.Abp.Application.Services;


namespace VirtaulAid.Interfaces
{
    public interface IFeedbackService : IApplicationService
    {
        /// <summary>
        /// Method to add feedback
        /// </summary>
        /// <param name="req">feedback object</param>
        /// <returns>feedback object</returns>
        /// <exception cref="UserFriendlyException">throws exception when feedback provider details does not exist</exception>
        Task<ResFeedbackDto> AddFeedback(ReqAddFeedbackDto req, string culture);
    }
}
