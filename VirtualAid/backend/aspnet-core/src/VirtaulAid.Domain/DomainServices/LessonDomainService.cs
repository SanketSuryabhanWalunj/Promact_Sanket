using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Localization;
using VirtaulAid.MultilingualObjects;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class LessonDomainService : DomainService
    {
        private readonly IRepository<Lesson> _lessonRepository;
        private readonly IRepository<Content> _contentRepository;
        private readonly IRepository<Section> _sectionRepository;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IRepository<Module> _moduleRepository;
        private readonly CourseDomainService _courseDomainService;
        private readonly IMapper _mapper;
        private readonly MultiLingualObjectManager _multiLingualObjectManager;

        public LessonDomainService(IRepository<Lesson> lessonRepository,
            IRepository<Content> contentRepository,
            IRepository<Section> sectionRepository,
            IRepository<UserCourseEnrollments> userCourseEnrollmentRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<Module> moduleRepository,
            CourseDomainService courseDomainService,
            IMapper mapper,
            MultiLingualObjectManager multiLingualObjectManager)
        {
            _lessonRepository = lessonRepository;
            _contentRepository = contentRepository;
            _sectionRepository = sectionRepository;
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
            _localizer = localizer;
            _moduleRepository = moduleRepository;
            _courseDomainService = courseDomainService;
            _mapper = mapper;
            _multiLingualObjectManager = multiLingualObjectManager;
        }

        /// <summary>
        /// Method to add lesson.
        /// </summary>
        /// <param name="lesson">Lesson details.</param>
        /// <returns>Task.</returns>
        public async Task AddLessonAsync(Lesson lesson)
        {
            var lastLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).AsQueryable().Where(x => x.ModuleId == lesson.ModuleId).OrderByDescending(x => x.SerialNumber).FirstOrDefault();
            if (lastLesson != null)
            {
                lesson.SerialNumber = lastLesson.SerialNumber + 1;
            }
            await _lessonRepository.InsertAsync(lesson, true);
        }

        /// <summary>
        /// Method to update lesson.
        /// </summary>
        /// <param name="lesson">Lesson details.</param>
        /// <returns>Updated lesson.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<Lesson> UpdateLessonAsync(Lesson lesson)
        {
            var lessonDetails = await _lessonRepository.FirstOrDefaultAsync(x => x.Id == lesson.Id);
            if (lessonDetails == null)
            {
                throw new UserFriendlyException(_localizer["LessonNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                // We are not updating serial number for now. Because it is related to other remaining item updates also.
                // lessonDetails.SerialNumber = lesson.SerialNumber
                lessonDetails.Name = lesson.Name;
                lessonDetails = await _lessonRepository.UpdateAsync(lessonDetails, true);
            }

            return lessonDetails;
        }

        /// <summary>
        /// Method to delete lesson by id.
        /// </summary>
        /// <param name="id">Lesson id.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task DeleteLessonById(Guid id)
        {
            var lessonDetails = await _lessonRepository.FirstOrDefaultAsync(x => x.Id == id);
            if (lessonDetails == null)
            {
                throw new UserFriendlyException(_localizer["LessonNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                await _lessonRepository.DeleteAsync(lessonDetails, true);
            }
        }

        /// <summary>
        /// Method to get lesson by id.
        /// </summary>
        /// <param name="id">Id of the lesson.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<LessonDto> GetLessonbyId(Guid id, string culture)
        {
            Lesson? lesson = (await _lessonRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == id);
            if (lesson == null)
            {
                throw new UserFriendlyException(_localizer["LessonNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            LessonDto lessonDto = _mapper.Map<LessonDto>(lesson);
            LessonTranslation translationForLesson = await _multiLingualObjectManager.FindTranslationAsync<Lesson, LessonTranslation>(lesson, culture, true);
            if(translationForLesson != null)
            {
                lessonDto.Language = translationForLesson.Language;
                lessonDto.Name = translationForLesson.Name;
            }
            return lessonDto;
        }

        /// <summary>
        /// Method to get lesson with previous and next lesson.
        /// </summary>
        /// <param name="currentLessonId">Current lesson id.</param>
        /// <param name="examType">Exam type that user bye.</param>
        /// <param name="userId">User id .</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of lessons.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<PreviousNextCourseDto> GetLessonWithPreviousNextbyIdAsync(Guid currentLessonId, string examType, Guid userId, string culture)
        {
            Lesson currentLesson = await _lessonRepository.FirstOrDefaultAsync(x => x.Id == currentLessonId);
            if (currentLesson == null)
            {
                throw new UserFriendlyException(_localizer["LessonNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            Lesson? nextLesson = await _lessonRepository.FirstOrDefaultAsync(x => x.SerialNumber == currentLesson.SerialNumber + 1 && x.ModuleId == currentLesson.ModuleId);
            Lesson? prevLesson = await _lessonRepository.FirstOrDefaultAsync(x => x.SerialNumber == currentLesson.SerialNumber - 1 && x.ModuleId == currentLesson.ModuleId);

            List<LessonDto> lessonDtoList = new();
            List<Lesson> lessonListDetails = (await _lessonRepository.WithDetailsAsync(x => x.Module, x => x.Translations, x => x.Contents)).AsQueryable().Where(x => x.ModuleId == currentLesson.ModuleId && (x.SerialNumber == currentLesson.SerialNumber || x.SerialNumber == currentLesson.SerialNumber - 1 || x.SerialNumber == currentLesson.SerialNumber + 1)).ToList();
            List<IGrouping<Guid, Content>> lessonWithContents = (await _contentRepository.WithDetailsAsync(x => x.Lesson, x => x.Translations)).AsQueryable().GroupBy(x => x.LessonId).ToList();
            List<IGrouping<Guid, Section>> contentWithSections = (await _sectionRepository.WithDetailsAsync(x => x.Content, x => x.Translations)).AsQueryable().GroupBy(x => x.ContentId).ToList();

            // If current lesson is first lesson of the current module then we have to send last lesson of previous module.
            if (lessonListDetails.Count <= 2 && prevLesson == null)
            {
                Module prevModule = await _moduleRepository.FirstOrDefaultAsync(x => x.SerialNumber == currentLesson.Module.SerialNumber - 1 && x.CourseId == currentLesson.Module.CourseId);
                if (prevModule != null)
                {
                    IOrderedEnumerable<Lesson> orderPreviousModuleLesson = prevModule.Lessons.OrderByDescending(x => x.SerialNumber);
                    if (orderPreviousModuleLesson != null && orderPreviousModuleLesson.Count() > 0)
                    {
                        prevLesson = orderPreviousModuleLesson.First();
                    }

                    IEnumerable<Section> virtualRealitySections = prevLesson.Contents.SelectMany(content => content.Sections).Where(section => section.FieldType == Enums.SectionType.VirtualReality);

                    // If Exam type is not VR and previous lesson type is VR then we revove it and get the previous to previous lesson
                    if (virtualRealitySections.Any() && examType.ToUpper() != "VR")
                    {
                        if (orderPreviousModuleLesson.ElementAtOrDefault(1) != null)
                        {
                            prevLesson = orderPreviousModuleLesson.ElementAtOrDefault(1);
                        }
                        else
                        {
                            Module prevToPrevModule = await _moduleRepository.FirstOrDefaultAsync(x => x.SerialNumber == prevLesson.Module.SerialNumber - 1 && x.CourseId == currentLesson.Module.CourseId);
                            prevLesson = prevToPrevModule.Lessons.OrderBy(x => x.SerialNumber).Last();
                        }
                    }

                    if (prevLesson != null)
                        lessonListDetails.Add(prevLesson);

                }
            }

            // If course type is not VR then we are not sending the VR lession to frontend 
            if (examType.ToUpper() != "VR")
            {
                List<Lesson> lessonsToRemove = new List<Lesson>();
                foreach (Lesson? lesson in lessonListDetails)
                {
                    foreach (Content content in lesson.Contents)
                    {
                        List<Section>? sectionsListWithContent = contentWithSections.FirstOrDefault(group => group.Key == content.Id)?.ToList();
                        if (sectionsListWithContent != null)
                        {
                            content.Sections = sectionsListWithContent;

                            foreach (Section section in content.Sections)
                            {
                                if (section.FieldType == Enums.SectionType.VirtualReality)
                                {
                                    lessonsToRemove.Add(lesson);
                                    break;
                                }
                            }
                        }
                    }
                }

                foreach (Lesson lessonToRemove in lessonsToRemove)
                {
                    if (currentLesson.Id == lessonToRemove.Id)
                    {
                        await _courseDomainService.UpdateProgressForCourseByLessonIdAsync(userId.ToString(), lessonToRemove.Module.CourseId.ToString(), currentLesson.Id.ToString(), examType);
                    }
                    lessonListDetails.Remove(lessonToRemove);
                }
            }

            // If current lesson is last lesson of current module then we have to send first lesson of next module.
            if (lessonListDetails.Count <= 2 && (nextLesson == null || examType.ToUpper() != "VR"))
            {
                Module nextModule = await _moduleRepository.FirstOrDefaultAsync(x => x.SerialNumber == currentLesson.Module.SerialNumber + 1 && x.CourseId == currentLesson.Module.CourseId);
                Lesson? nextModuleFirstLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).FirstOrDefault(x => nextModule != null && x.ModuleId == nextModule.Id && x.SerialNumber == 0);
                if (nextModuleFirstLesson != null)
                {
                    nextLesson = nextModuleFirstLesson;
                    lessonListDetails.Add(nextModuleFirstLesson);
                }

            }

            foreach (Lesson? lesson in lessonListDetails)
            {
                LessonDto lessonDto = _mapper.Map<LessonDto>(lesson);
                LessonTranslation translationForLesson = await _multiLingualObjectManager.FindTranslationAsync<Lesson, LessonTranslation>(lesson, culture, true);
                if (translationForLesson != null)
                {
                    lessonDto.Language = translationForLesson.Language;
                    lessonDto.Name = translationForLesson.Name;
                }
                // Get contents related to the current lesson
                List<Content>? contentListWithLesson = lessonWithContents.FirstOrDefault(group => group.Key == lesson.Id)?.ToList();
                List<ContentDto> contentDtoList = new();
                foreach (Content content in contentListWithLesson)
                {
                    ContentDto contentDto = _mapper.Map<ContentDto>(content);
                    ContentTranslation translationForContent = await _multiLingualObjectManager.FindTranslationAsync<Content, ContentTranslation>(content, culture, true);
                    if (translationForContent != null)
                    {
                        contentDto.Language = translationForContent.Language;
                        contentDto.ContentTitle = translationForContent.ContentTitle;
                        contentDto.ContentData = translationForContent.ContentData;
                    }

                    List<Section>? sectionsListWithContent = contentWithSections.FirstOrDefault(group => group.Key == content.Id)?.ToList();
                    List<SectionDto> sectionDtoList = new();
                    foreach (var section in sectionsListWithContent)
                    {
                        SectionDto sectionDto = _mapper.Map<SectionDto>(section);
                        var translationForSection = await _multiLingualObjectManager.FindTranslationAsync<Section, SectionTranslation>(section, culture, true);
                        if (translationForSection != null)
                        {
                            sectionDto.Language = translationForSection.Language;
                            sectionDto.SectionTitle = translationForSection.SectionTitle;
                            sectionDto.SectionData = translationForSection.SectionData;
                        }
                        sectionDtoList.Add(sectionDto);
                    }
                    contentDto.Sections = sectionDtoList;

                    contentDtoList.Add(contentDto);
                }
                lessonDto.Contents = contentDtoList;
                lessonDtoList.Add(lessonDto);
            }

            foreach (LessonDto lesson in lessonDtoList)
            {
                Lesson? lessonDetails = lessonListDetails.FirstOrDefault(x => x.Id == lesson.Id);
                lesson.CurrentModuleSerialNumber = lessonDetails != null ? lessonDetails.Module.SerialNumber : 0;
            }

            PreviousNextCourseDto previousNextCourseDto = new();
            previousNextCourseDto.PreviousLesson = prevLesson !=null ? lessonDtoList.Find(x => x.Id == prevLesson.Id): null;
            previousNextCourseDto.CurrentLesson = lessonDtoList.First(x => x.Id == currentLessonId);
            previousNextCourseDto.NextLesson = nextLesson != null ?lessonDtoList.Find(x => x.Id == nextLesson.Id): null;

            return previousNextCourseDto;
        }


        /// <summary>
        /// Method to get lesson by Moduleid.
        /// </summary>
        /// <param name="moduleId">Id of the module.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the lessons.</returns>
        public async Task<ICollection<LessonDto>> GetLessonsByModuleId(Guid moduleId, string culture)
        {
            List<LessonDto> lessonDtoList = new List<LessonDto>();

            List<Lesson> lessonList = (await _lessonRepository.WithDetailsAsync(x => x.Module, x => x.Translations)).AsQueryable().Where(x => x.ModuleId == moduleId).OrderBy(x => x.SerialNumber).ToList();
            List<IGrouping<Guid, Content>> lessonWithContents = (await _contentRepository.WithDetailsAsync(x => x.Lesson, x => x.Translations)).AsQueryable().GroupBy(x => x.LessonId).ToList();

            foreach (Lesson lesson in lessonList)
            {
                LessonDto lessonDto = _mapper.Map<LessonDto>(lesson);
                LessonTranslation translationForLesson = await _multiLingualObjectManager.FindTranslationAsync<Lesson, LessonTranslation>(lesson, culture, true);
                if(translationForLesson != null)
                {
                    lessonDto.Language = translationForLesson.Language;
                    lessonDto.Name = translationForLesson.Name;
                }
                // Get contents related to the current lesson
                List<Content>? contents = lessonWithContents.FirstOrDefault(group => group.Key == lesson.Id)?.OrderBy(x => x.SerialNumber).ToList();
                List<ContentDto> contentDtoList = new List<ContentDto>();
                if (contents != null)
                {
                    foreach (Content content in contents)
                    {
                        ContentDto contentDto = _mapper.Map<ContentDto>(content);
                        ContentTranslation translationForContent = await _multiLingualObjectManager.FindTranslationAsync<Content, ContentTranslation>(content, culture, true);
                        if (translationForContent != null)
                        {
                            contentDto.Language = translationForContent.Language;
                            contentDto.ContentTitle = translationForContent.ContentTitle;
                            contentDto.ContentData = translationForContent.ContentData;
                        }
                        contentDtoList.Add(contentDto);
                    }
                }
                lessonDto.Contents = contentDtoList;
                lessonDtoList.Add(lessonDto);
            }

            return lessonDtoList;
        }

        /// <summary>
        /// Method to update current status of lesson for a user enrolled in a course.
        /// </summary>
        /// <param name="userCourseEnrollmentId">Id of the enrollment.</param>
        /// <param name="currentLessonId">Id of the current lesson.</param>
        /// <returns>Updated details of the enrollment.</returns>
        public async Task<UserCourseEnrollments> UpdateLessonStatusForUserCourseEnrollmentAsync(int userCourseEnrollmentId, Guid currentLessonId)
        {
            var userCourseEnrollmentDetails = (await _userCourseEnrollmentRepository.WithDetailsAsync(x => x.CourseSubscriptionMapping)).AsQueryable().FirstOrDefault(x => x.Id == userCourseEnrollmentId);
            if (userCourseEnrollmentDetails != null)
            {
                userCourseEnrollmentDetails.CurrentLessonId = currentLessonId;
                var currentLesson = (await _lessonRepository.WithDetailsAsync(x => x.Module)).FirstOrDefault(x => x.Id == currentLessonId);
                var totalLessons = await _lessonRepository.CountAsync(x => x.ModuleId == currentLesson.ModuleId);
                var completedLessons = await _lessonRepository.CountAsync(x => x.SerialNumber < currentLesson.SerialNumber);
                double percentage = (completedLessons / totalLessons) * 100;
                var currentModuleProgress = Math.Round(percentage, 2);

                var totalModules = await _moduleRepository.CountAsync(x => x.CourseId == userCourseEnrollmentDetails.CourseSubscriptionMapping.CourseId);
                var completedModules = await _moduleRepository.CountAsync(x => x.SerialNumber < currentLesson.Module.SerialNumber);

                double modulePercentage = (completedModules / totalModules) * 100;
                var currentCourseProgress = Math.Round(modulePercentage, 2) + currentModuleProgress;
                userCourseEnrollmentDetails.CurrentModulePorgress = currentModuleProgress;
                userCourseEnrollmentDetails.Progress = currentCourseProgress;
                userCourseEnrollmentDetails = await _userCourseEnrollmentRepository.UpdateAsync(userCourseEnrollmentDetails, true);
            }
            return userCourseEnrollmentDetails;
        }

    }
}
