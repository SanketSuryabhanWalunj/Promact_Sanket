using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Governor;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Interfaces
{
    public interface IGovernorService : ITransientDependency
    {
        /// <summary>
        /// Method is to add the governor details.
        /// </summary>
        /// <param name="reqGovernorModel">Request dto with the all feilds.</param>
        /// <returns>Added new governor object.</returns>
        /// <exception cref="UserFriendlyException">Email is exist.</exception>
        Task<ResAddGovernorDto> AddGovernorAsync(ReqAddGovernorDto addGovernorModel);

        /// <summary>
        /// Method is to get the governor details by id.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <returns>Governor object.</returns>
        /// <exception cref="UserFriendlyException">User is not extist.</exception>
        Task<ResAddGovernorDto> GetGovernorByIdAsync(Guid governorId);

        /// <summary>
        /// Method is to update the governor details.
        /// </summary>
        /// <param name="updateGovernorModel">Object with updated values.</param>
        /// <returns>Updated object.</returns>
        /// <exception cref="UserFriendlyException">User not exist.</exception>
        Task<ResAddGovernorDto> UpdateGovernorAsync(ReqUpdateGovernorDto updateGovernorModel);

        /// <summary>
        /// Method is to active or inactive governor.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <param name="isDelete">If true then inactive and respectavly.</param>
        /// <returns>Modified user object.</returns>
        /// <exception cref="UserFriendlyException">User not exist.</exception>
        Task<ResAddGovernorDto> ActiveInactiveGovernorByIdAsync(Guid governorId, bool isDelete);
       
        /// <summary>
        /// Method is to get all governor list.
        /// </summary>
        /// <returns>list of all governor object.</returns>
        Task<List<ResAddGovernorDto>> GetGovernorListAsync();

        /// <summary>
        /// Method is to hard delete governor.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <returns>Task.</returns>
        Task DeleteGovernorByIdAsync(Guid governorId);

        /// <summary>
        /// Method is to get the individual list with specific state.
        /// </summary>
        /// <param name="state">Name of the perticular state.</param>
        /// <returns>List of the users.</returns>
        Task<List<ResUserDetailsDto>> GetIndividualCountByStateAsync(string state);

        /// <summary>
        /// Merhod is to get the user details with address.
        /// </summary>
        /// <param name="userId">user Id.</param>
        /// <returns>The object of user details with address.</returns>
        Task<ResUserAddressDetailsDto> GetIndividualLocationDetailsAsync(Guid userId);

        /// <summary>
        /// Method to get list of users with consent by country.
        /// </summary>
        /// <param name="country">Country name.</param>
        /// <returns>Count of the individual with state.</returns>
        Task<Dictionary<string, int>> GetListOfIndividualsWithConsentStateWiseByCountryAsync(string country);
    }
}
