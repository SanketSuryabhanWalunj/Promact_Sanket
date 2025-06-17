using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.Core.Dto.Topics;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Courses;
using AITrainer.AITrainer.Repository.Quizes;
using AITrainer.AITrainer.Repository.Topics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using static AITrainer.AITrainer.Core.Dto.OpenAiApi.OpenAiDto;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class CourseController : ControllerBase
    {
        private readonly ICourseRepository _courseRepository;
        private readonly IConfiguration _configuration;
        private readonly ITopicRepository _topicRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly ApplicationDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CourseController(ICourseRepository courseRepository, IConfiguration configuration, ITopicRepository topicRepository, IQuizRepository quizRepository, ApplicationDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _courseRepository = courseRepository;
            _configuration = configuration;
            _topicRepository = topicRepository;
            _quizRepository = quizRepository;
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Creates a new course along with its topics and quizzes.
        /// </summary>
        /// <param name="course">The data representing the new course to be created</param>
        /// <returns>Returns an IActionResult indicating the success or failure of the course creation</returns>
        [HttpPost("createCourse")]
        public async Task<IActionResult> CreateCourse([FromBody] CourseDto course)
        {
            using (var transaction = _dbContext.Database.BeginTransaction())
            {
                //Declare the variable for successfully create topic and quiz for course
                bool topicsAndQuizzesCreated = false;
                Course courseData = null;

                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    string currentemail = getCurrentEmail();

                    var user = await _courseRepository.findUSerByEmailASync(currentemail);

                    if (user == null)
                    {
                        return Unauthorized();
                    }

                    // Check if the course already exists
                    var courseExist = await _courseRepository.FindCourseAsync(course);
                    if (courseExist != null)
                    {
                        return Conflict(new { error = "Course already exists" });
                    }

                    var userId = user.Id;

                    // Create the course and get the result
                    courseData = await _courseRepository.AddCourseAsync(course, userId);

                    if (courseData != null)
                    {
                        var request = new CourseDto
                        {
                            Name = course.Name,
                            Duration = course.Duration,
                            DurationType = course.DurationType,
                            TrainingLevel = course.TrainingLevel
                        };

                        // Generate topics using OpenAI API
                        var generatedTopics = await CreateTopicForCourse(request);

                        //Declare the variable for Day or Week number count
                        int duration = 1;
                        int index = 1;

                        //Declare the variable to get the access of topic data
                        Topic topic = null;

                        List<Quiz> quizList = new List<Quiz>();
                        List<Topic> topicList = new List<Topic>();

                        // Save generated topics in the database
                        foreach (var Data in generatedTopics.list)
                        {
                            var combinedTopics = string.Join(", ", Data.topic_list);
                            if (course.DurationType == "Days")
                            {
                                // The response is day-wise, so we'll use the day number
                                duration = 1;
                            }
                            else
                            {
                                // The response is week-wise, so we'll use the week number
                                duration = 6;
                            }


                            topic = new Topic
                            {
                                Id = Guid.NewGuid().ToString(),
                                CourseId = courseData.Id,
                                TopicName = combinedTopics,
                                Duration = duration,
                                Index = index,
                                QuizLink = "",
                                QuizDuration = course.QuizDuration,
                                CreatedDate = DateTime.UtcNow,
                                UpdatedDate = DateTime.UtcNow,
                                IsDeleted = false
                            };

                            // Add topic to topicList
                            topicList.Add(topic);

                            if (course.Quiz == true)
                            {

                                var res = new TopicDto
                                {
                                    TopicName = combinedTopics,
                                    QuizCount = course.QuizCount
                                };

                                var generatedQuiz = await CreateQuizForTopic(res);

                                if (generatedQuiz != null)
                                {
                                    foreach (var data in generatedQuiz.quiz)
                                    {
                                        var quiz = new Quiz
                                        {
                                            Id = Guid.NewGuid().ToString(),
                                            TopicId = topic.Id,
                                            Title = data.question,
                                            Option1 = data.option1,
                                            Option2 = data.option2,
                                            Option3 = data.option3,
                                            Option4 = data.option4,
                                            Answer = data.answer,
                                            QuizMarks = course.QuizMarks,
                                            CreatedDate = DateTime.UtcNow,
                                            UpdatedDate = DateTime.UtcNow,
                                            IsDeleted = false
                                        };

                                        quizList.Add(quiz);
                                    }

                                }
                            }
                            index++;
                        }
                        //Add all quiz and topics to database                       
                        await _topicRepository.AddAllTopicAsync(topicList);
                        await _quizRepository.AddAllQuizAsync(quizList);

                        // Set the flag to indicate that topics and quizzes are created
                        topicsAndQuizzesCreated = true;

                        //Commit the transaction if all operations succeed
                        transaction.Commit();

                        return Ok(new { message = "Course created successfully " });

                    }
                    else
                    {
                        return BadRequest();
                    }
                }
                catch (Exception ex)
                {
                    // Roll back the transaction
                    transaction.Rollback();

                    // Delete the partially created course if it was created before the exception occurred
                    if (!topicsAndQuizzesCreated && courseData != null)
                    {
                        // Assuming _courseRepository.DeleteCourseAsync deletes a course by its ID
                        await _courseRepository.DeleteCourseById(courseData.Id);
                    }
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }

        /// <summary>
        /// Retrieves a list of courses created by the current user, paginated according to the provided parameters.
        /// </summary>
        /// <param name="currentPage">The current page number</param>
        /// <param name="defualtList">The default number of items per page</param>
        /// <returns>Returns an IActionResult containing the paginated list of courses</returns>
        [HttpGet("GetCourse")]
        public async Task<IActionResult> GetCourseList(int currentPage, int defualtList)
        {
            try
            {
                string currentUser = getCurrentEmail();
                ApplicationUser user = await _courseRepository.findUSerByEmailASync(currentUser);

                if (user == null)
                {
                    return Unauthorized();
                }

                List<Course> coursesCreatedByUser = await _courseRepository.GetCoursesCreatedByUserAsync(user.Id);
                int count = coursesCreatedByUser.Count();
                int pageNumber = (int)Math.Ceiling((double)count / defualtList);
                int lastIndex = defualtList * currentPage;
                int firstIndex = lastIndex - defualtList;

                List<CourseResponse> courseDtos = coursesCreatedByUser
                    .Select(course => new CourseResponse
                    {
                        Id = course.Id,
                        Name = course.Name,
                        Duration = course.Duration,
                        DurationType = course.DurationType,
                        TrainingLevel = course.TrainingLevel,
                        Quiz = course.Quiz,
                        IsDeleted = course.IsDeleted
                    }).Skip(firstIndex)
                    .Take(lastIndex - firstIndex)
                    .ToList();

                PaginatedResponse<CourseResponse> response = new PaginatedResponse<CourseResponse>
                {
                    Data = courseDtos,
                    TotalPages = pageNumber
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves a list of courses available for interns to enroll in.
        /// </summary>
        /// <returns>Returns an IActionResult containing the list of courses suitable for interns</returns>
        [HttpGet("GetCourseListIntern")]
        public async Task<IActionResult> GetCourseListForIntern()
        {
            try
            {
                var currentUser = getCurrentEmail();

                var user = await _courseRepository.findUSerByEmailASync(currentUser);

                if (user == null)
                {
                    return Unauthorized();
                }

                var coursesCreatedByUser = await _courseRepository.GetCoursesListForInternAsync(user.Id);

                var courseDtos = coursesCreatedByUser
                    .Select(course => new CourseResponse
                    {
                        Id = course.Id,
                        Name = course.Name,
                        Duration = course.Duration,
                        DurationType = course.DurationType,
                        TrainingLevel = course.TrainingLevel,
                        Quiz = course.Quiz,
                        IsDeleted = course.IsDeleted
                    }).ToList();

                return Ok(courseDtos);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a course based on the provided course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course to be deleted</param>
        /// <returns>Returns a boolean indicating whether the course deletion was successful or not</returns>
        [HttpDelete("DeleteCourse")]
        public async Task<bool> DeleteCourse(string courseId)
        {
            var currentUser = getCurrentEmail();

            var user = await _courseRepository.findUSerByEmailASync(currentUser);

            if (user == null)
            {
                throw new Exception($"UnAuthorized");
            }

            var deleteCourse = await _courseRepository.DeleteCourseById(courseId);

            return deleteCourse;

        }

        /// <summary>
        /// Retrieves detailed information about a course including its topics, assignments, quizzes, and journal template data.
        /// </summary>
        /// <param name="courseId">The ID of the course for which details are to be retrieved</param>
        /// <returns>Returns detailed information about the specified course</returns>
        [HttpGet("GetCourseDetail")]
        public async Task<IActionResult> GetCourseDetail(string courseId)
        {
            try
            {
                var currentUser = getCurrentEmail();

                var user = await _courseRepository.findUSerByEmailASync(currentUser);

                if (user == null)
                {
                    return Unauthorized();
                }

                // Fetch course details using courseId from the repository
                var course = await _courseRepository.GetCourseByIdAsync(courseId);

                if (course == null)
                {
                    return NotFound("Course not found");
                }

                // Fetch topics for the selected course
                var topics = await _courseRepository.GetTopicsByCourseIdAsync(courseId);

                if (topics == null)
                {
                    return NotFound("Topics not found for this course");
                }

                var Assignments = await _courseRepository.GetAssignmentsForTopicsAsync(topics.Select(t => t.Id).ToList());

                var Quizzes = await _courseRepository.GetQuizzesForTopicsAsync(topics.Select(t => t.Id).ToList());

                var journalData = await _courseRepository.GetJournalData(course.JournalTemplate_Id);

                // Create DTO objects and populate them with data
                var courseDto = new CourseDetailResponseDto
                {
                    Id = course.Id,
                    Name = course.Name,
                    Duration = course.Duration,
                    DurationType = course.DurationType,
                    TrainingLevel = course.TrainingLevel,
                    Quiz = course.Quiz,
                    QuizTime = course.QuizTime,
                    QuizCount = course.QuizCount,
                    CreatedDate = course.CreatedDate,
                    JournalTemplateId = course.JournalTemplate_Id,
                    TemplateName = journalData?.TemplateName,

                    Topics = topics.Select(topic =>
                    {
                        var topicAssignments = Assignments.Where(a => a.TopicId == topic.Id).ToList();
                        var topicQuizzes = Quizzes.Where(q => q.TopicId == topic.Id).ToList();

                        return new CourseDetailTopicDto
                        {
                            Id = topic.Id,
                            TopicName = topic.TopicName,
                            Index = topic.Index,
                            Duration = topic.Duration,
                            QuizLink = topic.QuizLink,


                            Assignment = topicAssignments.Select(assignment => new CourseDetailAssignmentDto
                            {
                                Id = assignment.Id,
                                Name = assignment.Name,
                                Content = JsonConvert.DeserializeObject<Content>(assignment.Content),
                                Marks = Convert.ToString(assignment.Marks)
                            }).ToList(),

                            Quiz = topicQuizzes.Select(quiz => new CourseDetailQuizDto
                            {
                                Id = quiz.Id,
                                Title = quiz.Title,
                                Option1 = quiz.Option1,
                                Option2 = quiz.Option2,
                                Option3 = quiz.Option3,
                                Option4 = quiz.Option4,
                                Answer = quiz.Answer,
                                Marks = quiz.QuizMarks
                            }).ToList()
                        };
                    }).ToList()
                };

                // Return course details in the response
                return Ok(courseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates and assigns a journal template to a specified course.
        /// </summary>
        /// <param name="template">The DTO containing the course ID and the template ID to be assigned</param>
        /// <returns>Returns a message indicating the success of the operation</returns>
        [HttpPut("CreateTemplate")]
        public async Task<IActionResult> CreateTemplateInCourse(CreateTemplateIdDto template)
        {
            try
            {
                var course = await _courseRepository.FindTemplateIdForCourseAsync(template.courseId);

                if (course == null)
                {
                    return NotFound("Course not found");
                }
                else
                {
                    course.JournalTemplate_Id = template.TemplateId;
                    course.UpdatedDate = DateTime.UtcNow;
                    var createTemplate = await _courseRepository.CreateTemplateIdAsync(course);
                }

                return Ok(new { message = "Journal Template created and assigned to the course successfully" });
            }
            catch (Exception ex)
            {
                // Handle exceptions and return appropriate response
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes the journal template assigned to a course.
        /// </summary>
        /// <param name="templateId">The ID of the template to be deleted</param>
        /// <returns>Returns a boolean indicating whether the template deletion was successful or not</returns>
        [HttpDelete("DeleteTemplate")]
        public async Task<bool> DeleteTemplate(string templateId)
        {
            var findTemplate = await _courseRepository.FindTemplateAsync(templateId);

            if (findTemplate != null)
            {
                findTemplate.JournalTemplate_Id = null;
                findTemplate.UpdatedDate = DateTime.UtcNow;
                var deleteTempalte = await _courseRepository.DeleteTemplateById(findTemplate);
                return true;
            }
            else
            {
                return false;
            }
        }


        private async Task<GeneratedTopicsDto> CreateTopicForCourse(CourseDto course)
        {
            try
            {
                string apiKey = _configuration["OpenAI:ApiKey"];
                string apiUrl = _configuration["OpenAI:ApiUrl"];

                // Serialize the CourseDto object to a JSON string
                string courseJson = JsonConvert.SerializeObject(course);

                request requestBody = new()
                {
                    temperature = 0.7,
                    model = "gpt-3.5-turbo",
                    max_tokens = 3000,
                    messages = new List<userModel>
                    {
                        new userModel
                        {
                            role = "system",
                            content = "You are a helpful assistant." +
                                    "You are ChatGPT, a large language " +
                                    "you have to Add a course to learn  " + course.Name + ""
                        },
                        new userModel
                        {
                            role = "user",
                            content = course.DurationType.Equals("Weeks", StringComparison.OrdinalIgnoreCase)
                                ? "Create a course with " + course.Duration + " " + course.DurationType + " duration for " + course.TrainingLevel + " level in JSON format, Json format like below \r\n {\r\n  \"courseTitle\": \"\",\r\n  \"list\": [\r\n    {\r\n      \"week\": 1,\r\n    \"topic_list\": [\"topic\"]\r\n  }\r\n]  }"
                                : "Create a course with " + course.Duration + " " + course.DurationType + " duration for " + course.TrainingLevel + " level in JSON format, Json format like below \r\n {\r\n  \"courseTitle\": \"\",\r\n  \"list\": [\r\n    {\r\n      \"day\": 1,\r\n      \"topic_list\": [\"topic\"]\r\n  }\r\n]  }"

                        }
                    }
                };

                string jsonstring = JsonConvert.SerializeObject(requestBody);
                StringContent content = new StringContent(jsonstring, Encoding.UTF8, "application/json");

                HttpClient httpclient = new HttpClient();
                httpclient.Timeout = TimeSpan.FromMinutes(30);
                httpclient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                HttpResponseMessage response = await httpclient.PostAsync(apiUrl, content);
                string responseContent = await response.Content.ReadAsStringAsync();
                JObject jsonResponse = JObject.Parse(responseContent);

                // Store the prompt, response, and status code in the database
                ChatGptInteraction chatGptInteraction = new()
                {
                    Prompt = courseJson,
                    Response = responseContent,
                    StatusCode = Convert.ToInt16(response.StatusCode),
                    CreatedDate = DateTime.UtcNow
                };
                 await _courseRepository.AddResponseAsync(chatGptInteraction);

                if (jsonResponse["choices"] != null && jsonResponse["choices"].Count() > 0)
                {
                    string? result = jsonResponse["choices"][0]["message"]["content"].Value<string>();
                    GeneratedTopicsDto? generatedTopics = JsonConvert.DeserializeObject<GeneratedTopicsDto>(result);
                    return generatedTopics;
                }
                else
                {
                    throw new Exception($"Problem in generating course");
                }

            }
            catch (Exception ex)
            {
                throw new Exception($"Error calling OpenAI API: {ex.Message}");
            }
        }


        private async Task<QuizResponseDto> CreateQuizForTopic(TopicDto topic)
        {
            try
            {
                string apiKey = _configuration["OpenAI:ApiKey"];
                string apiUrl = _configuration["OpenAI:ApiUrl"];

                // Serialize the TopicDto object to a JSON string
                string topicJson = JsonConvert.SerializeObject(topic);

                var requestBody = new request
                {
                    temperature = 0.7,
                    model = "gpt-3.5-turbo",
                    max_tokens = topic.QuizCount < 10 ? 1500 : 3000, // Adjust tokens based on expected quiz length

                    messages = new List<userModel>
                    {
                        new userModel
                        {
                            role = "system",
                            content = "You are ChatGPT, generate a quiz in JSON format. " +
                              "Provide the quiz in the following format: { \"quiz\":[ { \"question\": \"...\", \"option1\": \"...\", \"option2\": \"...\", \"option3\": \"...\", \"option4\": \"...\", \"answer\": \"...\" } ] }"
                        },
                        new userModel
                        {
                            role = "user",
                            content = $"Create a quiz for {topic.TopicName} topic with {topic.QuizCount} multiple-choice questions in JSON format."
                        }
                    }
                };

                string jsonRequest = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

                using (HttpClient httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromMinutes(2); // Set appropriate timeout

                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                    var response = await httpClient.PostAsync(apiUrl, content);

                    string responseContent = await response.Content.ReadAsStringAsync();

                    // Store the prompt, response, and status code in the database
                    var chatGptInteraction = new ChatGptInteraction
                    {
                        Prompt = topicJson,
                        Response = responseContent,
                        StatusCode = (int)response.StatusCode,
                        CreatedDate = DateTime.UtcNow
                    };
                    await _courseRepository.AddResponseAsync(chatGptInteraction);

                    var jsonResponse = JObject.Parse(responseContent);
                    if (jsonResponse["choices"] != null && jsonResponse["choices"].Count() > 0)
                    {
                        var result = jsonResponse["choices"][0]["message"]["content"].Value<string>();
                        var generatedQuiz = JsonConvert.DeserializeObject<QuizResponseDto>(result);
                        return generatedQuiz;
                    }
                    else
                    {
                        throw new Exception($"Problem generating quiz.");
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error calling OpenAI API: {ex.Message}");
            }
        }

        private string getCurrentEmail()
        {
            // Get the current user's claims principal
            var claimsPrincipal = HttpContext.User;

            // Get the email claim
            var emailClaim = claimsPrincipal.FindFirst(ClaimTypes.Email);

            return emailClaim?.Value;
        }

        /// <summary>
        /// Updates the quiz duration of a course and all associated topics.
        /// </summary>
        /// <param name="editCourse">The DTO containing the updated quiz duration for the course</param>
        /// <returns>Returns the updated course details if successful, else returns a not found response</returns>
        [HttpPut("EditQuizDuration")]
        public async Task<IActionResult> EditQuizDuration(EditQuizDurationDto editCourse)
        {
            var course = await _courseRepository.GetCourseByIdAsync(editCourse.courseId);
            if (course == null)
            {
                return NotFound("Course not found");
            }
            else
            {
                course.QuizTime = editCourse.QuizDuration;
                course.UpdatedDate = DateTime.UtcNow;
                var TopicUpdate = await _courseRepository.UpdateTopicQuizDuration(editCourse.courseId, editCourse.QuizDuration);
                await _courseRepository.UpdateCourse(course);

            }
            return Ok(course);

        }

        /// <summary>
        /// Updates the details of a course.
        /// </summary>
        /// <param name="editCourse">The DTO containing the updated details of the course</param>
        /// <returns>Returns the updated course details if successful, else returns a not found response</returns>
        [HttpPut("EditCourse")]
        public async Task<IActionResult> EditCourse(EditCourseDto editCourse)
        {
            var course = await _courseRepository.GetCourseByIdAsync(editCourse.CourseId);
            if (course == null)
            {
                return NotFound("Course not found");
            }
            else
            {
                course.Name = editCourse.Name;
                course.UpdatedDate = DateTime.UtcNow;
                await _courseRepository.UpdateCourse(course);

            }
            return Ok(course);

        }

        /// <summary>
        /// Retrieves a list of courses based on the logged-in user's organization.
        /// </summary>
        /// <param name="userId">The ID of the logged-in user.</param>
        /// <returns>Returns an IActionResult containing the list of courses.</returns>
        [HttpGet("GetCoursesList")]
        public async Task<ActionResult> GetCoursesList()
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<CourseInfoDto> courses = await _courseRepository.GetCourses(userId);

            return Ok(courses);
        }
    }


}


