using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.AdminReport;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.DTOs.User;
using VirtaulAid.Employee;
using VirtaulAid.Users;
using Volo.Abp.Data;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;
using VirtaulAid.Companies;
using VirtaulAid.DTOs.Company;
using Volo.Abp.Users;
using System.Runtime.Serialization;
using AutoMapper.Internal.Mappers;

namespace VirtaulAid.DomainServices
{
    public class AdminReportDomainService : DomainService
    {
        private readonly IRepository<UserCourseEnrollments> _userCourseEnrollmentRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleMappingRepository;
        private readonly IRepository<UserDetail> _userDetailsRepository;
        private readonly IRepository<Company> _companyRepository;
        private readonly IRepository<TerminatedEmployee> _terminatedEmployeeRepository;
        private readonly IRepository<LoggedInUser> _loggedInUserRepository;
        private readonly IDataFilter<ISoftDelete> _softDeleteFilter;

        public AppAppsettings _appOptions { get; }

        public AdminReportDomainService(IRepository<UserCourseEnrollments> userCourseEnrollmentRepository,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IOptions<AppAppsettings> appOptions,
            IRepository<UserDetailRoleMapping> userRoleMappingRepository,
            IRepository<UserDetail> userDetailsRepository,
            IRepository<Company> companyRepository,
            IRepository<TerminatedEmployee> terminatedEmployeeRepository,
            IRepository<LoggedInUser> loggedInUserRepository,
            IDataFilter<ISoftDelete> softDeleteFilter)
        {
            _userCourseEnrollmentRepository = userCourseEnrollmentRepository;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _userRoleMappingRepository = userRoleMappingRepository;
            _appOptions = appOptions.Value;
            _userDetailsRepository = userDetailsRepository;
            _companyRepository = companyRepository;
            _terminatedEmployeeRepository = terminatedEmployeeRepository;
            _loggedInUserRepository = loggedInUserRepository;
            _softDeleteFilter = softDeleteFilter;
        }

        /// <summary>
        /// Method is to get the certified Employee count by month.
        /// </summary>
        /// <param name="companyId">Compnay id.</param>
        /// <returns>Retrun the list of ResMonthCountDto with details.</returns>
        public async Task<List<ResMonthCountDto>> CertifiedEmployeeByCompanyIdAsync(Guid companyId)
        {
            var courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => x.CompanysId == companyId);
            if (courseSubscriptionList == null)
                return new List<ResMonthCountDto>();

            var fromDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-(_appOptions.AdminReportInMonth));
            var courseEnrollmentList = await _userCourseEnrollmentRepository.
                GetListAsync(x => courseSubscriptionList.Select(s => s.Id).Contains(x.CourseSubscriptionId) && x.CourseEndDate >= fromDate && x.IsCompleted);
            if (!courseEnrollmentList.Any())
                return new List<ResMonthCountDto>();

            var courseEnrollmentGroupBy = courseEnrollmentList.GroupBy(s => s.CourseEndDate.Month);
            List<ResMonthCountDto> certifiedEmployeeList = GenrateRecordList(_appOptions.AdminReportInMonth);

            foreach (var courseEnrollment in courseEnrollmentGroupBy)
            {
                foreach (var certifiedEmployee in certifiedEmployeeList.Where(x => x.MonthNumber == courseEnrollment.Key))
                {
                    certifiedEmployee.Count = courseEnrollment.ToList().Count;
                }
            }

            return certifiedEmployeeList;
        }

        /// <summary>
        /// Method is to get the count of course purchased by required months.
        /// </summary>
        /// <param name="companyId">Compnay id.</param>
        /// <returns>Retrun the list of ResMonthCountDto with details.</returns>
        public async Task<List<ResMonthCountDto>> CoursePurchasedByCompanyIdAsync(Guid companyId)
        {
            var fromDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-6);
            var courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => x.CompanysId == companyId && x.PurchasedDate >= fromDate);
            if (!courseSubscriptionList.Any())
                return new List<ResMonthCountDto>();

            var courseSubscriptionGroupBy = courseSubscriptionList.GroupBy(s => s.PurchasedDate.Month);
            List<ResMonthCountDto> coursePurchasedList = GenrateRecordList(6);

            foreach (var group in courseSubscriptionGroupBy)
            {
                foreach (var course in coursePurchasedList.Where(x => x.MonthNumber == group.Key))
                {
                    course.Count = group.Sum(x => x.TotalCount);
                }
            }

            return coursePurchasedList;
        }

        /// <summary>
        /// Method is to calculate the employee out of each of month of required. 
        /// </summary>
        /// <param name="companyId">Compnay id.</param>
        /// <returns>Retrun the list of ResMonthCountDto with details.</returns>
        public async Task<List<ResMonthCountDto>> EmployeeCountByCompanyIdAsync(Guid companyId)
        {
            var fromDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-(_appOptions.AdminReportInMonth));
            var todayDate = DateTime.Now;
            var userDetails = await _userDetailsRepository.GetListAsync(x => x.CurrentCompanyId == companyId && x.JoiningDate != null);
            var terminatedEmployeeList = await _terminatedEmployeeRepository.GetListAsync(x => x.CompanyId == companyId && x.TerminationDate >= fromDate);
            if (!(userDetails.Any()) && !(userDetails.Any()))
                return new List<ResMonthCountDto>();

            var userDetailsGroupByList = userDetails.GroupBy(s => s.JoiningDate.Value.Month);
            var terminatedEmployeeGroupBy = terminatedEmployeeList.GroupBy(s => s.TerminationDate.Month);

            List<ResMonthCountDto> employeeHistoryList = GenrateRecordList(_appOptions.AdminReportInMonth);

            foreach (var group in userDetailsGroupByList)
            {
                for (int i = group.Key; i <= todayDate.Month; ++i)
                {
                    foreach (var employee in employeeHistoryList.Where(x => x.MonthNumber == i))
                    {
                        employee.Count += group.ToList().Count;
                    }
                }
            }

            foreach (var group in terminatedEmployeeGroupBy)
            {
                for (int i = group.Key; i >= fromDate.Month; --i)
                {
                    foreach (var employee in employeeHistoryList.Where(x => x.MonthNumber == i))
                    {
                        employee.Count += group.ToList().Count;
                    }
                }
            }

            return employeeHistoryList;
        }

        /// <summary>
        /// Method is to genrate the empty ResMonthCountDto list.
        /// </summary>
        /// <param name="count">Count for the return the list count.</param>
        /// <returns>Return the empty list of ResMonthCountDto.</returns>
        private List<ResMonthCountDto> GenrateRecordList(int count)
        {
            var fromDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-count);
            var currentMonth = DateTime.Now;

            List<ResMonthCountDto> monthList = new();
            for (var i = fromDate; i < currentMonth; i = i.AddMonths(1))
            {
                monthList.Add(new ResMonthCountDto
                {
                    MonthNumber = i.Month,
                    MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(i.Month),
                    Count = 0
                });
            }

            return monthList;
        }

        /// <summary>
        /// Method is to analytics active employee od company.
        /// </summary>
        /// <param name="companyId">Company id for getting the specific record.</param>
        /// <returns>Logged in analytics of company employee.</returns>
        public async Task<ResLoggedInUser> ActiveEmployeeAnalyticsAsync(Guid companyId)
        {
            using (_softDeleteFilter.Disable())
            {
                var employeeList = await _userDetailsRepository.GetListAsync(x => x.CurrentCompanyId == companyId);
                return await GetUserAnalyticsAsync(employeeList);
            }
        }

        /// <summary>
        /// Method is to get the active company analytics.
        /// </summary>
        /// <returns>Logged in analytics for all companies.</returns>
        public async Task<ResLoggedInUser> ActiveCompanyAnalyticsAsync()
        {
            List<Company> companyList = new();
            using (_softDeleteFilter.Disable())
            {
                companyList = await _companyRepository.GetListAsync();
            }

            if (!companyList.Any())
            {
                return new ResLoggedInUser
                {
                    AnalyticsPercentage = "0",
                    LoggedInCount = 0,
                };
            }
            var currentWeekList = await _loggedInUserRepository.GetListAsync(x => companyList.Select(e => e.Id).Contains(x.CompanyId.Value) && x.LoggedIn > DateTime.Now.AddDays(-7));
            var lastWeekList = await _loggedInUserRepository.GetListAsync(x => companyList.Select(e => e.Id).Contains(x.CompanyId.Value) && (x.LoggedIn >= DateTime.Now.AddDays(-14) && x.LoggedIn < DateTime.Now.AddDays(-7)));

            float percentage = (!lastWeekList.Any())
                ? currentWeekList.Any() ? 100 : 0
                : ((float)(currentWeekList.Count - lastWeekList.Count) / (float)lastWeekList.Count) * 100;

            return new ResLoggedInUser
            {
                AnalyticsPercentage = percentage < 0 ?
                percentage < (-100) ? "-100" : percentage.ToString("0")
                : percentage > 100 ? "100" : percentage.ToString("0"),
                LoggedInCount = currentWeekList.Count,
            };
        }

        /// <summary>
        /// Method is to get the active individual analytics.
        /// </summary>
        /// <returns>Logged in analytics of individual users.</returns>
        public async Task<ResLoggedInUser> ActiveIndividualAnalyticsAsync()
        {
            using (_softDeleteFilter.Disable())
            {
                var individualList = await _userDetailsRepository.GetListAsync();
                return await GetUserAnalyticsAsync(individualList);
            }
        }

        /// <summary>
        ///  Method is to prepare analytics of last two week with the help of logging log.
        /// </summary>
        /// <param name="userList">Users list that we are checking the login log.</param>
        /// <returns>Logged in Analytics of usersList.</returns>
        private async Task<ResLoggedInUser> GetUserAnalyticsAsync(List<UserDetail> userList)
        {
            if (!userList.Any())
            {
                return new ResLoggedInUser
                {
                    AnalyticsPercentage = "0",
                    LoggedInCount = 0,
                };
            }

            var currentWeekList = await _loggedInUserRepository.GetListAsync(x => userList.Select(e => e.Id).Contains(x.UserId.Value) && x.LoggedIn > DateTime.Now.AddDays(-7));
            var lastWeekList = await _loggedInUserRepository.GetListAsync(x => userList.Select(e => e.Id).Contains(x.UserId.Value) && (x.LoggedIn >= DateTime.Now.AddDays(-14) && x.LoggedIn < DateTime.Now.AddDays(-7)));

            float getPercentage = (!lastWeekList.Any())
                ? currentWeekList.Any() ? 100 : 0
                : ((float)(currentWeekList.Count - lastWeekList.Count) / (float)lastWeekList.Count) * 100;

            return new ResLoggedInUser
            {
                AnalyticsPercentage = getPercentage < 0 ?
                getPercentage < (-100) ? "-100" : getPercentage.ToString("0")
                : getPercentage > 100 ? "100" : getPercentage.ToString("0"),
                LoggedInCount = currentWeekList.Count,
            };
        }

        /// <summary>
        /// Method is to get the certfied user history.
        /// </summary>
        /// <param name="fromDate">Fetch record from this date.</param>
        /// <param name="toDate">Fetch record to this date.</param>
        /// <returns>History of certified user seprated in month.</returns>
        public async Task<ResYearlyReportDto> CertifiedUserByYearAsync(DateTime fromDate, DateTime toDate)
        {

            var courseEnrollmentList = await _userCourseEnrollmentRepository.
               GetListAsync(x => x.CourseEndDate >= fromDate && x.CourseEndDate <= toDate && x.IsCompleted);
            if (!courseEnrollmentList.Any())
                return new ResYearlyReportDto();

            var courseEnrollmentGroupBy = courseEnrollmentList.GroupBy(s => s.CourseEndDate.Month);
            List<ResMonthCountDto> certifiedEmployeeList = GenrateMonthList(12);

            foreach (var group in courseEnrollmentGroupBy)
            {
                foreach (var certifiedEmployee in certifiedEmployeeList.Where(x => x.MonthNumber == group.Key))
                {
                    certifiedEmployee.Count = group.ToList().Count;
                }
            }

            return new ResYearlyReportDto
            {
                TotalCount = courseEnrollmentList.Count,
                MonthCountList = certifiedEmployeeList
            };
        }

        /// <summary>
        /// Method is to get the course purchased history.
        /// </summary>
        /// <param name="fromDate">Fetch record from this date.</param>
        /// <param name="toDate">Fetch record to this date.</param>
        /// <returns>History of course purched seprated by month.</returns>
        public async Task<List<ResMonthCountDto>> CoursePurchasedByYearAsync(DateTime fromDate, DateTime toDate)
        {
            var courseSubscriptionList = await _courseSubscriptionRepository.GetListAsync(x => x.PurchasedDate >= fromDate && x.PurchasedDate <= toDate);
            if (!courseSubscriptionList.Any())
                return new List<ResMonthCountDto>();

            var courseSubscriptionGroupBy = courseSubscriptionList.GroupBy(s => s.PurchasedDate.Month);
            List<ResMonthCountDto> coursePurchasedList = GenrateMonthList(12);

            foreach (var group in courseSubscriptionGroupBy)
            {
                foreach (var course in coursePurchasedList.Where(x => x.MonthNumber == group.Key))
                {
                    course.Count = group.Sum(x => x.TotalCount);
                }
            }

            return coursePurchasedList;
        }

        /// <summary>
        /// Method is to get the new user history.
        /// </summary>
        /// <param name="fromDate">Fetch record from this date.</param>
        /// <param name="toDate">Fetch record to this date.</param>
        /// <returns>History of new users added seprated by month.</returns>
        public async Task<ResYearlyReportDto> UserCountByYearAsync(DateTime fromDate, DateTime toDate)
        {
            List<UserDetail> userList = new();

            using (_softDeleteFilter.Disable())
            {
                userList = await _userDetailsRepository.GetListAsync(x => x.CreationTime >= fromDate && x.CreationTime <= toDate);
            }

            if (!userList.Any())
                return new ResYearlyReportDto();

            var userListGroupBy = userList.GroupBy(s => s.CreationTime.Month);
            List<ResMonthCountDto> userListByMonth = GenrateMonthList(12);

            foreach (var group in userListGroupBy)
            {
                foreach (var course in userListByMonth.Where(x => x.MonthNumber == group.Key))
                {
                    course.Count = group.ToList().Count;
                }
            }

            return new ResYearlyReportDto
            {
                TotalCount = userList.Count,
                MonthCountList = userListByMonth
            };
        }

        /// <summary>
        /// Method is to get the user consent count by year.
        /// </summary>
        /// <param name="fromDate">Fetch record from this date.</param>
        /// <param name="toDate">Fetch record to this date.</param>
        /// <returns>Count of total certified user and give the consent for share the his/her data.</returns>
        public async Task<ResUserPermissionDto> EmployeePermissionByYearAsync(DateTime fromDate, DateTime toDate)
        {
            var courseEnrollmentList = await _userCourseEnrollmentRepository.
                           GetListAsync(x => x.CourseEndDate >= fromDate && x.CourseEndDate <= toDate && x.IsCompleted);
            int userConsentCount;

            using (_softDeleteFilter.Disable())
            {
                userConsentCount = await _userDetailsRepository
                .CountAsync(x => (courseEnrollmentList.Select(u => u.UserId).Contains(x.Id)) && x.ConsentToShareData);
            }

            return new ResUserPermissionDto
            {
                TotalUser = courseEnrollmentList.Count,
                ConsentCount = userConsentCount
            };
        }

        /// <summary>
        /// Method is to genrate the empty ResMonthCountDto list.
        /// </summary>
        /// <param name="count">Count for the return the list of object.</param>
        /// <returns>Return the empty list of month object.</returns>
        private List<ResMonthCountDto> GenrateMonthList(int count)
        {
            List<ResMonthCountDto> monthList = new();
            for (int i = 1; i <= count; i++)
            {
                monthList.Add(new ResMonthCountDto
                {
                    MonthNumber = i,
                    MonthName = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(i),
                    Count = 0
                });
            }

            return monthList;
        }

        /// <summary>
        ///  Method is to get analytics of last two week for pending request of companies.
        /// </summary>
        /// <returns>Companies analytics of pending request.</returns>
        public async Task<CompanyPendingRequestAnalyticsDto> GetPendingCompaniesAnalyticsAsync()
        {
            var pendingRequestCount = await _companyRepository.GetListAsync(x => x.IsVerified == false || x.IsVerified == null);
            var currentWeekList = await _companyRepository.GetListAsync(x => (x.IsVerified == false || x.IsVerified == null) && x.CreationTime > DateTime.Now.AddDays(-7));
            var lastWeekList = await _companyRepository.GetListAsync(x => (x.IsVerified == false || x.IsVerified == null) && x.CreationTime >= DateTime.Now.AddDays(-14) && x.CreationTime < DateTime.Now.AddDays(-7));

            float getPercentage = (!lastWeekList.Any())
                ? currentWeekList.Any() ? 100 : 0
                : ((float)(currentWeekList.Count - lastWeekList.Count) / (float)lastWeekList.Count) * 100;

            return new CompanyPendingRequestAnalyticsDto
            {
                AnalyticsPercentage = getPercentage < 0 ?
                getPercentage < (-100) ? "-100" : getPercentage.ToString("0")
                : getPercentage > 100 ? "100" : getPercentage.ToString("0"),
                PendingRequestCount = pendingRequestCount.Count,
            };
        }

        /// <summary>
        /// Method to get admin and super admins list.
        /// </summary>
        /// <returns>List of admin and super admins.</returns>
        public async Task<IList<UserDetail>> GetAdminAndSuperAdminListAsync()
        {
            IQueryable<UserDetailRoleMapping> userRoleMappings = await _userRoleMappingRepository.WithDetailsAsync(x => x.Roledetail);
            List<Guid> adminUserIds = userRoleMappings.Where(x => (x.Roledetail.Name == "Admin" || x.Roledetail.Name == "Super Admin")).Select(x => x.UserId).ToList();
            IQueryable<UserDetail> adminListAsync = await _userDetailsRepository.GetQueryableAsync();
            List<UserDetail> adminList = adminListAsync.Where(e => adminUserIds.Contains(e.Id)).ToList();
            return adminList;
        }
    }
}
