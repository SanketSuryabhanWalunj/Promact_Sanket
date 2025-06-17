using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.Localization;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class ModuleDomainService: DomainService
    {
        private readonly IRepository<Module> _moduleRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;

        public ModuleDomainService(IRepository<Module> moduleRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<UserCourseEnrollments> userCourseEnrollmentRepository)
        {
            _moduleRepository = moduleRepository;
            _localizer = localizer;
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
        }

        /// <summary>
        /// Method to add module.
        /// </summary>
        /// <param name="module">Details of the module.</param>
        /// <returns>Task.</returns>
        public async Task AddModuleAsync(Module module)
        {
            var latestModule = (await _moduleRepository.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => x.CourseId == module.CourseId).OrderByDescending(x => x.SerialNumber).FirstOrDefault();
            if (latestModule != null)
            {
                module.SerialNumber = latestModule.SerialNumber+1;
            }
            await _moduleRepository.InsertAsync(module, true);
        }

        /// <summary>
        /// Method to update the module.
        /// </summary>
        /// <param name="module">Module details.</param>
        /// <returns>Updated module details.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<Module> UpdateModuleAsync(Module module)
        {
            var moduleDetails = await _moduleRepository.FirstOrDefaultAsync(x => x.Id == module.Id);
            if (moduleDetails == null)
            {
                throw new UserFriendlyException(_localizer["ModuleNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                // We are not updating serial number for now. Because it is related to other remaining item updates also.
                //moduleDetails.SerialNumber = module.SerialNumber;
                moduleDetails.Name = module.Name;
                moduleDetails = await _moduleRepository.UpdateAsync(moduleDetails,true);
            }

            return moduleDetails;
        }

        /// <summary>
        /// Method to delete the module by id.
        /// </summary>
        /// <param name="id">id of the module.</param>
        /// <returns>Task.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task DeleteModuleById(Guid id)
        {
            var moduleDetails = await _moduleRepository.FirstOrDefaultAsync(x => x.Id == id);
            if (moduleDetails == null)
            {
                throw new UserFriendlyException(_localizer["ModuleNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                await _moduleRepository.DeleteAsync(moduleDetails, true);
            }
        }

        /// <summary>
        /// Method to get module by id.
        /// </summary>
        /// <param name="id">Id of the module.</param>
        /// <returns>Module details.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        public async Task<Module> GetModulebyId(Guid id)
        {
            //var moduleDetails = await _moduleRepository.FirstOrDefaultAsync(x => x.Id == id);
            var moduleDetails = (await _moduleRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == id);
            if (moduleDetails == null)
            {
                throw new UserFriendlyException(_localizer["ModuleNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            return moduleDetails;
        }

        /// <summary>
        /// Method to get list of modules by courseId.
        /// </summary>
        /// <param name="courseId">Id of the course.</param>
        /// <returns>List of the modules.</returns>
        public async Task<ICollection<Module>> GetModulesByCourseId(Guid courseId)
        {
            var moduleList = (await _moduleRepository.WithDetailsAsync(x => x.Course)).AsQueryable().Where(x => x.CourseId == courseId).ToList();
            return moduleList;
        }


        /// <summary>
        /// Method to update current status of module for a user enrolled in a course.
        /// </summary>
        /// <param name="userCourseEnrollmentId">Id of the enrollment.</param>
        /// <param name="currentModuleId">Id of the current module.</param>
        /// <returns>Updated details of the enrollment.</returns>
        public async Task<UserCourseEnrollments> UpdateModuleStatusForUserCourseEnrollmentAsync(int userCourseEnrollmentId, Guid currentModuleId)
        {
            var userCourseEnrollmentDetails = (await _userCourseEnrollmentRepository.WithDetailsAsync(x => x.CourseSubscriptionMapping)).AsQueryable().FirstOrDefault(x => x.Id == userCourseEnrollmentId);
            if (userCourseEnrollmentDetails != null)
            {
                userCourseEnrollmentDetails.CurrentModuleId = currentModuleId;
                var currentModule = await _moduleRepository.FirstOrDefaultAsync(x => x.Id == currentModuleId);

                var totalModules = await _moduleRepository.CountAsync(x => x.CourseId == userCourseEnrollmentDetails.CourseSubscriptionMapping.CourseId);
                var completedModules = await _moduleRepository.CountAsync(x => x.SerialNumber < currentModule.SerialNumber);

                double modulePercentage = (completedModules / totalModules) * 100;
                var currentCourseProgress = Math.Round(modulePercentage, 2);
                userCourseEnrollmentDetails.Progress = currentCourseProgress;
                userCourseEnrollmentDetails = await _userCourseEnrollmentRepository.UpdateAsync(userCourseEnrollmentDetails);
            }
            return userCourseEnrollmentDetails;
        }

        /// <summary>
        /// Method to get HasExam property of module with module id.
        /// </summary>
        /// <param name="moduleId">Required module id</param>
        /// <returns>boolean value HasExam property</returns>
        /// <exception cref="UserFriendlyException">throws exception when module does not exists.</exception>
        public async Task<bool> GetHasExamByModuleId(Guid moduleId)
        {
            var module = await _moduleRepository.FirstOrDefaultAsync(m => m.Id == moduleId);
            if (module != null)
            {
                return module.HasExam;
            }
            throw new UserFriendlyException(_localizer["ModuleNotExist"], StatusCodes.Status404NotFound.ToString());
        }
    }
}
