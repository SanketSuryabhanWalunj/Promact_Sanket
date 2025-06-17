using Microsoft.AspNetCore.Authorization;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Governor;
using VirtaulAid.Interfaces;
using VirtaulAid.Permissions;
using VirtaulAid.Util;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Admin, Super Admin, Governor")]
    public class GovernorService : ApplicationService, IGovernorService
    {

        private readonly GovernorDomainService _governorDomainService;
        private readonly IUtilityService _utilityService;

        public GovernorService(GovernorDomainService governorDomainService,
            IUtilityService utilityService)
        {
            _governorDomainService = governorDomainService;
            _utilityService = utilityService;
        }

        /// <summary>
        /// Method is to add the governor details.
        /// </summary>
        /// <param name="reqGovernorModel">Request dto with the all feilds.</param>
        /// <returns>Added new governor object.</returns>
        /// <exception cref="UserFriendlyException">Email is exist.</exception>
        [Authorize(VirtaulAidPermissions.User.Create)]
        public async Task<ResAddGovernorDto> AddGovernorAsync(ReqAddGovernorDto addGovernorModel)
        {
            // Convert first letter of email to lower case by default
            addGovernorModel.Email = await _utilityService.ConvertFirstCharToLowerCaseAsync(addGovernorModel.Email);
            return await _governorDomainService.AddGovernorAsync(addGovernorModel);
        }

        /// <summary>
        /// Method is to get the governor details by id.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <returns>Governor object.</returns>
        /// <exception cref="UserFriendlyException">User is not extist.</exception>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResAddGovernorDto> GetGovernorByIdAsync(Guid governorId)
        {
            return await _governorDomainService.GetGovernorByIdAsync(governorId);
        }

        /// <summary>
        /// Method is to update the governor details.
        /// </summary>
        /// <param name="updateGovernorModel">Object with updated values.</param>
        /// <returns>Updated object.</returns>
        /// <exception cref="UserFriendlyException">User not exist.</exception>
        [Authorize(VirtaulAidPermissions.User.Edit)]
        public async Task<ResAddGovernorDto> UpdateGovernorAsync(ReqUpdateGovernorDto updateGovernorModel)
        {
            return await _governorDomainService.UpdateGovernorAsync(updateGovernorModel);
        }

        /// <summary>
        /// Method is to active or inactive governor.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <param name="isDelete">If true then inactive and respectavly.</param>
        /// <returns>Modified user object.</returns>
        /// <exception cref="UserFriendlyException">User not exist.</exception>
        [Authorize(VirtaulAidPermissions.User.Edit)]
        public async Task<ResAddGovernorDto> ActiveInactiveGovernorByIdAsync(Guid governorId, bool isDelete)
        {
            return await _governorDomainService.ActiveInactiveGovernor(governorId, isDelete);
        }

        /// <summary>
        /// Method is to get all governor list.
        /// </summary>
        /// <returns>list of all governor object.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<List<ResAddGovernorDto>> GetGovernorListAsync()
        {
            return await _governorDomainService.GetListGovernorAsync();
        }

        /// <summary>
        /// Method is to hard delete governor.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.User.Delete)]
        public async Task DeleteGovernorByIdAsync(Guid governorId)
        {
            await _governorDomainService.DeleteGovernorAsync(governorId);
        }

        /// <summary>
        /// Method is to get the individual list with specific state.
        /// </summary>
        /// <param name="state">Name of the perticular state.</param>
        /// <returns>List of the users.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<List<ResUserDetailsDto>> GetIndividualCountByStateAsync(string state)
        {
            return await _governorDomainService.IndividualCountByStateAsync(state);
        }

        /// <summary>
        /// Merhod is to get the user details with address.
        /// </summary>
        /// <param name="userId">user Id.</param>
        /// <returns>The object of user details with address.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<ResUserAddressDetailsDto> GetIndividualLocationDetailsAsync(Guid userId)
        {
            return await _governorDomainService.IndividualLocationDetailsAsync(userId);
        }

        /// <summary>
        /// Method to get list of users with consent by country.
        /// </summary>
        /// <param name="country">Country name.</param>
        /// <returns>Count of the individual with state.</returns>
        [Authorize(VirtaulAidPermissions.User.Default)]
        public async Task<Dictionary<string, int>> GetListOfIndividualsWithConsentStateWiseByCountryAsync(string country)
        {
            return await _governorDomainService.GetListOfIndividualsWithConsentStateWiseByCountryAsync(country);
        }

    }
}
