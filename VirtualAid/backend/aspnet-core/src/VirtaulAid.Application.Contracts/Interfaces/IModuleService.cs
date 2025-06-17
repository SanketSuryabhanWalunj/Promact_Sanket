using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Course;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface IModuleService: IApplicationService
    {
        /// <summary>
        /// Method to get module by id.
        /// </summary>
        /// <param name="id">Id of the module.</param>
        /// <returns>module details.</returns>
        Task<ModuleDto> GetModuleByIdAsync(Guid id, string culture);

        /// <summary>
        /// Method to add module.
        /// </summary>
        /// <param name="moduleDto">Details of module.</param>
        /// <returns>Task.</returns>
        Task AddModuleAsync(AddModuleDto moduleDto);

        /// <summary>
        /// Method to update the module.
        /// </summary>
        /// <param name="lessonDto">Module details.</param>
        /// <returns>updated module details.</returns>
        Task<ModuleDto> UpdateModuleAsync(ReqModuleDto moduleDto);

        /// <summary>
        /// Method to delete the module by id.
        /// </summary>
        /// <param name="id">Id of the module.</param>
        /// <returns>Task.</returns>
        Task DeleteModuleAsync(Guid id);

        /// <summary>
        /// Method to get the module list by course id.
        /// </summary>
        /// <param name="courseId">Id of the course.</param>
        /// <returns>List of the module.</returns>
        Task<ICollection<ModuleDto>> GetModulesWithContentsByCourseIdAsync(Guid courseId, string culture);

    }
}
