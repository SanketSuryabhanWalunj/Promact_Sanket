using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.CompanyDashboard;
using VirtaulAid.DTOs.TerminatedEmployees;
using VirtaulAid.Employee;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Permissions;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{

    [Authorize(Roles = "Company, Individual, Admin, Super Admin")]
    public class CompanyDashboardService : ApplicationService, ICompanyDashboardService
    {
        private readonly IRepository<TerminatedEmployee> _terminatedEmployeeRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;
        private readonly IRepository<Company> _companyRepository;
        private readonly IRepository<Course> _coursesRepository;
        private readonly IRepository<UserDetail> _userDetailRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IMapper _mapper;

        public CompanyDashboardService(IRepository<TerminatedEmployee> terminatedEmployeeRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IRepository<UserCourseEnrollments> userCourseEnrollmentRepository,
            IRepository<Company> companyRepository,
            IRepository<Course> coursesRepository,
            IRepository<UserDetail> userDetailRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IMapper mapper)
        {
            _terminatedEmployeeRepository = terminatedEmployeeRepository;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
            _companyRepository = companyRepository;
            _coursesRepository = coursesRepository;
            _userDetailRepository = userDetailRepository;
            _localizer = localizer;
            _mapper = mapper;
        }

        /// <summary>
        /// Method is to get the terminated employee list.
        /// </summary>
        /// <param name="companyId">Company id that we get the data for.</param>
        /// <returns>Task list of ResTerminatedEmployee.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<List<ResTerminatedEmployee>> GetTerminatedEmployeeListAsync(Guid companyId)
        {
            Company companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == companyId);
            if (companyDetails == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<TerminatedEmployee> terminatedEmployeeList = await _terminatedEmployeeRepository.GetListAsync(x => x.CompanyId == companyId);
            return _mapper.Map<List<ResTerminatedEmployee>>(terminatedEmployeeList);
        }

        /// <summary>
        /// Method is to get the course matric for report section.
        /// </summary>
        /// <param name="companyId">Company id that we get the data for.</param>
        /// <returns>Task list of ResCourseMetricDto.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<List<ResCourseMetricDto>> GetCourseMetricAsync(Guid companyId)
        {
            Company companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == companyId);
            if (companyDetails == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<CourseSubscriptionMapping> courseSubscriptionMappingList = await _courseSubscriptionRepository.GetListAsync(x => x.CompanysId == companyId);
            if (courseSubscriptionMappingList.Count == 0)
                return new List<ResCourseMetricDto>();

            List<DashboardCourseSubscriptionDto> courseSubscriptionList = _mapper.Map<List<DashboardCourseSubscriptionDto>>(courseSubscriptionMappingList);

            List<ResCourseMetricDto> courseMetricList = new();

            // Logic for the calculate the TotalEnrolledCount, count, and Course Expired Count.
            foreach (DashboardCourseSubscriptionDto courseSubscription in courseSubscriptionList)
            {
                ResCourseMetricDto? result = courseMetricList.FirstOrDefault(x => x.CourseId == courseSubscription.CourseId);
                if (result == null)
                {
                    ResCourseMetricDto enrolledCourse = new ResCourseMetricDto
                    {
                        CourseId = courseSubscription.CourseId,
                        EnrolledCount = (courseSubscription.ExpirationDate < DateTime.UtcNow) ? 0 : (courseSubscription.TotalCount - courseSubscription.RemainingCount),
                        CertifiedCount = await _userCourseEnrollmentRepository.CountAsync(c => c.CourseSubscriptionId == courseSubscription.Id && c.Progress == 100 && c.CertificateExpirationDate > DateTime.Today),
                        CourseExpiredCount = (courseSubscription.ExpirationDate > DateTime.UtcNow) ? 0 : (courseSubscription.TotalCount - courseSubscription.RemainingCount)
                    };
                    courseMetricList.Add(enrolledCourse);
                }
                else
                {
                    result.EnrolledCount += (courseSubscription.ExpirationDate < DateTime.UtcNow) ? 0 : (courseSubscription.TotalCount - courseSubscription.RemainingCount);
                    result.CertifiedCount += (await _userCourseEnrollmentRepository.CountAsync(c => c.CourseSubscriptionId == courseSubscription.Id && c.Progress == 100 && c.CertificateExpirationDate > DateTime.Today));
                    result.CourseExpiredCount += (courseSubscription.ExpirationDate > DateTime.UtcNow) ? 0 : (courseSubscription.TotalCount - courseSubscription.RemainingCount);
                }
            }

            // Get the Course Name and assign to enrolledCourseList (Output).
            List<Course> courseList = await _coursesRepository.GetListAsync(x => courseMetricList.Select(b => b.CourseId).Contains(x.Id));
            courseMetricList.ForEach(a =>
            {
                a.CourseName = courseList.First(b => b.Id == a.CourseId).Name;
            });

            return courseMetricList;
        }

        /// <summary>
        /// Method is to count the master data count for report section.
        /// </summary>
        /// <param name="companyId">Company id that we get the data for.</param>
        /// <returns>Task ResMasterCountDto.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        [Authorize(VirtaulAidPermissions.Company.Default)]
        public async Task<ResMasterCountDto> GetReportMasterCountAsync(Guid companyId)
        {
            Company companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == companyId);
            if (companyDetails == null)
            {
                throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            List<ResCourseMetricDto> courseMetricList = await GetCourseMetricAsync(companyId);
            int employeeEnrolledCount = courseMetricList.Select(x => x.EnrolledCount).Sum();
            int certifiedEmployee = courseMetricList.Select(x => x.CertifiedCount).Sum();

            List<UserDetail> userDetails = await _userDetailRepository.GetListAsync(x => x.CurrentCompanyId == companyId);
            List<UserCourseEnrollments> attendingTreaning = await _userCourseEnrollmentRepository.GetListAsync(x => userDetails.Select(s => s.Id).Contains(x.UserId));

            ResMasterCountDto resMasterCountDto = new ResMasterCountDto()
            {
                TotalEmployeesEnrolled = employeeEnrolledCount,
                TotalCertifiedCount = certifiedEmployee,
                TotalNotAttendingTreaning = (userDetails.Count) - (attendingTreaning.Count),
                TotalTerminatedEmployee = (await GetTerminatedEmployeeListAsync(companyId)).Count,
            };

            return resMasterCountDto;
        }
    }
}
