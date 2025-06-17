using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Permissions;
using Volo.Abp;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Admin, Super Admin")]
    public class ContentService: ApplicationService, IContentService
    {
        private readonly ContentDomainService _contentDomainService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;

        public ContentService(ContentDomainService contentDomainService, IStringLocalizer<VirtaulAidResource> localizer)
        {
            _contentDomainService = contentDomainService;
            _localizer = localizer;
        }

        /// <summary>
        /// Method to add content.
        /// </summary>
        /// <param name="contentDetails">Details of content.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task AddContentAsync(AddContentDto contentDtoDetails)
        {
            var contentDetails = ObjectMapper.Map<AddContentDto, Content>(contentDtoDetails);
            await _contentDomainService.AddContentAsync(contentDetails);
        }

        /// <summary>
        /// Method to delete the content by id.
        /// </summary>
        /// <param name="id">Id of the content.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task DeleteContentAsync(Guid id)
        {
            await _contentDomainService.DeleteContentAsync(id);
        }

        /// <summary>
        /// Method to get content by id.
        /// </summary>
        /// <param name="id">Id of the content.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>content details.</returns>
        [Authorize]
        public async Task<ContentDto> GetContentByIdAsync(Guid id, string culture)
        {
            ContentDto contentDto = await _contentDomainService.GetContentByIdAsync(id, culture);
            return contentDto;
        }

        /// <summary>
        /// Method to get the content list by lesson id.
        /// </summary>
        /// <param name="lessonId">Id of the lesson.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the content.</returns>
        [Authorize]
        public async Task<ICollection<ContentDto>> GetContentsByLessonIdAsync(Guid lessonId, string culture)
        {
            ICollection<ContentDto> contentDtoList = await _contentDomainService.GetContentsByLessonIdAsync(lessonId, culture);
            return contentDtoList;
        }

        /// <summary>
        /// Method to update the content.
        /// </summary>
        /// <param name="contentDetails">Content details.</param>
        /// <returns>updated content details.</returns>
        [Authorize]
        public async Task<ContentDto> UpdateContentAsync(ContentDto contentDetail)
        {
            if (contentDetail == null)
            {
                throw new UserFriendlyException(_localizer["ContentNull"], StatusCodes.Status403Forbidden.ToString());
            }
            var contentToBeUpdate = ObjectMapper.Map<ContentDto, Content>(contentDetail);
            var contentUpdated = await _contentDomainService.UpdateContentAsync(contentToBeUpdate);
            var contentUpdatedDto = ObjectMapper.Map<Content, ContentDto>(contentUpdated);
            return contentUpdatedDto;
        }
    }
}
