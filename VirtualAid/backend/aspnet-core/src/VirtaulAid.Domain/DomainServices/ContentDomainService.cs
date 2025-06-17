using AutoMapper;
using AutoMapper.Internal.Mappers;
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
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class ContentDomainService: DomainService
    {
        private readonly IRepository<Content> _contentRepository;
        private readonly IRepository<Lesson> _lessonRepository;
        private readonly IRepository<Module> _moduleRepository;
        private readonly CourseDomainService _courseDomainService;
        private readonly IRepository<Section> _sectionRepository;
        private readonly IMapper _mapper;
        private readonly MultiLingualObjectManager _multiLingualObjectManager;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;

        public ContentDomainService(IRepository<Content> contentRepository,
            IRepository<Lesson> lessonRepository,
            IRepository<Module> moduleRepository,
            CourseDomainService courseDomainService,
            IRepository<Section> sectionRepository,
            IMapper mapper,
            MultiLingualObjectManager multiLingualObjectManager,
            IStringLocalizer<VirtaulAidResource> localizer)
        {
            _contentRepository = contentRepository;
            _lessonRepository = lessonRepository;
            _moduleRepository = moduleRepository;
            _courseDomainService = courseDomainService;
            _sectionRepository = sectionRepository;
            _mapper = mapper;
            _multiLingualObjectManager = multiLingualObjectManager;
            _localizer = localizer;
        }

        /// <summary>
        /// Method to get content by id.
        /// </summary>
        /// <param name="id">Id of the content.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>content details.</returns>
        public async Task<ContentDto> GetContentByIdAsync(Guid id, string culture)
        {
            Content? content = (await _contentRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == id);
            if(content == null)
            {
                throw new UserFriendlyException(_localizer["ContentNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            ContentDto contentDto = _mapper.Map<ContentDto>(content);
            ContentTranslation translationForContent = await _multiLingualObjectManager.FindTranslationAsync<Content, ContentTranslation>(content, culture, true);
            if(translationForContent != null)
            {
                contentDto.Language = translationForContent.Language;
                contentDto.ContentTitle = translationForContent.ContentTitle;
                contentDto.ContentData = translationForContent.ContentData;
            }
            return contentDto;
        }

        /// <summary>
        /// Method to add content.
        /// </summary>
        /// <param name="contentDetails">Details of content.</param>
        /// <returns>Task.</returns>
        public async Task AddContentAsync(Content contentDetails)
        {
            var content = await _contentRepository.FirstOrDefaultAsync(x => x.ContentData == contentDetails.ContentData);
            if (content == null)
            {
                var lastContent = (await _contentRepository.WithDetailsAsync(x => x.Lesson)).AsQueryable().Where(x => x.LessonId == contentDetails.LessonId).OrderByDescending(x => x.SerialNumber).FirstOrDefault();
                if (lastContent != null)
                {
                    contentDetails.SerialNumber = lastContent.SerialNumber+1;
                }
                await _contentRepository.InsertAsync(contentDetails);
            }
        }

        /// <summary>
        /// Method to update the content.
        /// </summary>
        /// <param name="contentDetails">Content details.</param>
        /// <returns>updated content details.</returns>
        public async Task<Content> UpdateContentAsync(Content contentDetails)
        {
            var content = await _contentRepository.FirstOrDefaultAsync(x => x.Id == contentDetails.Id);
            if (content != null)
            {
                // We are not updating serial number for now. Because it is related to other remaining item updates also.
                //content.SerialNumber = contentDetails.SerialNumber;
                content.ContentData = contentDetails.ContentData;
                content = await _contentRepository.UpdateAsync(content);
            }

            return content;
        }

        /// <summary>
        /// Method to delete the content by id.
        /// </summary>
        /// <param name="id">Id of the content.</param>
        /// <returns>Task.</returns>
        public async Task DeleteContentAsync(Guid id)
        {
            var content = await _contentRepository.FirstOrDefaultAsync(x => x.Id == id);
            if (content != null)
            {
                await _contentRepository.DeleteAsync(content);
            }
        }

        /// <summary>
        /// Method to get the content list by lesson id.
        /// </summary>
        /// <param name="lessonId">Id of the lesson.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the content.</returns>
        public async Task<ICollection<ContentDto>> GetContentsByLessonIdAsync(Guid lessonId, string culture)
        {
            List<Content> contentList = (await _contentRepository.WithDetailsAsync(x => x.Lesson, x => x.Translations)).AsQueryable().Where(x => x.LessonId == lessonId).ToList();
            List<ContentDto> contentDtoList = new List<ContentDto>();
            foreach (Content content in contentList)
            { 
                ContentDto contentDto = _mapper.Map<ContentDto>(content);
                ContentTranslation translationForContent = await _multiLingualObjectManager.FindTranslationAsync<Content, ContentTranslation>(content, culture, true);
                if(translationForContent != null) 
                { 
                    contentDto.Language = translationForContent.Language;
                    contentDto.ContentTitle = translationForContent.ContentTitle;
                    contentDto.ContentData = translationForContent.ContentData;
                }
                contentDtoList.Add(contentDto);
            }
            return contentDtoList;
        }

        /// <summary>
        /// Method to get the course details with content.
        /// </summary>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the modules.</returns>
        public async Task<ICollection<ModuleDto>> GetCourseDetailsWithContentsAsync(Guid courseId, string culture)
        {
            var moduleList = (await _moduleRepository.WithDetailsAsync(x => x.Course, x => x.Translations)).AsQueryable().Where(x => x.CourseId == courseId).ToList().OrderBy(x => x.SerialNumber);
            var moduleIds = moduleList.Select(x => x.Id).ToList();
            var moduleWithLessons = (await _lessonRepository.WithDetailsAsync(x => x.Module, x => x.Translations)).AsQueryable().GroupBy(x =>x.ModuleId).ToList();
            var lessonWithContents = (await _contentRepository.WithDetailsAsync(x => x.Lesson, x => x.Translations)).AsQueryable().GroupBy(x => x.LessonId).ToList();
            var contentWithSections = (await _sectionRepository.WithDetailsAsync(x => x.Content, x => x.Translations)).AsQueryable().GroupBy(x => x.ContentId).ToList();

            List<ModuleDto> moduleDtoList = new List<ModuleDto>();

            foreach (var module in moduleList)
            {
                ModuleDto moduleDto = _mapper.Map<ModuleDto>(module);
                var translationForModule = await _multiLingualObjectManager.FindTranslationAsync<Module, ModuleTranslation>(module, culture, true);
                if (translationForModule != null)
                {
                    moduleDto.Name = translationForModule.Name;
                    moduleDto.Language = translationForModule.Language;
                }

                // Get lessons related to the current module
                var lessons = moduleWithLessons.FirstOrDefault(group => group.Key == module.Id)?.ToList().OrderBy(x => x.SerialNumber);
                if (lessons != null)
                {
                    List<LessonDto> lessonDtoList = new List<LessonDto>();
                    foreach (var lesson in lessons)
                    {
                        LessonDto lessonDto = _mapper.Map<LessonDto>(lesson);
                        var translationForLesson = await _multiLingualObjectManager.FindTranslationAsync<Lesson, LessonTranslation>(lesson, culture, true);
                        if(translationForLesson != null)
                        {
                            lessonDto.Language = translationForLesson.Language;
                            lessonDto.Name = translationForLesson.Name;
                        }
                        // Get contents related to the current lesson
                        var contents = lessonWithContents.FirstOrDefault(group => group.Key == lesson.Id)?.ToList().OrderBy(x => x.SerialNumber);
                        if (contents != null)
                        {
                            List<ContentDto> contentDtoList = new List<ContentDto>();
                            foreach (var content in contents)
                            {
                                ContentDto contentDto = _mapper.Map<ContentDto>(content);
                                var translationForContent = await _multiLingualObjectManager.FindTranslationAsync<Content, ContentTranslation>(content, culture, true);
                                if (translationForContent != null)
                                {
                                    contentDto.Language = translationForContent.Language;
                                    contentDto.ContentTitle = translationForContent.ContentTitle;
                                    contentDto.ContentData = translationForContent.ContentData;
                                }

                                var sections = contentWithSections.FirstOrDefault(group => group.Key == content.Id)?.ToList().OrderBy(x => x.SerialNumber);
                                if (sections != null)
                                {
                                    List<SectionDto> sectionDtos = new List<SectionDto>();
                                    foreach (var section in sections)
                                    {
                                        SectionDto sectionDto = _mapper.Map<SectionDto>(section);
                                        var translationForSection = await _multiLingualObjectManager.FindTranslationAsync<Section, SectionTranslation>(section, culture, true);
                                        if(translationForSection != null)
                                        {
                                            sectionDto.Language = translationForSection.Language;
                                            sectionDto.SectionTitle = translationForSection.SectionTitle;
                                            sectionDto.SectionData = translationForSection.SectionData;
                                        }
                                        sectionDtos.Add(sectionDto);
                                    }
                                    contentDto.Sections = sectionDtos;
                                }
                                contentDtoList.Add(contentDto);
                            }
                            lessonDto.Contents = contentDtoList;
                        }
                        lessonDtoList.Add(lessonDto);
                    }
                    moduleDto.Lessons = lessonDtoList;
                }
                moduleDtoList.Add(moduleDto);
            }

            return moduleDtoList;
        }

        /// <summary>
        /// Method to get the virtual reality (VR) modules available to user.
        /// </summary>
        /// <param name="userId">Id of the user.</param>
        /// <returns>List of virtual reality module names.</returns>
        public async Task<List<string>> GetListOfVirtualRealityModulesForUserAsync(string userId)
        {
            var moduleVRList = new List<string>();

            List<ResCourseDetailDto> enrolledCourses = await _courseDomainService.GetAllEnrolledCoursesByUserAsync(userId);
            List<Guid> enrolledCourseIds = enrolledCourses.Select(course => course.Id).ToList();
            List<Module> moduleList = (await _moduleRepository.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => enrolledCourseIds.Contains(x.CourseId)).ToList();
            List<Guid> moduleIds = moduleList.Select(x => x.Id).ToList();

            // We cannot use exact data type inplaceof var because these are dynamic data type due grouping.
            var moduleWithLessons = (await _lessonRepository.WithDetailsAsync(x => x.Module)).AsQueryable().GroupBy(x => x.ModuleId).ToList();
            var lessonWithContents = (await _contentRepository.WithDetailsAsync(x => x.Lesson)).AsQueryable().GroupBy(x => x.LessonId).ToList();
            var virtualRealitySections = (await _sectionRepository.WithDetailsAsync(x => x.Content)).AsQueryable().Where(x => x.FieldType == Enums.SectionType.VirtualReality).ToList();

            if (virtualRealitySections != null)
            {
                moduleVRList = virtualRealitySections.Select(x => x.SectionTitle).ToList();
            }

            return moduleVRList;
        }
    }
}
