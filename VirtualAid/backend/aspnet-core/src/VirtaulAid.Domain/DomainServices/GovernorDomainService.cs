using VirtaulAid.Users;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Governor;
using AutoMapper;
using Microsoft.Extensions.Localization;
using VirtaulAid.Localization;
using VirtaulAid.Roles;
using System;
using Volo.Abp.Domain.Services;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Collections.Generic;
using VirtaulAid.DTOs.User;

namespace VirtaulAid.DomainServices
{
    public class GovernorDomainService : DomainService
    {
        private readonly IDataFilter<ISoftDelete> _softDeleteFilter;
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleMappingRepository;
        private readonly IRepository<Role> _roleRepository;
        private readonly IMapper _mapper;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly UserService _userService;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollment;
        private readonly CompanyService _companyService;

        public GovernorDomainService(IDataFilter<ISoftDelete> softDeleteFilter,
            IRepository<UserDetail> userRepository,
            IRepository<UserDetailRoleMapping> userRoleMappingRepository,
            IMapper mapper,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<Role> roleRepository,
            UserService userService,
            IRepository<UserCourseEnrollments> userCourseEnrollment,
            CompanyService companyService)
        {
            _softDeleteFilter = softDeleteFilter;
            _userRepository = userRepository;
            _userRoleMappingRepository = userRoleMappingRepository;
            _mapper = mapper;
            _localizer = localizer;
            _roleRepository = roleRepository;
            _userService = userService;
            _userCourseEnrollment = userCourseEnrollment;
            _companyService = companyService;
        }

        /// <summary>
        /// Method is to add the governor details.
        /// </summary>
        /// <param name="reqGovernorModel">Request dto with the all feilds.</param>
        /// <returns>Added new governor object.</returns>
        /// <exception cref="UserFriendlyException">Email is exist.</exception>
        public async Task<ResAddGovernorDto> AddGovernorAsync(ReqAddGovernorDto reqGovernorModel)
        {
            bool isEmailpresent = await _userService.IsSoftDeleteUserAsync(reqGovernorModel.Email) || await _companyService.IsSoftDeleteCompanyAsync(reqGovernorModel.Email);
            if (isEmailpresent)
            {
                throw new UserFriendlyException(_localizer["EmailExist"], StatusCodes.Status409Conflict.ToString());
            }

            UserDetail userGovDetail = _mapper.Map<UserDetail>(reqGovernorModel);
            userGovDetail = await _userRepository.InsertAsync(userGovDetail, true);

            Role roleDetails = await _roleRepository.FirstAsync(x => x.Name == "Governor");
            UserDetailRoleMapping userRoleDetails = new UserDetailRoleMapping
            {
                UserId = userGovDetail.Id,
                RoleId = roleDetails.Id,
            };

            await _userRoleMappingRepository.InsertAsync(userRoleDetails, true);
            return _mapper.Map<ResAddGovernorDto>(userGovDetail);
        }

        /// <summary>
        /// Method is to get the governor details by id.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <returns>Governor object.</returns>
        /// <exception cref="UserFriendlyException">User is not extist.</exception>
        public async Task<ResAddGovernorDto> GetGovernorByIdAsync(Guid governorId)
        {
            UserDetail governorDetail = await GovernorByIdAsync(governorId);
            if (governorDetail == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            return _mapper.Map<ResAddGovernorDto>(governorDetail);
        }

        /// <summary>
        /// Method is to update the governor details.
        /// </summary>
        /// <param name="updateGovernorModel">Object with updated values.</param>
        /// <returns>Updated object.</returns>
        /// <exception cref="UserFriendlyException">User not exist.</exception>
        public async Task<ResAddGovernorDto> UpdateGovernorAsync(ReqUpdateGovernorDto updateGovernorModel)
        {
            UserDetail governorDetail = await GovernorByIdAsync(updateGovernorModel.Id);
            if (governorDetail == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            UserDetail updatedGovernorDetail = _mapper.Map<ReqUpdateGovernorDto, UserDetail>(updateGovernorModel, governorDetail);
            updatedGovernorDetail = await _userRepository.UpdateAsync(updatedGovernorDetail, true);
            return _mapper.Map<ResAddGovernorDto>(updatedGovernorDetail);
        }

        /// <summary>
        /// Method is to get all governor list.
        /// </summary>
        /// <returns>list of all governor object.</returns>
        public async Task<List<ResAddGovernorDto>> GetListGovernorAsync()
        {
            Role roleDetails = await _roleRepository.FirstAsync(x => x.Name == "Governor");
            List<UserDetailRoleMapping> userRoleMapping = await _userRoleMappingRepository.GetListAsync(x => x.RoleId == roleDetails.Id);
            using (_softDeleteFilter.Disable())
            {
                List<UserDetail> userDetailsList = await _userRepository.GetListAsync(x => userRoleMapping.Select(u => u.UserId).Contains(x.Id));
                return _mapper.Map<List<ResAddGovernorDto>>(userDetailsList);
            }
        }

        /// <summary>
        /// Method is to active or inactive governor.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <param name="isDelete">If true then inactive and respectavly.</param>
        /// <returns>Modified user object.</returns>
        /// <exception cref="UserFriendlyException">User not exist.</exception>
        public async Task<ResAddGovernorDto> ActiveInactiveGovernor(Guid governorId, bool isDelete)
        {
            UserDetail governorDetail = await GovernorByIdAsync(governorId);
            if (governorDetail == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            if (governorDetail.IsDeleted != isDelete)
            {
                governorDetail.IsDeleted = isDelete;
                governorDetail = await _userRepository.UpdateAsync(governorDetail, true);
            }
            return _mapper.Map<ResAddGovernorDto>(governorDetail);
        }

        /// <summary>
        /// Method is to hard delete governor.
        /// </summary>
        /// <param name="governorId">Governor id.</param>
        /// <returns>Task.</returns>
        public async Task DeleteGovernorAsync(Guid governorId)
        {
            using (_softDeleteFilter.Disable())
            {
                await _userRoleMappingRepository.DeleteDirectAsync(x => x.Id == governorId);
                await _userRepository.DeleteDirectAsync(x => x.Id == governorId);
            }
        }

        /// <summary>
        /// Method to get list of users with consent by country.
        /// </summary>
        /// <param name="country">Country name.</param>
        /// <returns>List of the individual with state.</returns>
        public async Task<Dictionary<string, int>> GetListOfIndividualsWithConsentStateWiseByCountryAsync(string country)
        {
            Role roleDetails = await _roleRepository.FirstAsync(x => x.Name == "Individual");
            List<UserDetailRoleMapping> userRoleMapping = await _userRoleMappingRepository.GetListAsync(x => x.RoleId == roleDetails.Id);
            using (_softDeleteFilter.Disable())
            {
                List<UserDetail> userDetailsList = await _userRepository.GetListAsync(x => x.ConsentToShareData && x.Country != null && x.Country.ToLower() == country.ToLower());
                List<UserCourseEnrollments> allCoursesEnrolledList = await _userCourseEnrollment.GetListAsync(x => userDetailsList.Select(u => u.Id).Contains(x.UserId));
                List<UserDetail> finalUserDetailsList = new();
                foreach (UserDetail userDetails in userDetailsList)
                {
                    List<UserCourseEnrollments> CoursesEnrolledListOfUser = allCoursesEnrolledList.FindAll(x => x.UserId == userDetails.Id && (x.CertificateExpirationDate != null && x.CertificateExpirationDate <= DateTime.Today));
                    if (CoursesEnrolledListOfUser.Any())
                    {
                        finalUserDetailsList.Add(userDetails);
                    }
                }

                List<UserDetailsDto> userDetailsDtoList = _mapper.Map<List<UserDetailsDto>>(finalUserDetailsList);
                Dictionary<string?, int> statewiseUsers = userDetailsDtoList.GroupBy(x => x.State).ToDictionary(
                        x => x.Key,
                        x => x.Count()
                    );

                return statewiseUsers;
            }
        }

        /// <summary>
        /// Method is to get the individual list with specific state.
        /// </summary>
        /// <param name="state">Name of the perticular state.</param>
        /// <returns>List of the users.</returns>
        public async Task<List<ResUserDetailsDto>> IndividualCountByStateAsync(string state)
        {
            using (_softDeleteFilter.Disable())
            {
                List<UserDetail> userDetailsList = await _userRepository.GetListAsync(x => x.State.ToLower() == state.ToLower() && x.ConsentToShareData);
                List<UserCourseEnrollments> allCoursesEnrolledList = await _userCourseEnrollment.GetListAsync(x => userDetailsList.Select(u => u.Id).Contains(x.UserId));
                List<UserDetail> finalUserDetailsList = new();
                foreach (UserDetail userDetails in userDetailsList)
                {
                    List<UserCourseEnrollments> allCoursesEnrolledByUser = allCoursesEnrolledList.FindAll(x => x.UserId == userDetails.Id && (x.CertificateExpirationDate != null && x.CertificateExpirationDate <= DateTime.Today));
                    if (allCoursesEnrolledByUser.Any())
                    {
                        finalUserDetailsList.Add(userDetails);
                    }
                }
                return _mapper.Map<List<ResUserDetailsDto>>(finalUserDetailsList);
            }
        }

        /// <summary>
        /// Merhod is to get the user details with address.
        /// </summary>
        /// <param name="userId">user Id.</param>
        /// <returns>The object of user details with address.</returns>
        public async Task<ResUserAddressDetailsDto> IndividualLocationDetailsAsync(Guid userId)
        {
            using (_softDeleteFilter.Disable())
            {
                UserDetail userDetails = await _userRepository.FirstAsync(x => x.Id == userId);
                return _mapper.Map<ResUserAddressDetailsDto>(userDetails);
            }

        }

        /// <summary>
        /// Method is to get the governor details.
        /// </summary>
        /// <param name="id">Governor id.</param>
        /// <returns>Object of governor.</returns>
        private async Task<UserDetail> GovernorByIdAsync(Guid id)
        {
            using (_softDeleteFilter.Disable())
            {
                return await _userRepository.FirstOrDefaultAsync(x => x.Id == id);
            }
        }

    }
}
