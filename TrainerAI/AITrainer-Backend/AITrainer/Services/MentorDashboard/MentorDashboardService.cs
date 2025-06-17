using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.MentorDashboard;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using static AITrainer.AITrainer.Core.Dto.MentorDashboard.MentorDashboardDTO;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.Repository.SuperAdmin;
using AITrainer.AITrainer.Core.Enums;
using AITrainer.AITrainer.Core.Dto.CareerPaths;

namespace AITrainer.Services.MentorDashboard
{
    public class MentorDashboardService : IMentorDashboardService
    {
        #region Dependencies
        private readonly IMentorDashboardRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ISuperAdminRepository _superAdminRepository;
        #endregion
        #region Constructors
        public MentorDashboardService(ISuperAdminRepository superAdminRepository, IMentorDashboardRepository repository, IHttpContextAccessor httpContextAccessor, UserManager<ApplicationUser> userManager)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
            _superAdminRepository = superAdminRepository;
        }
        #endregion
        #region Public methods
        /// <summary>
        /// Retrieves the list of batches to which the mentor is assigned with
        /// </summary>
        /// <returns>A list of batches</returns>
        public async Task<List<Batch>> GetMentorBatch()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _repository.GetMentorBatches(userId);
            return result;
        }

        /// <summary>
        /// Retrieves details of mentors based on provided course IDs.
        /// </summary>
        /// <param name="courseIds">DTO containing the course IDs for filtering mentors.</param>
        /// <param name="keyWord">Optional keyword for filtering mentors by first or last name.</param>
        /// <returns>A list of MentorDTO objects containing mentor details.</returns>
        public async Task<List<MentorDTO>> GetMentors(List<string>? courseIds, string? keyWord, string? BatchId)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (courseIds != null && courseIds.Any())
            {
                List<ApplicationUser> mentorList = await _repository.GetMentorDetails(courseIds, BatchId);
                List<MentorDTO> mentors = mentorList.Select(user => new MentorDTO
                {
                    MentorId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                }).ToList();

                if (keyWord == null)
                {
                    return mentors;
                }
                else
                {
                    return mentors.Where(m => m.FirstName.Contains(keyWord, StringComparison.OrdinalIgnoreCase) || m.LastName.Contains(keyWord, StringComparison.OrdinalIgnoreCase)).ToList();
                }

            }
            else
            {
                List<ApplicationUser> mentorList = await _repository.GetMentorList(userId);
                List<MentorDTO> mentors = mentorList.Select(user => new MentorDTO
                {
                    MentorId = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                }).ToList();

                if (keyWord == null)
                {
                    return mentors;
                }
                else
                {
                    return mentors.Where(m => m.FirstName.Contains(keyWord, StringComparison.OrdinalIgnoreCase) || m.LastName.Contains(keyWord, StringComparison.OrdinalIgnoreCase)).ToList();
                }
            }

        }

        /// <summary>
        /// Retrieves details of courses based on search and batchId.
        /// </summary>
        /// <param name="batchId">The ID of the batch to filter courses (can be null).</param>
        /// <param name="keyWord">The search keyword to filter courses by name (can be null).</param>
        /// <returns>A list of Course objects matching the search criteria.</returns>
        public async Task<List<CourseInfoDto>> GetCourses(string batchId, string keyWord)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var courses = new List<Course>();
            courses = await _repository.GetAllCourses(userId);

            if (batchId != null)
            {
                var internships = await _repository.GetAllBatchInternship(batchId);
                courses.Clear();
                foreach (var internship in internships)
                {
                    var result = await _repository.GetCourse(internship.Id);
                    if (result != null)
                    {

                        courses.Add(result);
                    }
                }

                if (keyWord == null)
                {
                    return courses.Distinct().Select(c => new CourseInfoDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsDeleted = c.IsDeleted,

                    }).OrderBy(c => c.Name).ToList();
                }
                else
                {
                    return courses.Distinct().Where(c => c.Name.Contains(keyWord, StringComparison.OrdinalIgnoreCase)).Select(c => new CourseInfoDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsDeleted = c.IsDeleted,

                    }).OrderBy(c => c.Name).ToList();
                }

            }
            else
            {
                if (keyWord == null)
                {
                    return courses.Select(c => new CourseInfoDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsDeleted = c.IsDeleted,

                    }).ToList();
                }
                else
                {
                    return courses.Where(c => c.Name.Contains(keyWord, StringComparison.OrdinalIgnoreCase)).Select(c => new CourseInfoDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsDeleted = c.IsDeleted,

                    }).ToList();
                }

            }
        }

        /// <summary>
        /// Retrieves internship details for the mentor dashboard based on the course Id Mentor Id.
        /// </summary>
        /// <param name="internshipInfo">The request containing filters such as batch ID, course ID, mentor ID.</param>
        /// <returns>An InternshipsDetailMentorPageResponse object containing the internship details.</returns>
        public async Task<InternshipsDetailMentorPageResponse> GetInternships(InternshipRequestMentorPage internshipInfo)
        {
            InternshipsDetailMentorPageResponse internshipDetail = new InternshipsDetailMentorPageResponse();
            List<InternshipMentorPageResponse> internshipResults = new List<InternshipMentorPageResponse>();
            List<Internship> internships = new List<Internship>();
            var totalTaskCount = 0;
            var submittedCount = 0;
            var publishedCount = 0;
            var interns = await _repository.GetActiveInternsAsync();
            if (internshipInfo.CourseId != null && internshipInfo.MentorId != null)
            {
                internships = await _repository.GetInternshipsByCourseAsync(internshipInfo.CourseId);
                internships = internships.Where(i => internshipInfo.MentorId.Any(m => i.MentorId.Split(',').Contains(m)))
                    .Where(i => interns.Any(intern => intern.Id == i.InternId)).ToList();
            }
            else
            {
                if (internshipInfo.CourseId != null)
                {
                    internships = await _repository.GetInternshipsByCourseAsync(internshipInfo.CourseId);
                    internships = internships.Where(i => interns.Any(intern => intern.Id == i.InternId)).ToList();
                }
                if (internshipInfo.MentorId != null)
                {
                    internships = await _repository.GetActiveInternshipsAsync();
                    internships = internships.Where(i => internshipInfo.MentorId.Any(m => i.MentorId.Split(',').Contains(m)))
                                    .Where(i => interns.Any(intern => intern.Id == i.InternId)).ToList();
                }
            }
            List<Course> courses = await _repository.GetActiveCoursesAsync();
            List<Topic> topics = await _repository.GetActiveTopicsAsync();
            List<Assignment> assignments = await _repository.GetActiveAssignmentsAsync();
            List<AssignmentSubmission> assignmentSubmissions = await _repository.GetActiveAssignmentSubmissionsAsync();
            List<Journal> journalSubmissions = await _repository.GetActiveJournalsAsync();
            List<AssignmentFeedback> assignmentFeedbacks = await _repository.GetActiveAssignmentFeedbacksAsync();
            List<JournalFeedback> submissionFeedbacks = await _repository.GetActiveJournalFeedbacksAsync();

            foreach (var internship in internships)
            {
                var internInfo = interns.FirstOrDefault(i => i.Id == internship.InternId);
                var internBatch = await _repository.GetBatchIdAsync(internship);
                Course course = courses.Where(i => i.Id == internship.CourseId).FirstOrDefault();
                List<string> topicIds = topics.Where(i => i.CourseId == internship.CourseId).Select(i => i.Id).ToList();
                List<Assignment> assignmentInfo = assignments.Where(i => topicIds.Contains(i.TopicId)).ToList();

                InternshipMentorPageResponse internshipResult = new InternshipMentorPageResponse();
                List<InternshipSubmissionResponse> submissions = new List<InternshipSubmissionResponse>();
                bool hasUnpublished = false;

                foreach (Assignment assignment in assignmentInfo)
                {
                    InternshipSubmissionResponse submission = new InternshipSubmissionResponse();
                    AssignmentSubmission assignmentSubmission = assignmentSubmissions.Where(i => i.AssignmentId == assignment.Id && i.InternshipId == internship.Id).FirstOrDefault();

                    submission.Id = assignment.Id;
                    submission.Name = assignment.Name;
                    submission.IsAssignment = true;


                    if (assignmentSubmission != null)
                    {
                        submittedCount++;
                        AssignmentFeedback assignmentFeedback = assignmentFeedbacks.Where(i => i.SubmitedAssgnimentId == assignmentSubmission.Id && i.InternshipId == internship.Id).FirstOrDefault();
                        submission.SubmissionId = assignmentSubmission.Id;
                        submission.IsSubmitted = true;
                        if (assignmentFeedback != null)
                        {
                            if (assignmentFeedback.IsPublished)
                            {
                                publishedCount++;
                                submission.IsPublished = assignmentFeedback.IsPublished;
                                submission.PublisherId = assignmentFeedback.ReviewerId;
                                submission.PublisherName = await _repository.GetUserName(assignmentFeedback.ReviewerId);
                            }

                            else 
                            {
                               submission.IsPublished = false;
                               submission.IsSaved = true;
                            }
                        }
                        else
                        {
                            submission.IsPublished = false;
                        }
                        if (!submission.IsPublished)
                        {
                            hasUnpublished = true;
                        }
                    }
                    else
                    {
                        submission.IsPublished = false;
                        submission.IsSubmitted = false;
                        hasUnpublished = true;
                    }
                    submissions.Add(submission);
                }
                foreach (string topicId in topicIds)
                {
                    InternshipSubmissionResponse submission = new InternshipSubmissionResponse();

                    submission.Id = course.JournalTemplate_Id;
                    submission.Name = topics.Where(i => i.Id == topicId).Select(i => i.TopicName).FirstOrDefault();
                    submission.IsAssignment = false;

                    Journal journalSubmission = journalSubmissions.Where(i => i.Topic_Id == topicId && i.Internship_Id == internship.Id).FirstOrDefault();
                    if (journalSubmission != null)
                    {
                        submittedCount++;
                        JournalFeedback submissionFeedback = submissionFeedbacks.Where(i => i.JournalId == journalSubmission.Id && i.InternshipId == journalSubmission.Internship_Id).FirstOrDefault();
                        submission.SubmissionId = journalSubmission.Id;
                        submission.IsSubmitted = true;
                        if (submissionFeedback != null)
                        {
                            if (submissionFeedback.IsPublished)
                            {
                                publishedCount++;
                                submission.IsPublished = submissionFeedback.IsPublished;
                                submission.PublisherId = submissionFeedback.reviewerId;
                                submission.PublisherName = await _repository.GetUserName(submissionFeedback.reviewerId); ;
                            }
                            else
                            {
                                submission.IsPublished = false;
                                submission.IsSaved = true;
                            }

                        }
                        else if (!submission.IsPublished)
                        {
                            hasUnpublished = true;
                        }
                        else
                        {
                            submission.IsPublished = false;
                        }
                    }
                    else
                    {
                        submission.IsPublished = false;
                        submission.IsSubmitted = false;
                        hasUnpublished = true;
                    }
                                submissions.Add(submission);
                }
                totalTaskCount += (assignmentInfo.Count + topicIds.Count);


                internshipResult.InternshipId = internship.Id;
                internshipResult.InternId = internship.InternId;
                internshipResult.CourseId = internship.CourseId;
                internshipResult.CourseName = course.Name;
                internshipResult.MentorId = internship.MentorId;
                internshipResult.InternName = interns.Where(i => i.Id == internship.InternId).Select(i => i.FirstName).FirstOrDefault();
                internshipResult.MentorName = await GetUserName(internship.MentorId);
                internshipResult.Submissions = submissions;
                internshipResult.EndDate = CalculateDate(internship.StartDate, course.Duration);
                internshipResult.CareerPath = internInfo?.CareerPath;
                internshipResult.BatchName = internBatch?.BatchName ?? "Unknown";
                internshipResult.HasUnpublishedSubmission = hasUnpublished;
                internshipResults.Add(internshipResult);
            }

            internshipResults = internshipResults.OrderByDescending(i => i.HasUnpublishedSubmission)
                .ThenBy(i =>
                {
                    InternshipStatus status;
                    if (i.EndDate < DateTime.Now)
                    {
                        if (i.HasUnpublishedSubmission)
                        {
                            status = InternshipStatus.CompletedNotAllPublished;
                        }
                        else
                        {
                            status = InternshipStatus.Completed;
                        }
                    }
                    else if (i.StartDate <= DateTime.Now && i.EndDate > DateTime.Now)
                    {
                        status = InternshipStatus.InProgress;
                    }
                    else if (i.StartDate > DateTime.Now)
                    {
                        status = InternshipStatus.Upcoming;
                    }
                    else
                    {
                        status = InternshipStatus.Unknown;
                    }

                    i.Status = status.ToString();
                    return status;
                })
                .ToList();



            InternshipNumber counts = new InternshipNumber()
            {
                InternshipCount = internships.Count,
                SubmissionCount = submittedCount,
                UnSubmittedCount = totalTaskCount - submittedCount,
                PublishedCount = publishedCount,
                UnpublishedCount = totalTaskCount - publishedCount
            };
            internshipDetail.TotalCount = counts;
            internshipDetail.InternshipDetail = internshipResults;
            return internshipDetail;
        }

        /// <summary>
        /// Retrieves the names of mentors based on their IDs.
        /// </summary>
        /// <param name="mentorIds">The comma-separated mentor IDs.</param>
        /// <returns>A string containing the names of mentors.</returns>
        public async Task<string> GetUserName(string mentorIds)
        {
            string names = String.Empty;
            var splitMentorIds = mentorIds.Split(",").ToList();
            int count = 0;
            foreach (var mentorId in splitMentorIds)
            {
                var name = await _repository.GetUserName(mentorId);
                count++;
                if (splitMentorIds.Count != count)
                {
                    names += $"{name}, ";
                }
                else
                {
                    names += $"{name}";
                }
            }
            return names;
        }

        public async Task<ListAdmin> GetAdminProfiles(string? searchWord, List<ApplicationUser> Adminuser, int totalPages, int firstIndex, int lastIndex)
        {
            List<AdminProfile> adminProfiles = new List<AdminProfile>();

            foreach (ApplicationUser user in Adminuser)
            {
                Organization orgName = await _superAdminRepository.FindOrganization(user.Id);
                CareerPath careerPath = await GetCareerPath(user.Id);
                if (orgName != null && user.Type == "Mentor")
                {
                    AdminProfile Profile = new();

                    Profile.Id = user.Id;
                    Profile.FirstName = user.FirstName;
                    Profile.LastName = user.LastName;
                    Profile.Email = user.Email;
                    Profile.organization = orgName.OrganizationName;
                    Profile.Type = user.Type;
                    Profile.ContactNo = user.PhoneNumber;
                    Profile.isDeleted = user.isDeleted;
                    Profile.TechStacks = await GetTechStackNames(user.Id);
                    
                    Profile.ProjectManagersEmails = await GetProjectManagersEmails(user.Id);
                    Profile.ProjectManagersNames = await GetProjectManagersNames(user.Id);
                    
                    if(careerPath != null)
                    {
                        Profile.CareerPath = new CareerPathDto { Id = careerPath.Id, Name = careerPath.Name };
                    }
                    else
                    {
                        Profile.CareerPath = null;
                    }

                    adminProfiles.Add(Profile);
                }
            }          

            if (searchWord != null)
            {
                adminProfiles = applySearch(adminProfiles, searchWord);
            }

            adminProfiles = adminProfiles.Skip(firstIndex).Take(lastIndex - firstIndex).ToList();

            ListAdmin result = new()
            {
                AdminProfiles = adminProfiles,
                TotalPages = totalPages,
            };

            return result;
        }

        public async Task<List<string>> GetTechStackNames(string userId)
        {
            var user = await _superAdminRepository.GetAdminByUserIdAsync(userId);
            if (user != null)
            {
                var techStackNames = user.TechStacks.Select(ts => ts.Name).ToList();
                return techStackNames;
            }
            return new List<string>();
        }

        public async Task<CareerPath> GetCareerPath(string userId)
        {
            var user = await _superAdminRepository.GetAdminByUserIdAsync(userId);
            if (user != null)
            {
                var careerPath = user.CareerPath;
                return careerPath;
            }
            return null;
        }



        public async Task<List<string>> GetProjectManagersNames(string userId)
        {
            var user = await _superAdminRepository.GetAdminByUserIdAsync(userId);
            if (user != null)
            {
                var projectManagerNames = user.ProjectManagers
                    .Select(pm => $"{pm.User.FirstName} {pm.User.LastName}")
                    .ToList();
                return projectManagerNames;
            }
            return new List<string>();
        }

        public async Task<List<string>> GetProjectManagersEmails(string userId)
        {
            var user = await _superAdminRepository.GetAdminByUserIdAsync(userId);
            if (user != null)
            {
                var projectManagerEmails = user.ProjectManagers
                    .Select(pm => pm.User.Email)
                    .ToList();
                return projectManagerEmails;
            }
            return new List<string>();
        }

        private List<AdminProfile> applySearch(List<AdminProfile> adminProfiles, string searchWord)
        {
            var result = new List<AdminProfile>();
            var searchUser = adminProfiles
                .Where(admin => admin.FirstName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)
                || admin.LastName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)
                || admin.Email.Contains(searchWord, StringComparison.OrdinalIgnoreCase)).ToList();

            result = searchUser;
            return result;
        }

        /// <summary>
        /// Calculates the end date of an internship based on the start date and duration in days,while skipping Sundays.
        /// </summary>
        /// <param name="startDate">The start date of the internship.</param>
        /// <param name="durationInDays">The duration of the internship in days.</param>
        /// <returns> The end date of the internship. </returns>
        private static DateTime CalculateDate(DateTime startDate, int durationInDays)
        {
            DateTime endDate = startDate;

            while (durationInDays > 1)
            {
                endDate = endDate.AddDays(1);

                // Skip Sundays
                if (endDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    durationInDays--;
                }
            }

            return endDate;
        }


        #endregion
    }
}
