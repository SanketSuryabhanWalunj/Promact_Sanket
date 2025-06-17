using AITrainer.AITrainer.Repository.Courses;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Text;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.DomainModel;
using Microsoft.EntityFrameworkCore;
using AITrainer.AITrainer.Core.Dto.Assignments;
using System.Security.Claims;
using AITrainer.AITrainer.Core.Dto.Assignments.Consts;
using Microsoft.AspNetCore.Identity;
using AITrainer.AITrainer.Core.Dto.Interndashboard;

namespace AITrainer.Services.Assignements
{
    public class AssignmentAppService : IAssignmentAppService
    {
        private readonly IConfiguration _configuration;
        private readonly ICourseRepository _courseRepository;
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContext;
        private readonly HttpClient _httpClient = new();
        string apiUrl = "";

        public AssignmentAppService(
            IConfiguration configuration,
            ICourseRepository courseRepository,
            ApplicationDbContext applicationDbContext,
            IHttpContextAccessor httpContextAccessor
        )
        {
            _context = applicationDbContext;
            _configuration = configuration;
            _courseRepository = courseRepository;
            InitializeHttpClient();
            _httpContext = httpContextAccessor;
        }

        /// <summary>
        /// Initializes the HttpClient instance with necessary headers and base URL for making requests to an external service.
        /// This method configures the HttpClient to include the Authorization header using an API key retrieved from the application's configuration settings.
        /// </summary>
        private void InitializeHttpClient()
        {
            string apiKey = _configuration["OpenAI:ApiKey"];
            apiUrl = _configuration["OpenAI:ApiUrl"];
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        #region Assignment Methods

        /// <summary>
        /// Generates an assignment text using an external AI service.
        /// The method constructs a request with a system prompt and a user prompt based on the course name, course topic, duration in days, and marks.
        /// The constructed request is then sent to the AI service, and the generated assignment text is returned.
        /// </summary>
        /// <param name="courseName">The name of the course for which the assignment is being generated.</param>
        /// <param name="courseTopic">The specific topic within the course for which the assignment is being generated.</param>
        /// <param name="durationInDay">The duration in days for the assignment.</param>
        /// <param name="marks">The marks allocated for the assignment.</param>
        /// <returns>A string representing the AI-generated assignment text.</returns>
        public async Task<string> GenerateAssignmentAsync(string courseName, string courseTopic, double durationInDay, double marks)
        {
            var systemPrompt = AssignmentConts.systemPrompt(courseName);
            var requestPrompt = AssignmentConts.createAssignmentPrompt(courseName, durationInDay, marks, courseTopic);
            var requestContent = CreateRequestContent(systemPrompt, requestPrompt);
            var assistantResponse = await GetAssistantResponse(requestContent);

            return assistantResponse;
        }

        /// <summary>
        /// Adds a new assignment related to a specific topic.
        /// </summary>
        /// <param name="topicId">The ID of the topic the assignment is related to.</param>
        /// <param name="input">DTO containing the details for the new assignment.</param>
        /// <returns>The newly created Assignment object, or null if the operation fails.</returns>
        public async Task<Assignment> AddAssignmentAsync(string topicId, CreateAssignmentDto input)
        {

            var result = await (from t in _context.Topics
                                join c in _context.Courses on t.CourseId equals c.Id
                                where t.Id == topicId
                                select new
                                {
                                    Course = c,
                                    Topics = t
                                }).FirstOrDefaultAsync();
            var assignment = await GenerateAssignmentAsync(result.Course.Name, result.Topics.TopicName, input.durationInDay, input.durationInDay);

            if (assignment != null)
            {
                var currUser = GetCurrentLoggedInUser().Result;

                var assignmentObj = new Assignment
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(assignment).AssignmentTitle,
                    TopicId = topicId,
                    Content = assignment,
                    Marks = input.Marks,
                    DurationInDay = input.durationInDay,
                    CreatedBy = currUser.Id,
                    IsDeleted = false,
                    CreatedDate = DateTime.UtcNow,
                };
                _context.Assignments.Add(assignmentObj);
                if (input.AddTimeToCourseDuration)
                {
                    result.Course.Duration += (int)input.durationInDay;
                    result.Topics.Duration += (int)input.durationInDay;
                    _context.Courses.Update(result.Course);
                    _context.Topics.Update(result.Topics);
                }
                await _context.SaveChangesAsync();
                assignmentObj.Topic = null;
                return assignmentObj;
            }
            return null;
        }

        /// <summary>
        /// Regenerates an assignment with updated details.
        /// </summary>
        /// <param name="id">The ID of the assignment to regenerate.</param>
        /// <param name="input">DTO containing the updated details for the assignment.</param>
        /// <returns>The updated Assignment object, or null if the assignment does not exist.</returns>
        public async Task<Assignment> ReGenerateAssignmentAsync(string id, UpdateAssignmentDto input)
        {
            var assignment = await _context.Assignments.FirstOrDefaultAsync(x => x.Id == id);
            if (assignment != null)
            {
                var currUser = GetCurrentLoggedInUser().Result;
                var result = await (from t in _context.Topics
                                    join c in _context.Courses on t.CourseId equals c.Id
                                    where t.Id == assignment.TopicId
                                    select new
                                    {
                                        Course = c,
                                        Topics = t
                                    }).FirstOrDefaultAsync();
                var newAssignment = await GenerateAssignmentAsync(result.Course.Name, result.Topics.TopicName, input.durationInDay, input.Marks);
                if (newAssignment != null)
                {
                    if (input.UpdateTimeToCourseDuration)
                    {
                        result.Course.Duration += (int)(input.durationInDay - assignment.DurationInDay);
                        result.Topics.Duration += (int)(input.durationInDay - assignment.DurationInDay);
                        _context.Courses.Update(result.Course);
                        _context.Topics.Update(result.Topics);
                    }
                    assignment.Name = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(newAssignment).AssignmentTitle;
                    assignment.Content = newAssignment;
                    assignment.Marks = input.Marks;
                    assignment.DurationInDay = input.durationInDay;
                    assignment.UpdatedBy = currUser.Id;
                    assignment.UpdatedDate = DateTime.UtcNow;
                    _context.Assignments.Update(assignment);
                    await _context.SaveChangesAsync();
                }
            }
            return assignment;
        }

        /// <summary>
        /// Marks an assignment as deleted and adjusts related course and topic durations.
        /// </summary>
        /// <param name="assignmentId">The ID of the assignment to delete.</param>
        /// <returns>The deleted Assignment object, or null if it does not exist.</returns>
        public async Task<Assignment> DeleteAssignmentAsync(string assignmentId)
        {
            var assignment = await _context.Assignments.FirstOrDefaultAsync(x => x.Id == assignmentId);
            if (assignment != null)
            {
                assignment.IsDeleted = true;
                var topic = await _context.Topics.FirstOrDefaultAsync(x => x.Id == assignment.TopicId);
                var course = await _context.Courses.FirstOrDefaultAsync(x => x.Id == topic.CourseId);
                if (topic != null && course != null)
                {
                    course.Duration -= (int)assignment.DurationInDay;
                    _context.Courses.Update(course);
                    topic.Duration -= (int)assignment.DurationInDay;
                    _context.Topics.Update(topic);
                }

                await _context.SaveChangesAsync();
                return assignment;
            }
            return null;
        }
        #endregion

        #region Course Assignment Methods
        /// <summary>
        /// Generates a course assignment, including aggregating topic information.
        /// </summary>
        /// <param name="courseId">The ID of the course for which to generate the assignment.</param>
        /// <param name="input">DTO containing the assignment details.</param>
        /// <returns>A string representing the generated assignment.</returns>
        public async Task<string> GenerateCourseAssignmentAsync(string courseId, CreateAssignmentDto input)
        {
            var coursesWithTopics = await (from c in _context.Courses
                                           join t in _context.Topics on c.Id equals t.CourseId into topicsGroup
                                           where c.Id == courseId
                                           select new
                                           {
                                               Course = c,
                                               Topics = topicsGroup.ToList()
                                           }).FirstOrDefaultAsync();
            var topics = "";
            foreach (var topic in coursesWithTopics.Topics)
            {
                topics += topic.TopicName + ", ";
            }

            var course = coursesWithTopics.Course;

            var systemPrompt = AssignmentConts.systemPrompt(course.Name);
            var requestPrompt =
                AssignmentConts.createAssignmentPrompt(course.Name, input.durationInDay, input.Marks, topics);
            var requestContent = CreateRequestContent(systemPrompt, requestPrompt);
            return await GetAssistantResponse(requestContent);
        }

        /// <summary>
        /// Adds a new course-wide assignment.
        /// </summary>
        /// <param name="courseId">The ID of the course the assignment is related to.</param>
        /// <param name="input">DTO containing the details for the new assignment.</param>
        /// <returns>The newly created Assignment object, or null if the operation fails.</returns>
        public async Task<Assignment> AddCourseAssignmentAsync(string courseId, CreateAssignmentDto input)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(x => x.Id == courseId);

            if (course == null) return null;

            var assignment = await GenerateCourseAssignmentAsync(courseId, input);
            if (assignment != null)
            {
                var currUser = GetCurrentLoggedInUser().Result;
                var newTopic = new Topic
                {
                    Id = Guid.NewGuid().ToString(),
                    TopicName = "Course Assignment",
                    CourseId = courseId,
                    Duration = (int)input.durationInDay,
                    IsDeleted = false,
                    CreatedDate = DateTime.UtcNow,
                    QuizLink = ""
                };
                _context.Topics.Add(newTopic);
                var assignmentObj = new Assignment
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(assignment).AssignmentTitle,
                    TopicId = newTopic.Id,
                    Content = assignment,
                    Marks = input.Marks,
                    DurationInDay = input.durationInDay,
                    CreatedBy = currUser.Id,
                    IsDeleted = false,
                    CreatedDate = DateTime.UtcNow,
                };
                _context.Assignments.Add(assignmentObj);
                if (input.AddTimeToCourseDuration)
                {
                    course.Duration += (int)input.durationInDay;
                    _context.Courses.Update(course);
                }
                await _context.SaveChangesAsync();
                assignmentObj.Topic = null;
                return assignmentObj;
            }
            return null;
        }

        /// <summary>
        /// Removes a course assignment and marks its topic as deleted.
        /// </summary>
        /// <param name="id">The ID of the assignment to remove.</param>
        /// <returns>The removed Assignment object, or null if it does not exist.</returns>
        public async Task<Assignment> RemoveCourseAssignmentAsync(string id)
        {
            var assignment = await _context.Assignments.FirstOrDefaultAsync(x => x.Id == id);
            if (assignment != null)
            {
                var topic = await _context.Topics.FirstOrDefaultAsync(x => x.Id == assignment.TopicId);
                var course = await _context.Courses.FirstOrDefaultAsync(x => x.Id == topic.CourseId);
                if (topic != null && course != null)
                {
                    course.Duration -= (int)assignment.DurationInDay;
                    _context.Courses.Update(course);
                    topic.IsDeleted = true;
                    _context.Topics.Update(topic);
                }
                await _context.SaveChangesAsync();
                return assignment;
            }
            return null;
        }

        /// <summary>
        /// Retrieves a list of assignments for a given topic ID.
        /// </summary>
        /// <param name="id">The ID of the topic for which to retrieve assignments.</param>
        /// <returns>A list of Assignment objects.</returns>
        public async Task<List<Assignment>> GetAssignmentList(string id)
        {
            var assignmet = await _context.Assignments
                .Where(u => u.TopicId == id && u.IsDeleted == false)
                .ToListAsync();

            return assignmet;
        }

        /// <summary>
        /// Checks whether an assignment has been submitted for a specific topic by the current user.
        /// </summary>
        /// <param name="assignmentId">The ID of the assignment.</param>
        /// <param name="topicId">The ID of the topic.</param>
        /// <returns>True if the assignment has been submitted, otherwise false.</returns>
        public async Task<bool> CheckAssignmentSubmited(string assignmentId, string topicId)
        {
            var userId = _httpContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var Intern = await _context.Intern.FirstOrDefaultAsync(x => x.UserId == userId);
            var topic = await _context.Topics.FirstOrDefaultAsync(x => x.Id == topicId && x.IsDeleted == false);
           var Internship = await _context.Internship.FirstOrDefaultAsync(x => x.InternId == Intern.Id && x.CourseId == topic.CourseId && x.isDismissed ==false && x.Status == true);

            var assignmet = await _context.AssignmentSubmissions
                .Where(u => u.IsDeleted == false && u.InternshipId == Internship.Id && u.TopicId == topicId && u.AssignmentId == assignmentId)
                .FirstOrDefaultAsync();

            if(assignmet != null)
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Submits an assignment for a user.
        /// </summary>
        /// <param name="assignment">The assignment submission request details.</param>
        /// <returns>Details of the assignment submission.</returns>
        public async Task<AssginmentInfo> AssignmentSubmisiion(AssignmentSubmisionReq assignment)
        {
            var userId = _httpContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var Intern = await _context.Intern.FirstOrDefaultAsync(x => x.UserId == userId);
            var topic = await _context.Topics.FirstOrDefaultAsync(u => u.Id == assignment.topicId);

            var assignmentName = await _context.Assignments
                .Where(u => u.Id == assignment.assignmentId)
                .Select(u => u.Name)
                .FirstOrDefaultAsync();
            
            var assignmentsubmission = new AssignmentSubmission
            {
                Id = Guid.NewGuid().ToString(),
                InternshipId = assignment.InternshipId,
                TopicId = assignment.topicId,
                AssignmentId = assignment.assignmentId,

                GithubLink = assignment.githubLink,
                SubmitedDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            await _context.AssignmentSubmissions.AddAsync(assignmentsubmission);
            await _context.SaveChangesAsync();

            var assignmentdeatils = new AssginmentInfo
            {
                AssignmentId = assignmentsubmission.AssignmentId,
                AssignmentTitle = assignmentName,
                SubmissionLink = assignmentsubmission.GithubLink,
                SubmissionId = assignmentsubmission.Id,
            };

            return assignmentdeatils;
        }

        /// <summary>
        /// Updates an assignment submission for a user.
        /// </summary>
        /// <param name="assignment">The assignment submission update request details.</param>
        /// <returns>True if the update operation succeeds, otherwise false.</returns>
        public async Task<bool> AssignmentSubmisionUpdate(AssignmentSubmisionReq assignment)
        {
            var userId = _httpContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var Intern = await _context.Intern.FirstOrDefaultAsync(x => x.UserId == userId);
            var topic = await _context.Topics.FirstOrDefaultAsync(u => u.Id == assignment.topicId);
           
            var assignments = await _context.AssignmentSubmissions
              .Where(u => u.IsDeleted == false && u.InternshipId == assignment.InternshipId && u.TopicId == assignment.topicId && u.AssignmentId == assignment.assignmentId)
              .FirstOrDefaultAsync();
            if(assignments!=null) {
                assignments.IsDeleted = true;
                await _context.SaveChangesAsync();

                assignments.Id = Guid.NewGuid().ToString();
                assignments.GithubLink = assignment.githubLink;
                assignments.SubmitedDate = DateTime.UtcNow;
                assignments.InternshipId = assignment.InternshipId;
                assignments.IsDeleted = false;

                await _context.AssignmentSubmissions.AddAsync(assignments);
                await _context.SaveChangesAsync();
            }
            else
            {
                await AssignmentSubmisiion( assignment);
            }

            return true;
        }



        #endregion

        #region Private Methods
        /// <summary>
        /// Creates the content for a request to generate an assignment.
        /// </summary>
        /// <param name="systemPrompt">The system prompt part of the request.</param>
        /// <param name="requestPrompt">The user prompt part of the request.</param>
        /// <returns>An object representing the request content.</returns>
        private object CreateRequestContent(string systemPrompt, string requestPrompt)
        {
            return new
            {
                model = "gpt-3.5-turbo",
                temperature = 0.2,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = requestPrompt },
                }
            };
        }

        /// <summary>
        /// Sends a request to an assistant service and retrieves the response.
        /// </summary>
        /// <param name="requestContent">The content of the request.</param>
        /// <returns>A string representing the assistant's response.</returns>
        
        private async Task<string> GetAssistantResponse(object requestContent)
        {
            var jsonContent = new StringContent(JsonConvert.SerializeObject(requestContent), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(apiUrl, jsonContent);
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();

            var jsonObject = JObject.Parse(responseBody);
            var assistantResponse = jsonObject["choices"][0]["message"]["content"].ToString();
            //var result = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(assistantResponse.ToString());
            return assistantResponse;
        }

        /// <summary>
        /// Retrieves the currently logged-in user.
        /// </summary>
        /// <returns>The IdentityUser object representing the current user.</returns>
        private async Task<IdentityUser> GetCurrentLoggedInUser()
        {
            var userId = _httpContext.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            return user;
        }

        /// <summary>
        /// Adds a user-specific assignment related to a specific topic.
        /// </summary>
        /// <param name="topicId">The ID of the topic the assignment is related to.</param>
        /// <param name="input">DTO containing the user-specific assignment details.</param>
        /// <returns>The newly created Assignment object, or null if the operation fails.</returns>
        public async Task<Assignment> AddUserAssignmentAsync(string topicId, CreateUserAssignmentDto input)
        {

            var result = await (from t in _context.Topics
                                join c in _context.Courses on t.CourseId equals c.Id
                                where t.Id == topicId
                                select new
                                {
                                    Course = c,
                                    Topics = t
                                }).FirstOrDefaultAsync();


            var currUser = GetCurrentLoggedInUser().Result;

            ValidateAndAdjustGradingCriteria(input.content);


            var assignmentObj = new Assignment
            {
                Id = Guid.NewGuid().ToString(),
                Name = input.Name,
                TopicId = topicId,
                Content = JsonConvert.SerializeObject(input.content),
                Marks = input.Marks,
                DurationInDay = input.durationInDay,
                CreatedBy = currUser.Id,
                IsDeleted = false,
                CreatedDate = DateTime.UtcNow,
            };
            _context.Assignments.Add(assignmentObj);
            if (input.AddTimeToCourseDuration)
            {
                result.Course.Duration += (int)input.durationInDay;
                result.Topics.Duration += (int)input.durationInDay;
                _context.Courses.Update(result.Course);
                _context.Topics.Update(result.Topics);
            }
            await _context.SaveChangesAsync();
            assignmentObj.Topic = null;
            return assignmentObj;


        }

        /// <summary>
        /// Validates and adjusts the grading criteria percentages for an assignment to ensure they sum up to 100%.
        /// </summary>
        /// <param name="content">The content object containing the grading criteria.</param>
        public void ValidateAndAdjustGradingCriteria(UserAssignmentContent content)
        {
            int totalParts = content.GradingCriteria.Count();
            if (totalParts == 1)
            {
                content.GradingCriteria[0].Percentage = "100%";
            }
            else
            {
                int totalPercentage = 0;

                foreach (var item in content.GradingCriteria)
                {
                    if (int.TryParse(item.Percentage.Replace("%", ""), out int percentage))
                    {
                        totalPercentage += percentage;
                    }
                    else
                    {
                        Console.WriteLine($"Failed to parse percentage for Part {item.Part}: {item.Percentage}");
                    }
                }

                if (totalPercentage != 100)
                {
                    var multiplyFactor = 100.0 / totalPercentage;

                    foreach (var item in content.GradingCriteria)
                    {
                        if (int.TryParse(item.Percentage.Replace("%", ""), out int percentage))
                        {
                            double adjustedPercentage = Math.Round(percentage * multiplyFactor, 1);
                            item.Percentage = adjustedPercentage + "%";
                        }
                    }
                }
            }
        }

        #endregion
    }
}
