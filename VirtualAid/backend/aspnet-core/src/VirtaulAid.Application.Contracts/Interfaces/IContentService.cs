using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Course;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface IContentService: IApplicationService
    {
        /// <summary>
        /// Method to get content by id.
        /// </summary>
        /// <param name="id">Id of the content.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>content details.</returns>
        Task<ContentDto> GetContentByIdAsync(Guid id, string culture);

        /// <summary>
        /// Method to add content.
        /// </summary>
        /// <param name="contentDtoDetails">Details of content.</param>
        /// <returns>Task.</returns>
        Task AddContentAsync(AddContentDto contentDtoDetails);

        /// <summary>
        /// Method to update the content.
        /// </summary>
        /// <param name="contentDetail">Content details.</param>
        /// <returns>updated content details.</returns>
        Task<ContentDto> UpdateContentAsync(ContentDto contentDetail);

        /// <summary>
        /// Method to delete the content by id.
        /// </summary>
        /// <param name="id">Id of the content.</param>
        /// <returns>Task.</returns>
        Task DeleteContentAsync(Guid id);

        /// <summary>
        /// Method to get the content list by lesson id.
        /// </summary>
        /// <param name="lessonId">Id of the lesson.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the content.</returns>
        Task<ICollection<ContentDto>> GetContentsByLessonIdAsync(Guid lessonId, string culture);
    }
}
