using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Localization;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class CompanyService : DomainService
    {
        private readonly IRepository<Company> _companyRepository;
        private readonly IDataFilter _dataFilter;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly EmailOtpService _emailOtpService;

        public CompanyService(IRepository<Company> companyRepository,
            IDataFilter dataFilter,
            IStringLocalizer<VirtaulAidResource> localizer,
            EmailOtpService emailOtpService)
        {
            _companyRepository = companyRepository;
            _dataFilter = dataFilter;
            _localizer = localizer;
            _emailOtpService = emailOtpService;
        }

        /// <summary>
        /// Method is to check Email Id is present or Not.
        /// </summary>
        /// <param name="email">email id to check.</param>
        /// <returns>Task Bool.</returns>
        public async Task<bool> IsCompanyEmailPresentAsync(string email)
        {
            var result = await _companyRepository.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
            return !(result == null);
        }

        /// <summary>
        /// Method is to check company Email Id is present or Not, using soft delete.
        /// </summary>
        /// <param name="email">email id to check.</param>
        /// <returns>Task Bool.</returns>
        public async Task<bool> IsSoftDeleteCompanyAsync(string email)
        {
            using (_dataFilter.Disable<ISoftDelete>())
            {
                var result = await _companyRepository.FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
                return !(result == null);
            }
        }

        /// <summary>
        /// Method to activate or inactivate company by id.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="isActive">True if active, otherwise false.</param>
        /// <returns>Updated company details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        public async Task<Company> ActivateOrInactivateCompanyByIdAsync(Guid companyId, bool isActive)
        {
            using (_dataFilter.Disable<ISoftDelete>())
            {
                var updatedCompanyDetail = new Company();
                if (companyId != Guid.Empty)
                {
                    updatedCompanyDetail = await _companyRepository.FirstOrDefaultAsync(x => x.Id == companyId);
                    if (updatedCompanyDetail != null)
                    {
                        updatedCompanyDetail.IsDeleted = isActive;
                        updatedCompanyDetail = await _companyRepository.UpdateAsync(updatedCompanyDetail);
                        return updatedCompanyDetail;
                    }
                }
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
        }

        /// <summary>
        /// Method to accept or reject company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="isActive">True if accpeted, otherwise false.</param>
        /// <returns>Updated company details.</returns>
        /// <exception cref="UserFriendlyException">If user does not exist.</exception>
        public async Task<Company> AcceptOrRejectCompanyByIdAsync(Guid companyId, bool isActive, string culture)
        {
            using (_dataFilter.Disable<ISoftDelete>())
            {
                var updatedCompanyDetail = new Company();
                if (companyId != Guid.Empty)
                {
                    updatedCompanyDetail = await _companyRepository.FirstOrDefaultAsync(x => x.Id == companyId);
                    if (updatedCompanyDetail != null)
                    {
                        if (updatedCompanyDetail.IsDeleted != null && updatedCompanyDetail.IsDeleted)
                        {
                            throw new UserFriendlyException(_localizer["CompanyAlreadyRejected"], StatusCodes.Status403Forbidden.ToString());
                        }
                        else if (updatedCompanyDetail.IsVerified != null && (bool)updatedCompanyDetail.IsVerified)
                        {
                            throw new UserFriendlyException(_localizer["CompanyAlreadyAccepted"], StatusCodes.Status403Forbidden.ToString());
                        }
                        else
                        {
                            if (isActive)
                            {
                                // Company is accepted.
                                updatedCompanyDetail.IsVerified = isActive;
                                updatedCompanyDetail.IsDeleted = !isActive;
                                string templateName = _localizer["AcceptanceEmailTemplate"];
                                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                                {
                                    templateName = templateName + "_" + culture;
                                }
                                await _emailOtpService.SendEmailForAcceptanceAndRejectionAsync(updatedCompanyDetail.Email, updatedCompanyDetail.CompanyName, templateName);
                            }
                            else
                            {
                                // Company is rejected.
                                updatedCompanyDetail.IsDeleted = !isActive;
                                updatedCompanyDetail.IsVerified = isActive;
                                string templateName = _localizer["RejectionEmailTemplate"];
                                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                                {
                                    templateName = templateName + "_" + culture;
                                }
                                await _emailOtpService.SendEmailForAcceptanceAndRejectionAsync(updatedCompanyDetail.Email, updatedCompanyDetail.CompanyName, templateName);
                            }

                        }
                        updatedCompanyDetail = await _companyRepository.UpdateAsync(updatedCompanyDetail);
                        return updatedCompanyDetail;
                    }
                }
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
        }

        /// <summary>
        /// Method to check company exist or not.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>True if exist otherwise not.</returns>
        public async Task<bool> IsCompanyExistByCompanyId(string companyId)
        {
            var company = await _companyRepository.FirstOrDefaultAsync(x => x.Id == Guid.Parse(companyId));
            return company != null;
        }

        /// <summary>
        /// Method to get company details by company email id.
        /// </summary>
        /// <param name="emailId">Id of the company.</param>
        /// <returns>Company details.</returns>
        public async Task<Company> GetCompanyDetailsByEmailIdAsync(string emailId)
        {
            var company = await _companyRepository.FirstOrDefaultAsync(x => x.Email.Equals(emailId));
            return company;
        }
    }
}
