using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Course;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface ILessonService: IApplicationService
    {
        /// <summary>
        /// Method to get lesson by id.
        /// </summary>
        /// <param name="id">Id of the lesson.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>lesson details.</returns>
        Task<LessonDto> GetLessonByIdAsync(Guid id, string culture);

        /// <summary>
        /// Method to get current lesson with previous and next lesson.
        /// </summary>
        /// <param name="currentLessonId">Id of the current lesson.</param>
        /// <param name="examType">Current course exam type.</param>
        /// <param name="userId">User id .</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of lessons.</returns>
        Task<PreviousNextCourseDto> GetLessonWithPreviousNextbyIdAsync(Guid currentLessonId, string examType, Guid userId, string culture);

        /// <summary>
        /// Method to add lesson.
        /// </summary>
        /// <param name="lessonDto">Details of lesson.</param>
        /// <returns>Task.</returns>
        Task AddLessonAsync(AddLessonDto lessonDto);

        /// <summary>
        /// Method to update the lesson.
        /// </summary>
        /// <param name="lessonDto">Lesson details.</param>
        /// <returns>updated lesson details.</returns>
        Task<LessonDto> UpdateLessonAsync(ReqLessonDto lessonDto);

        /// <summary>
        /// Method to delete the lesson by id.
        /// </summary>
        /// <param name="id">Id of the lesson.</param>
        /// <returns>Task.</returns>
        Task DeleteLessonAsync(Guid id);

        /// <summary>
        /// Method to get the lesson list by module id.
        /// </summary>
        /// <param name="moduleId">Id of the module.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the lesson.</returns>
        Task<ICollection<LessonDto>> GetLessonsByModuleIdAsync(Guid moduleId, string culture);
    }
}
