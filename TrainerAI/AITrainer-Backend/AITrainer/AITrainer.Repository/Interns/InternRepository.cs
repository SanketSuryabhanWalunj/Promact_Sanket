using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.DomainModel;
using Microsoft.AspNetCore.Identity;
using AITrainer.AITrainer.Core.Dto.Intern;
using Microsoft.EntityFrameworkCore;
using AITrainer.Services;
using System.Security.Claims;
using System.Xml.Linq;
using Microsoft.AspNetCore.Http.HttpResults;
using AITrainer.AITrainer.Util;
using System.Linq;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;
using Microsoft.OpenApi.Services;
using Microsoft.Extensions.Configuration;
using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Repository.CareerPaths;

namespace AITrainer.AITrainer.Repository.Interns
{
    public class InternRepository : IInternRepository
    {
        #region Dependencies
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;
        private readonly ICareerPathRepository _careerPathRepository;
        #endregion
        #region Constructors 
        public InternRepository(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager, IHttpContextAccessor contextAccessor, IConfiguration configuration, ICareerPathRepository careerPathRepository)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _roleManager = roleManager;
            _contextAccessor = contextAccessor;
            _configuration = configuration;
            _emailService = new EmailService(configuration);
            _careerPathRepository = careerPathRepository;

        }
        #endregion
        #region Private methods


        /// <summary>
        /// Checks if the course associated with the internship is in progress based on the current date.
        /// </summary>
        /// <param name="internship">The internship to check.</param>
        /// <param name="currentDate">The current date.</param>
        /// <param name="courses">The list of courses.</param>
        /// <returns>
        /// Returns true if the course associated with the internship is in progress, otherwise returns false.
        /// </returns>
        private bool IsCourseInProgress(Internship internship, DateTime currentDate, List<Course> courses)
        {
            var course = courses.FirstOrDefault(c => c.Id == internship.CourseId);
            if (course == null)
            {
                return false; // Course not found
            }
            if (internship.StartDate > currentDate)
            {
                return false; // The course hasn't started yet
            }
            DateTime endDate;
            if (course.DurationType == "Days")
            {
                endDate = internship.StartDate.AddDays(course.Duration);
            }
            else if (course.DurationType == "Weeks")
            {
                endDate = internship.StartDate.AddDays(course.Duration * 7);
            }
            else
            {
                return false; // Invalid duration type
            }
            return endDate >= currentDate;
        }


        /// <summary>
        /// Checks if the course associated with the internship is upcoming based on the current date.
        /// </summary>
        /// <param name="internship">The internship to check.</param>
        /// <param name="currentDate">The current date.</param>
        /// <param name="courses">The list of courses.</param>
        /// <returns>
        /// Returns true if the course associated with the internship is upcoming, otherwise returns false.
        /// </returns>
        private bool IsCourseUpcoming(Internship internship, DateTime currentDate, List<Course> courses)
        {
            var course = courses.FirstOrDefault(c => c.Id == internship.CourseId);
            if (course == null)
            {
                return false; // Course not found
            }
            return internship.StartDate > currentDate;
        }
        #endregion
        #region Public methods


        /// <summary>
        /// Counts the number of interns associated with the current admin's organization.
        /// </summary>
        /// <returns> Returns the count of interns associated with the organization. </returns>
        public async Task<int> Count()
        {
            var adminId = _contextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminOrganization = await _dbContext.Admin.FirstOrDefaultAsync(i => i.UserId == adminId);
            var admins = await _dbContext.Admin.Where(i => i.OrganizationId == adminOrganization.OrganizationId).ToListAsync();
            var interns = _dbContext.Intern
                         .Where(i => admins.Select(admin => admin.UserId).Contains(i.CreatedBy))
                         .Where(i => !i.IsDeleted).Count();
            return interns;
        }


        /// <summary>
        /// Creates a new intern asynchronously.
        /// </summary>
        /// <param name="info">Details of the intern to be created.</param>
        /// <param name="Id">The ID of the user creating the intern.</param>
        /// <returns> Returns the newly created intern if successful. </returns>
        public async Task<Intern> CreateInternAsync(InternDetails info, string Id)
        {
            var existingIntern = await _userManager.FindByEmailAsync(info.Email);
            CareerPath careerPath = await _careerPathRepository.GetCareerPathByIdAsync(info.CareerPath);
            if (existingIntern == null)
            {
                ApplicationUser user = new ApplicationUser
                {
                    UserName = info.Email,
                    Email = info.Email,
                    FirstName = info.FirstName,
                    LastName = info.LastName,
                    isDeleted = false,
                };
                string password = PasswordGenerator.GeneratePassword();

                IdentityResult result = await _userManager.CreateAsync(user, password);
                string encodedPassword = PasswordGenerator.EncodeToken(password);
                string createPasswordLink = await CreatePasswordLink(encodedPassword, user.Id);
                if (result.Succeeded)
                {
                    string subject = EmailSubjects.InternshipInvitationSubject;
                    string emailBody = EmailTemplates.GenerateCreateInternEmail(user.FirstName, user.LastName, createPasswordLink);
                    await _emailService.SendEmailAsync(user.Email, subject, emailBody);
                    Intern newIntern = new Intern
                    {
                        Id = Guid.NewGuid().ToString(),
                        Email = info.Email,
                        FirstName = info.FirstName,
                        LastName = info.LastName,
                        CareerPathId = info.CareerPath,
                        BatchId = info.BatchId,
                        CreatedDate = DateTime.UtcNow,
                        UpdatedDate = DateTime.UtcNow,
                        CreatedBy = Id,
                        UserId = user.Id,
                        IsDeleted = false,
                        CareerPath = careerPath
                    };
                    await _dbContext.Intern.AddAsync(newIntern);
                    await _dbContext.SaveChangesAsync();

                    await _userManager.AddToRoleAsync(user, "Intern");
                    return newIntern;
                }
                else
                {
                    throw new InvalidOperationException("User creation failed.");
                }
            }
            else
            {
                throw new InternException(string.Format("Intern already exists", info.Email));
            }
        }


        /// <summary>
        /// Retrieves an intern asynchronously based on the intern ID.
        /// </summary>
        /// <param name="internId">The ID of the intern to retrieve.</param>
        /// <returns> Returns the intern if found, otherwise returns null. </returns>
        public async Task<Intern> GetInternAsync(string internId)
        {
            var result = await _dbContext.Intern.Include(i => i.CareerPath).FirstOrDefaultAsync(i => i.UserId == internId);
     
            if (result == null)
            {
                result = await _dbContext.Intern.Include(i => i.CareerPath).FirstOrDefaultAsync(i => i.Id == internId);
            }
            return result;
        }


        /// <summary>
        /// Retrieves a list of interns asynchronously with details about their courses.
        /// </summary>
        /// <param name="firstIndex">The starting index for pagination.</param>
        /// <param name="lastIndex">The ending index for pagination.</param>
        /// <returns> Returns a list of interns with course details if successful. </returns>
        public async Task<IEnumerable<InternList>> GetInternListAsync(int firstIndex, int lastIndex)
        {
            var interns = await _dbContext.Intern
                .Where(intern => !intern.IsDeleted).OrderByDescending(m => m.CreatedDate)
                .Skip(firstIndex).Take(lastIndex - firstIndex).ToListAsync();

            var internIds = interns.Select(intern => intern.Id).ToList();

            var internships = await _dbContext.Internship
                .Where(internship => internIds.Contains(internship.InternId)).ToListAsync();

            var courseIds = internships.Select(internship => internship.CourseId).ToList();

            var courses = await _dbContext.Courses
                .Where(course => courseIds.Contains(course.Id)).ToListAsync();

            var currentDate = DateTime.Now;

            var internDtoList = interns.Select(intern => new InternList
            {
                Id = intern.Id,
                UserId = intern.UserId,
                FirstName = intern.FirstName,
                LastName = intern.LastName,
                Email = intern.Email,
                CreatedBy = intern.CreatedBy,
                MobileNumber = intern.MobileNumber,
                CollegeName = intern.CollegeName,
                CareerPath = intern.CareerPath,
                CreatedDate = intern.CreatedDate,
                UpdatedDate = intern.UpdatedDate,
                IsDeleted = intern.IsDeleted,
                InProgressCourses = internships
                    .Where(internship => internship.InternId == intern.Id)
                    .Where(internship => IsCourseInProgress(internship, currentDate, courses))
                    .Where(internship => internship.Status)
                    .Select(internship => new CourseInfo
                    {
                        courseId = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Id,
                        Name = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Name,
                        Duration = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Duration ?? 0,
                        DurationType = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.DurationType
                    }).ToList(),

                UpcomingCourses = internships
                    .Where(internship => internship.InternId == intern.Id)
                    .Where(internship => IsCourseUpcoming(internship, currentDate, courses))
                    .Where(internship => internship.Status)
                    .Select(internship => new CourseInfo
                    {
                        courseId = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Id,
                        Name = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Name,
                        Duration = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Duration ?? 0,
                        DurationType = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.DurationType
                    }).ToList()
            }).ToList();

            return internDtoList;
        }


        /// <summary>
        /// Updates an intern asynchronously with new information.
        /// </summary>
        /// <param name="newIntern">The updated information of the intern.</param>
        /// <returns> Returns the updated intern if successful. </returns>
        public async Task<Intern> UpdateInternAsync(UpdateIntern newIntern)
        {
            Intern? oldIntern = await _dbContext.Intern.Include(i => i.CareerPath).FirstOrDefaultAsync(i => i.Id == newIntern.Id);
            CareerPath careerPath = await _careerPathRepository.GetCareerPathByIdAsync(newIntern.CareerPath);

            ApplicationUser? user = await _userManager.FindByIdAsync(oldIntern.UserId);
            user.FirstName = newIntern.FirstName;
            user.LastName = newIntern.LastName;
            await _userManager.UpdateAsync(user);

            oldIntern.FirstName = newIntern.FirstName;
            oldIntern.LastName = newIntern.LastName;
            oldIntern.MobileNumber = newIntern.ContactNo;
            oldIntern.CollegeName = newIntern.CollegeName;
            oldIntern.CareerPathId = newIntern.CareerPath;
            oldIntern.Address1 = newIntern.Address1;
            oldIntern.Address2 = newIntern.Address2;
            oldIntern.City = newIntern.City;
            oldIntern.State = newIntern.State;
            oldIntern.Zip = newIntern.Zip;
            oldIntern.BatchId = newIntern.BatchId;
            oldIntern.CareerPath = careerPath;

            oldIntern.UpdatedDate = DateTime.UtcNow;

            _dbContext.Intern.Update(oldIntern);
            await _dbContext.SaveChangesAsync();

            return oldIntern;
        }


        /// <summary>
        /// Deletes an intern.
        /// </summary>
        /// <param name="Id">The ID of the intern to delete.</param>
        /// <returns> Returns true if the intern is successfully deleted; otherwise, returns false. </returns>
        public bool DeleteIntern(string Id)
        {
            var intern = _dbContext.Intern.First(i => i.Id == Id);
            var user = _userManager.FindByIdAsync(intern.UserId);
            if (user != null)
            {
                user.Result.isDeleted = true;
            }
            intern.IsDeleted = true;
            _dbContext.Intern.Update(intern);
            _dbContext.SaveChanges();
            return true;
        }


        /// <summary>
        /// Retrieves the assigned courses for a given intern.
        /// </summary>
        /// <param name="Id">The ID of the intern.</param>
        /// <returns> Returns a list of assigned courses along with their topics and start dates. </returns>
        public async Task<List<AssignCourseDto>> GetCourse(string Id)
        {
            var intern = await _dbContext.Intern.FirstOrDefaultAsync(u => u.UserId == Id);

            var Assigncourse = await _dbContext.Internship
                .Where(u => u.InternId == intern.Id && u.Status == true).ToListAsync();

            List<AssignCourseDto> courseList = new List<AssignCourseDto>();

            foreach (var course in Assigncourse)
            {
                var courses = await _dbContext.Courses.FirstOrDefaultAsync(u => u.Id == course.CourseId);

                var topics = await _dbContext.Topics.Where(u => u.CourseId == course.CourseId).ToListAsync();

                DateTime startDate = course.StartDate;
                int topicIndex = 0;
                int daysInWeek = 7;
                int days = 0;

                List<TopicDTO> topicList = new List<TopicDTO>();

                for (int day = 0; day < courses.Duration;)
                {
                    while (startDate.DayOfWeek == DayOfWeek.Sunday)
                    {
                        startDate = startDate.AddDays(1);
                    }

                    if (topicIndex < topics.Count)
                    {
                        var topic = topics[topicIndex];
                        topicList.Add(new TopicDTO
                        {
                            Topic = topic.TopicName,
                            Date = startDate.ToString("yyyy-MM-dd")
                        });

                        if (courses.DurationType == "Weeks")
                        {
                            days++;
                            if (days % daysInWeek == daysInWeek - 1)
                            {
                                topicIndex++;
                                day++;
                            }
                        }
                        else
                        {
                            topicIndex++;
                            day++;
                        }
                    }

                    startDate = startDate.AddDays(1);

                    if (courses.DurationType == "Weeks" && day % daysInWeek == 0)
                    {
                        day = 0;
                    }
                }

                courseList.Add(new AssignCourseDto
                {
                    CourseName = courses.Name,
                    CourseDurationType = courses.DurationType,
                    StartDate = course.StartDate,
                    Topics = topicList,
                });
            }
            return courseList;
        }


        /// <summary>
        /// Retrieves a list of admins associated with the organization of a given user.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns> Returns a list of admins associated with the organization. </returns>
        public async Task<List<AdminList>> GetAdminList(string userId)
        {
            var organiztionId = await _dbContext.Admin
               .Where(u => u.UserId == userId)
               .Select(u => u.OrganizationId).FirstOrDefaultAsync();

            var user = await _dbContext.Admin
                .Where(u => u.OrganizationId == organiztionId)
                .Select(u => u.UserId).ToListAsync();

            var users = await _userManager.Users
                .Where(u => user.Contains(u.Id) && u.isDeleted == false)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .Select(u => new AdminList
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                }).ToListAsync();

            return users;
        }

        public class InternException : Exception
        {
            public InternException(string message)
               : base(message)
            {
            }
        }


        /// <summary>
        /// Retrieves a list of interns associated with the organization of the currently authenticated user.
        /// </summary>
        /// <returns> Returns a list of interns belonging to the organization. </returns>
        public async Task<List<Intern>> GetInternsByOrganizationAsync()
        {
            var adminId = _contextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminOrganization = await _dbContext.Admin.FirstOrDefaultAsync(i => i.UserId == adminId);
            var admins = await _dbContext.Admin
                .Where(i => i.OrganizationId == adminOrganization.OrganizationId).ToListAsync();

            var interns = await _dbContext.Intern
                         .Where(i => admins.Select(admin => admin.UserId)
                         .Contains(i.CreatedBy)).ToListAsync();
            return interns;
        }


        /// <summary>
        /// Retrieves a list of interns associated with the organization of the currently authenticated user, with optional search and filter options.
        /// </summary>
        /// <param name="searchWord">The search keyword to filter interns by name or other criteria.</param>
        /// <param name="filterWord">The filter keyword to further refine the list of interns.</param>
        /// <returns>
        /// Returns a list of interns belonging to the organization, filtered and sorted as per the search and filter criteria.
        /// </returns>
        public async Task<IEnumerable<InternList>> GetInternListByOrganizationAsync(string? searchWord, string? filterWord)
        {
            var adminId = _contextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var adminOrganization = await _dbContext.Admin.FirstOrDefaultAsync(i => i.UserId == adminId);
            var admins = await _dbContext.Admin
                .Where(i => i.OrganizationId == adminOrganization.OrganizationId).ToListAsync();

            var interns = await _dbContext.Intern
                         .Where(i => admins.Select(admin => admin.UserId).Contains(i.CreatedBy))
                         .Where(i => !i.IsDeleted).OrderBy(m => m.CreatedDate).Include(i => i.CareerPath).Include(x => x.Batch).ToListAsync();

            var internIds = interns.Select(intern => intern.Id).ToList();

            var internships = await _dbContext.Internship
                .Where(internship => internIds.Contains(internship.InternId)).ToListAsync();

            var courseIds = internships.Select(internship => internship.CourseId).ToList();

            var courses = await _dbContext.Courses
                .Where(course => courseIds.Contains(course.Id)).ToListAsync();

            var currentDate = DateTime.Now;

            var internDtoList = interns.Select(intern => new InternList
            {
                Id = intern.Id,
                UserId = intern.UserId,
                FirstName = intern.FirstName,
                LastName = intern.LastName,
                Email = intern.Email,
                CreatedBy = intern.CreatedBy,
                MobileNumber = intern.MobileNumber,
                BatchName = intern.Batch?.BatchName,
                CollegeName = intern.CollegeName,
                CareerPath = intern.CareerPath,
                CreatedDate = intern.CreatedDate,
                UpdatedDate = intern.UpdatedDate,
                IsDeleted = intern.IsDeleted,
                InProgressCourses = internships
                    .Where(internship => internship.InternId == intern.Id)
                    .Where(internship => IsCourseInProgress(internship, currentDate, courses))
                    .Where(internship => internship.Status)
                    .Select(internship => new CourseInfo
                    {
                        courseId = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Id,
                        Name = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Name,
                        Duration = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Duration ?? 0,
                        DurationType = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.DurationType
                    }).ToList(),

                UpcomingCourses = internships
                    .Where(internship => internship.InternId == intern.Id)
                    .Where(internship => IsCourseUpcoming(internship, currentDate, courses))
                    .Where(internship => internship.Status)
                    .Select(internship => new CourseInfo
                    {
                        courseId = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Id,
                        Name = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Name,
                        Duration = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.Duration ?? 0,
                        DurationType = courses.FirstOrDefault(course => course.Id == internship.CourseId)?.DurationType
                    }).ToList()
            }).ToList();


            //Applying filter and search 
            var searchResult = new List<InternList>();
            var filterResult = new List<InternList>();
            if (searchWord != null)
            {
                searchResult = applySearch(internDtoList, searchWord);
            }

            if (filterWord != null)
            {
                filterResult = applyFilters(internDtoList, searchWord, filterWord);
            }

            if (searchWord != null && filterWord != null)
            {
                internDtoList = searchResult.Intersect(filterResult).ToList();
            }

            else if (searchWord != null)
            {
                internDtoList = searchResult;
            }

            else if (filterWord != null)
            {
                internDtoList = filterResult;
            }

            return internDtoList;
        }


        /// <summary>
        /// Filters the list of interns based on the specified filter word, such as "inprogress" or "upcoming".
        /// </summary>
        /// <param name="internDtoList">The list of interns to filter.</param>
        /// <param name="searchWord">The optional search keyword to filter interns further.</param>
        /// <param name="filterWord">The filter keyword to specify the type of filtering to apply.</param>
        /// <returns> Returns a filtered list of interns based on the provided filter criteria. </returns>
        private List<InternList> applyFilters(List<InternList> internDtoList, string? searchWord, string filterWord)
        {
            var result = new List<InternList>();
            var currentDate = DateTime.Now;
            var filteredInterns = new List<InternList>();

            if (filterWord == "inprogress")
            {
                filteredInterns = internDtoList
                    .Where(intern => intern.InProgressCourses.Any())
                    .ToList();
            }

            else if (filterWord == "upcoming")
            {
                filteredInterns = internDtoList
                    .Where(intern => intern.UpcomingCourses.Any())
                    .ToList();
            }

            return filteredInterns;
        }


        /// <summary>
        /// Searches for interns based on the provided search word, filtering by name or email and course names.
        /// </summary>
        /// <param name="internDtoList">The list of interns to search within.</param>
        /// <param name="searchWord">The keyword used for searching interns.</param>
        /// <returns> Returns a filtered list of interns matching the search criteria. </returns>
        private List<InternList> applySearch(List<InternList> internDtoList, string searchWord)
        {
            var result = new List<InternList>();
            var searchUser = internDtoList
                .Where(intern => intern.FirstName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)
                || intern.LastName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)
                || intern.Email.Contains(searchWord, StringComparison.OrdinalIgnoreCase)).ToList();

            var searchInCourse = internDtoList
                .Where(intern => intern.InProgressCourses
                .Any(course => course.Name.Contains(searchWord, StringComparison.OrdinalIgnoreCase))).ToList();

            var searchUpCourse = internDtoList
                .Where(intern => intern.UpcomingCourses
                .Any(course => course.Name.Contains(searchWord, StringComparison.OrdinalIgnoreCase))).ToList();

            var searchCourse = searchInCourse.Concat(searchUpCourse).ToList();

            result = searchCourse.Union(searchUser).ToList();
            return result;
        }


        /// <summary>
        /// Finds a user by their email address asynchronously.
        /// </summary>
        /// <param name="email">The email address of the user to find.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. The task result contains the ApplicationUser if found;
        /// otherwise, it returns null.
        /// </returns>
        public async Task<ApplicationUser> FindByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }


        /// <summary>
        /// Checks if a user with the specified email address is marked as deleted.
        /// </summary>
        /// <param name="email">The email address of the user to check.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. The task result is true if the user is marked as deleted;
        /// otherwise, it returns false. If the user is not found, it also returns false.
        /// </returns>
        public async Task<bool> checkDelete(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user != null)
            {
                if (user.isDeleted == true)
                {
                    return true;
                }

                return false;
            }

            return false;
        }


        /// <summary>
        /// Updates an existing intern's details and enables the intern with the provided information and user ID.
        /// </summary>
        /// <param name="info">The details of the intern to be updated.</param>
        /// <param name="Id">The ID of the entity performing the update.</param>
        /// <param name="userId">The ID of the user to be associated with the intern.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. The task result is the updated Intern entity.
        /// </returns>
        public async Task<Intern> EnableInternAsync(InternDetails info, string Id, string userId)
        {
            var existingIntern = await _dbContext.Intern.FirstOrDefaultAsync(i => i.Email == info.Email);
            CareerPath careerPath = await _careerPathRepository.GetCareerPathByIdAsync(info.CareerPath);

            if (existingIntern != null)
            {
                existingIntern.Email = info.Email;
                existingIntern.FirstName = info.FirstName;
                existingIntern.LastName = info.LastName;
                existingIntern.CareerPathId = info.CareerPath;
                existingIntern.CreatedDate = DateTime.UtcNow;
                existingIntern.UpdatedDate = DateTime.UtcNow;
                existingIntern.CreatedBy = Id;
                existingIntern.UserId = userId;
                existingIntern.IsDeleted = false;
                existingIntern.CareerPath = careerPath;
            }

            _dbContext.Intern.Update(existingIntern);
            await _dbContext.SaveChangesAsync();

            return existingIntern;
        }


        /// <summary>
        /// Finds and retrieves a user by their unique identifier asynchronously.
        /// </summary>
        /// <param name="id">The unique identifier of the user.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. 
        /// The task result is the ApplicationUser matching the provided ID.
        /// </returns>
        public async Task<ApplicationUser> FindByIdAsync(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }


        /// <summary>
        /// Finds and retrieves the organization associated with the specified user ID asynchronously.
        /// </summary>
        /// <param name="UserId">The unique identifier of the user.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. 
        /// The task result is the Organization associated with the specified user ID.
        /// </returns>
        public async Task<Organization> FindOrganization(string UserId)
        {
            var admin = await _dbContext.Admin
                .Include(a => a.Organization).FirstOrDefaultAsync(a => a.UserId == UserId);

            var result = admin.Organization;
            return result;
        }


        /// <summary>
        /// Creates a password reset link with the provided password token and user ID asynchronously.
        /// </summary>
        /// <param name="PasswordToken">The password token generated for the password reset.</param>
        /// <param name="id">The user ID associated with the password reset request.</param>
        /// <returns>
        /// Returns a task representing the asynchronous operation. 
        /// The task result is the password reset link containing the token and user ID.
        /// </returns>
        public async Task<string> CreatePasswordLink(string PasswordToken, string id)
        {
            string? frontendAppUrl = _configuration["Urls:frontendUrl"];
            //var frontendAppUrl = "http://localhost:4200/#";
            var resetPageUrl = $"{frontendAppUrl}/#/create-password";
            var createPasswordLink = $"{resetPageUrl}?token={PasswordToken}&Id={id}";

            return createPasswordLink;
        }
    }

    #endregion
}



