using Amazon.SimpleEmail.Model;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Employee;
using VirtaulAid.Employee;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Permissions;
using VirtaulAid.Users;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Data;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{

    [Authorize(Roles = "Company, Admin, Super Admin")]
    public class CompanyEmployee : ApplicationService, ICompanyEmployee
    {
        private readonly IRepository<Company> _companies;
        private readonly IRepository<UserDetail> _userDetails;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailService _emailService;
        private readonly IRepository<TerminatedEmployee> _terminatedEmployee;
        private readonly ITemplateAppService _templateAppService;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IDataFilter<ISoftDelete> _softDeleteFilter;
        private readonly CourseDomainService _courseDomainService;

        public CompanyEmployee(IRepository<Company> companies, IRepository<UserDetail> userDetails, IMapper mapper,
                  IHttpContextAccessor httpContextAccessor,
                  IEmailService emailService,
                  IRepository<TerminatedEmployee> terminatedEmployee,
                  ITemplateAppService templateAppService,
                  IStringLocalizer<VirtaulAidResource> localizer,
                  CourseDomainService courseDomainService,
                  IDataFilter<ISoftDelete> softDeleteFilter)
        {
            _companies = companies;
            _userDetails = userDetails;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _emailService = emailService;
            _terminatedEmployee = terminatedEmployee;
            _templateAppService = templateAppService;
            _localizer = localizer;
            _courseDomainService = courseDomainService;
            _softDeleteFilter = softDeleteFilter;
        }

        /// <summary>
        /// Method to terminate a employee from a company.
        /// </summary>
        /// <returns>String message.</returns>
        [Authorize(VirtaulAidPermissions.Employee.Delete)]
        public async Task<string> DeleteEmployee(Guid employeeId, string culture)
        {
            Company? company = await GetCurrentCompanyAsync();
            if (company == null)
            {
                throw new UserFriendlyException(_localizer["AuthorizatioError"], StatusCodes.Status401Unauthorized.ToString());
            }
            Guid companyId = company.Id;
            UserDetail? employee = await _userDetails.FirstOrDefaultAsync(u => u.Id == employeeId);
            if (employee == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            if (employee.CurrentCompanyId == companyId)
            {
                DateTime? joiningDate = employee.JoiningDate;
                employee.CurrentCompanyId = null;
                employee.JoiningDate = null;
                await _userDetails.UpdateAsync(employee, autoSave: true);

                //send termination mail to the employee
                string toEmail = employee.Email;
                // Get the SES template content
                string templateName = _localizer["DesignedTerminationTemplate"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                string name = $"{employee.FirstName} {employee.LastName}";
                string emailBody = emailTemplateContent.HtmlPart;
                // Replace placeholders with actual data
                emailBody = emailBody.Replace("$$NAME$$", name);
                await _emailService.SendEmailAsync(toEmail, emailBody, "Termination Mail");

                TerminatedEmployee terminatedEmployee = new TerminatedEmployee
                {
                    CompanyId = companyId,
                    UserId = employeeId,
                    JoiningDate = joiningDate,
                    TerminationDate = DateTime.Now,
                    EmployeeEmail = employee.Email,
                    EmployeeName = employee.FirstName + " " + employee.LastName
                };

                await _terminatedEmployee.InsertAsync(terminatedEmployee, autoSave: true);

                return _localizer["UserDeleted"];
            }

            throw new UserFriendlyException(_localizer["UserNotInOrganization"], StatusCodes.Status403Forbidden.ToString());

        }

        /// <summary>
        /// Method to get all the employees of a company.
        /// </summary>
        /// <returns>List<ResAllEmployeeDto></returns>
        [Authorize(VirtaulAidPermissions.Employee.Default)]
        public async Task<List<ResAllEmployeeDto>> GetAllEmployees(Guid companyId)
        {
            using (_softDeleteFilter.Disable())
            {
                List<UserDetail> allUsers = await _userDetails.GetListAsync(x => x.CurrentCompanyId == companyId);
                List<ResAllEmployeeDto> allEmployees = new List<ResAllEmployeeDto>();
                foreach (UserDetail user in allUsers)
                {
                    ICollection<Courses.Course> totalCoursesEnrolledByUser = await _courseDomainService.GetAllEnrolledCoursesByUserIdAsync(user.Id.ToString());
                    int totalCourseCount = totalCoursesEnrolledByUser.Count;
                    ResAllEmployeeDto obj = _mapper.Map<ResAllEmployeeDto>(user);
                    obj.TotalCourses = totalCourseCount;
                    allEmployees.Add(obj);
                }

                List<TerminatedEmployee> terminatedEmployees = await _terminatedEmployee.ToListAsync();
                foreach (TerminatedEmployee user in terminatedEmployees)
                {
                    if (user.CompanyId == companyId)
                    {
                        UserDetail? currentUser = await _userDetails.FirstOrDefaultAsync(c => c.Id == user.UserId);
                        if (currentUser != null)
                        {
                            Guid? currentCompanyId = currentUser.CurrentCompanyId;
                            int indexOfSpace = user.EmployeeName.IndexOf(" ");
                            ICollection<Courses.Course> totalCoursesEnrolledByUser = await _courseDomainService.GetAllEnrolledCoursesByUserIdAsync(user.UserId.ToString());
                            int totalCourseCount = totalCoursesEnrolledByUser.Count;

                            ResAllEmployeeDto obj = new ResAllEmployeeDto
                            {
                                Id = user.UserId,
                                FirstName = user.EmployeeName.Substring(0, indexOfSpace),
                                LastName = user.EmployeeName.Substring(indexOfSpace + 1),
                                Email = user.EmployeeEmail,
                                CurrentCompanyId = currentCompanyId,
                                TotalCourses = totalCourseCount,
                                Address1 = currentUser.Address1,
                                Address2 = currentUser.Address2,
                                Address3 = currentUser.Address3,
                                City = currentUser.City,
                                State = currentUser.State,
                                Country = currentUser.Country,
                                ContactNumber = currentUser.ContactNumber,
                                Postalcode = currentUser.Postalcode
                            };
                            ResAllEmployeeDto? existEmployeeInList = allEmployees.FirstOrDefault(x => x.Email == obj.Email);
                            if (existEmployeeInList == null)
                            {
                                allEmployees.Add(obj);
                            }
                        }
                    }
                }
                return allEmployees;
            }
        }

        /// <summary>
        /// Method to re-assign user to a company.
        /// </summary>
        /// <param name="companyId">Id of the company.</param>
        /// <param name="userId">id of the user.</param>
        /// <returns>Employee details.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        [Authorize(VirtaulAidPermissions.Employee.Edit)]
        public async Task<ResAllEmployeeDto> ReassignEmployeeToCompanyByIdAsync(Guid companyId, Guid userId)
        {
            UserDetail? userDetails = await _userDetails.FirstOrDefaultAsync(x => x.Id == userId);
            if (userDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            else
            {
                // We are not considering if user already in other compnay. Irrespective of that it will get assign to this company.
                userDetails.CurrentCompanyId = companyId;
                userDetails.JoiningDate = DateTime.Now;
                await _userDetails.UpdateAsync(userDetails);
            }

            return _mapper.Map<ResAllEmployeeDto>(userDetails);
        }

        /// <summary>
        /// Method to get current logged in company.
        /// </summary>
        /// <returns>Company</returns>
        private async Task<Company> GetCurrentCompanyAsync()
        {
            HttpContext? httpContext = _httpContextAccessor.HttpContext;

            if (httpContext == null)
            {
                // Handle the case when HttpContext is not available.
                return null;
            }

            ClaimsPrincipal user = httpContext.User;
            Claim? emailClaim = user.FindFirst("UserEmail");

            if (emailClaim != null)
            {
                Company? company = await _companies.FirstOrDefaultAsync(x => x.Email == emailClaim.Value);
                if (company != null)
                {
                    return company;
                }
            }
            return null;
        }
    }
}
