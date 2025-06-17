using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Quartz.Impl.Triggers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Interfaces;
using VirtaulAid.MultilingualObjects;
using VirtaulAid.Permissions;
using Volo.Abp.Application.Services;
using Volo.Abp.Localization;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Company, Individual, Admin, Super Admin")]
    public class ModuleService : ApplicationService, IModuleService
    {
        private readonly ModuleDomainService _moduleDomainService;
        private readonly ContentDomainService _contentDomainService;
        private readonly MultiLingualObjectManager _multilingualObjectManager;

        public ModuleService(ModuleDomainService moduleDomainService, ContentDomainService contentDomainService, MultiLingualObjectManager multilingualObjectManager)
        {
            _moduleDomainService = moduleDomainService;
            _contentDomainService = contentDomainService;
            _multilingualObjectManager = multilingualObjectManager;
        }

        /// <summary>
        /// Method to add module.
        /// </summary>
        /// <param name="moduleDto">Details of module.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task AddModuleAsync(AddModuleDto moduleDto)
        {
            var moduleDetails = ObjectMapper.Map<AddModuleDto, Module>(moduleDto);
            await _moduleDomainService.AddModuleAsync(moduleDetails);
        }

        /// <summary>
        /// Method to delete the module by id.
        /// </summary>
        /// <param name="id">Id of the module.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task DeleteModuleAsync(Guid id)
        {
            await _moduleDomainService.DeleteModuleById(id);
        }

        /// <summary>
        /// Method to get module by id.
        /// </summary>
        /// <param name="id">Id of the module.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>module details.</returns>
        [Authorize]
        public async Task<ModuleDto> GetModuleByIdAsync(Guid id, string culture)
        {
            var moduleDetails = await _moduleDomainService.GetModulebyId(id);

            var translation = await _multilingualObjectManager.FindTranslationAsync<Module, ModuleTranslation>(multiLingual : moduleDetails, culture, fallbackToParentCultures: true);
            var moduleDto = ObjectMapper.Map<Module, ModuleDto>(moduleDetails);
            if (translation != null)
            {
                moduleDto.Language = translation.Language;
                moduleDto.Name = translation.Name;
            }
            return moduleDto;
        }

        /// <summary>
        /// Method to get the module list by course id.
        /// </summary>
        /// <param name="courseId">Id of the course.</param>
        /// <param name="culture">specifies the culture of the language</param>
        /// <returns>List of the module.</returns>
        [Authorize]
        public async Task<ICollection<ModuleDto>> GetModulesWithContentsByCourseIdAsync(Guid courseId, string culture)
        {
            ICollection<ModuleDto> moduleList = await _contentDomainService.GetCourseDetailsWithContentsAsync(courseId, culture);
            return moduleList;
        }

        /// <summary>
        /// Method to update the module.
        /// </summary>
        /// <param name="lessonDto">Module details.</param>
        /// <returns>updated module details.</returns>
        [Authorize]
        public async Task<ModuleDto> UpdateModuleAsync(ReqModuleDto moduleDto)
        {
            var moduleDetails = ObjectMapper.Map<ReqModuleDto, Module>(moduleDto);
            var updatedModuleDetails = await _moduleDomainService.UpdateModuleAsync(moduleDetails);
            var moduleDtoDetails = ObjectMapper.Map<Module, ModuleDto>(updatedModuleDetails);
            return moduleDtoDetails;
        }

        /// <summary>
        /// Method to get HasExam property of module by module id.
        /// </summary>
        /// <param name="moduleId">Required module id.</param>
        /// <returns>boolean value HasExam property.</returns>
        [Authorize]
        public async Task<bool> GetHasExamByModuleId(Guid moduleId)
        {
            var result = await _moduleDomainService.GetHasExamByModuleId(moduleId);
            return result;
        }
    }
}
