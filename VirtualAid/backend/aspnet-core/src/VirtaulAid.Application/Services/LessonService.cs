using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Interfaces;
using VirtaulAid.Permissions;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Company, Individual, Admin, Super Admin")]
    public class LessonService : ApplicationService, ILessonService
    {
        private readonly LessonDomainService _lessonDomainService;

        public LessonService(LessonDomainService lessonDomainService)
        {
            _lessonDomainService = lessonDomainService;
        }

        /// <summary>
        /// Method to add lesson.
        /// </summary>
        /// <param name="lessonDto">Details of lesson.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task AddLessonAsync(AddLessonDto lessonDto)
        {
            var lesson = ObjectMapper.Map<AddLessonDto, Lesson>(lessonDto);
            await _lessonDomainService.AddLessonAsync(lesson);
        }

        /// <summary>
        /// Method to delete the lesson by id.
        /// </summary>
        /// <param name="id">Id of the lesson.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task DeleteLessonAsync(Guid id)
        {
            await _lessonDomainService.DeleteLessonById(id);
        }

        /// <summary>
        /// Method to get the lesson list by module id.
        /// </summary>
        /// <param name="moduleId">Id of the module.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the lesson.</returns>
        [Authorize]
        public async Task<ICollection<LessonDto>> GetLessonsByModuleIdAsync(Guid moduleId, string culture)
        {
            ICollection<LessonDto> lessonList = await _lessonDomainService.GetLessonsByModuleId(moduleId, culture);
            return lessonList;
        }

        /// <summary>
        /// Method to get lesson by id.
        /// </summary>
        /// <param name="id">Id of the lesson.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>lesson details.</returns>
        [Authorize]
        public async Task<LessonDto> GetLessonByIdAsync(Guid id, string culture)
        {
            LessonDto lessonDto = await _lessonDomainService.GetLessonbyId(id, culture);
            return lessonDto;
        }


        /// <summary>
        /// Method to get current lesson with previous and next lesson.
        /// </summary>
        /// <param name="currentLessonId">Id of the current lesson.</param>
        /// <param name="examType">Current course exam type.</param>
        /// <param name="userId">User id .</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of lessons.</returns>
        [Authorize]
        public async Task<PreviousNextCourseDto> GetLessonWithPreviousNextbyIdAsync(Guid currentLessonId, string examType, Guid userId, string culture)
        {
            PreviousNextCourseDto lessonDtoList = await _lessonDomainService.GetLessonWithPreviousNextbyIdAsync(currentLessonId, examType, userId, culture);
            return lessonDtoList;
        }

        /// <summary>
        /// Method to update the lesson.
        /// </summary>
        /// <param name="lessonDto">Lesson details.</param>
        /// <returns>updated lesson details.</returns>
        [Authorize]
        public async Task<LessonDto> UpdateLessonAsync(ReqLessonDto lessonDto)
        {
            var lessonDetails = ObjectMapper.Map<ReqLessonDto, Lesson>(lessonDto);
            var lesson = await _lessonDomainService.UpdateLessonAsync(lessonDetails);
            var updatedLesson = ObjectMapper.Map<Lesson, LessonDto>(lesson);
            return updatedLesson;
        }
    }
}
