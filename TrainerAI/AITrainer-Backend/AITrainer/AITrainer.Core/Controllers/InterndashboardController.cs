using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.Core.Dto.Interndashboard;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Interdashboard;
using AITrainer.AITrainer.Repository.Internships;
using AITrainer.AITrainer.Util;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InterndashboardController : ControllerBase
    {
        private readonly IInterndashboardRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IInternshipRepository _internshipRepository;
        private readonly ILogger<InterndashboardController> _logger;


        public InterndashboardController(IInterndashboardRepository repository, IHttpContextAccessor httpContextAccessor, IInternshipRepository internshipRepository, ILogger<InterndashboardController> logger)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
            _internshipRepository = internshipRepository;
            _logger = logger;
        }

        /// <summary>
        /// Retrieves information about courses available for a particular intern.
        /// </summary>
        ///  <returns>List of CourseInfoDto objects</returns>
        [HttpGet("GetInternCourse")]
        public async Task<ActionResult<List<CourseInfoDto>>> GetInternCourse()
        {
            var resultCourse = new List<CourseInfoDto>(); // Initialize a list to hold CourseInfoDto objects
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is missing in claims.");
            }

            string internId = _repository.GetInternId(userId);
          
          

            var courses = await _repository.CourseByActive(internId);

            if (courses == null)
            {
                return null;
            }

            foreach (var course in courses)
            {
                var duration = _repository.Duration(course.CourseId);
                var courseName = _repository.CourseName(course.CourseId);
                var workingDays = await _repository.GetWorkingDays(internId);

             
                var endDate = CalculateDate(course.StartDate, duration, workingDays);

                DateTime currentDate = DateTime.UtcNow;
                if (endDate.Date < currentDate.Date)
                {
                    await _repository.MakeChange(course.IntershipId);
                }

                var todayday = FindTodayDay(course.StartDate, currentDate, workingDays); 
                var topicList = await _repository.GetTopic(course.CourseId);

                var journalId = await _repository.GetJournalFromCourse(course.CourseId);
                if (journalId == null)
                {
                    journalId = null;
                }

                var topicInfo = GetTopicByDay(topicList, todayday, course.StartDate, workingDays, course.IntershipId);

                var CourseInfo = new CourseInfoDto
                {
                    InternshipId = course.IntershipId,
                    TopicInfo = topicInfo,
                    CourseName = courseName,
                    CourseDuration = duration,
                    CourseEndDate = endDate,
                    JournalId = journalId?.Id,
                    CourseStartDate = course.StartDate,
                };

                resultCourse.Add(CourseInfo); // Add each CourseInfoDto object to the list
            }

            var firstCourse = resultCourse
                .Where(c => (c.CourseEndDate.Date >= DateTime.UtcNow.Date && c.CourseStartDate.Date <= DateTime.UtcNow.Date))
                .OrderBy(i => i.CourseStartDate).ToList();

            if (firstCourse == null)
            {
                return null;
            }

            return firstCourse;
        }


        /// <summary>
        /// Retrieves internship history based on provided parameters
        /// </summary>
        /// <param name="courseId">The ID of the course (optional)</param>
        /// <param name="internshipId">The ID of the internship (optional)</param>
        /// <returns>ActionResult containing internship history</returns>
        [HttpGet("Internhistory")]
        public async Task<ActionResult> GetHistory(string? courseId, string? internshipId)
        {
            string internId = null;

            if (internshipId == null)
            {
                var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                internId = _repository.GetInternId(userId);
            }

            InternCourseDto course = null;

            if (internshipId != null)
            {
                course = await _repository.GetCourseDetails(internshipId);
                internId = await _repository.GetInternDetails(internshipId, course.CourseId);
            }
            else if (courseId == null)
            {
                course = await _repository.Course(internId);

                if (course == null)
                {
                    return NotFound(new { message = "Not found any History" });
                }
            }
            else
            {
                course = await _repository.CourseListById(courseId);
            }

            var workingDays = await _repository.GetWorkingDays(internId);

            CourseInfo ActiveCourseName = null;
            List<CourseInfo> AllCourseName = null;

            if (internshipId == null)
            {
                ActiveCourseName = await _repository.ActiveCourseName(internshipId);

                AllCourseName = await _repository.AllCourseName(internId,null);

                internshipId = _repository.GetInternshipId(internId, course.CourseId);
                if (string.IsNullOrEmpty(internshipId))
                    throw new InvalidOperationException("Internship ID not found.");

                string[] internship = internshipId.Split("###");
                internshipId = internship[0];
                course.StartDate = DateTime.Parse(internship[1]);
            }
            else
            {
                ActiveCourseName = await _repository.ActiveCourseName(internshipId);
                AllCourseName = await _repository.AllCourseName(internId, internshipId);
            }

            var topicList = await _repository.GetTopic(course.CourseId);

            DateTime currentDate = DateTime.UtcNow;

            var todayday = FindTodayDay(course.StartDate, currentDate, workingDays);
            

            var history = GetInternHistory(topicList, todayday, course.StartDate, internshipId, workingDays);
            var duration = _repository.Duration(course.CourseId);
            var endDate = CalculateDate(course.StartDate, duration, workingDays);
            string behaviourTemplateId = await _repository.GetTemplateId(internshipId);
            var historyData = new History
            {
                ActiveCourseName = ActiveCourseName,
                AllCourseName = AllCourseName,
                TopicInfo = history,
                InternshipId = internshipId,
                EndDate = endDate,
                BehaviourTemplateId = behaviourTemplateId
            };

            return Ok(historyData);
        }


        /// <summary>
        /// Retrieves an assignment by its ID and submission ID (optional)
        /// </summary>
        /// <param name="id">The ID of the assignment</param>
        /// <param name="assignmentSubmisionId">The ID of the assignment submission (optional)</param>
        /// <returns>ActionResult containing the assignment</returns>
        [HttpGet("GetAssignment")]
        public async Task<ActionResult> GetAssignment(string id, string? assignmentSubmisionId)
        {
            var assignment = await _repository.GetAssignmentById(id, assignmentSubmisionId);
            return Ok(assignment);
        }


        /// <summary>
        /// Retrieves a quiz by its ID
        /// </summary>
        /// <param name="id">The ID of the quiz</param>
        /// <returns>ActionResult containing the quiz</returns>
        [HttpGet("GetQuiz")]
        public async Task<ActionResult> GetQuiz(string id)
        {
            var quiz = await _repository.GetQuizById(id);
            return Ok(quiz);
        }


        /// <summary>
        /// Retrieves a quiz link by the provided TopicId
        /// </summary>
        /// <param name="TopicId">The ID of the topic associated with the quiz link</param>
        /// <returns>ActionResult containing the quiz link</returns>
        [HttpGet("GetLink")]
        public async Task<ActionResult> GetLinkQuiz(string TopicId)
        {
            var quizLink = await _repository.GetQuizLink(TopicId);
            return Ok(quizLink);
        }


        /// <summary>
        /// Retrieves journal details by its ID
        /// </summary>
        /// <param name="id">The ID of the journal</param>
        /// <returns>ActionResult containing the journal details</returns>
        [HttpGet("GetJournalDetails")]
        public async Task<ActionResult> GetJournalDetails(string id)
        {
            var details = await _repository.GetJournalDetails(id);

            if (details.Data == "NA")
            {
                var JournalData = new JournalTemplateDto
                {
                    TemplateName = "",
                    Options = new List<OptionDataDto>
                    {
                        new OptionDataDto
                        {
                            TopicName = "NA",
                            Notes = "NA",
                            Description = "NA"
                        }
                    }
                };

                return Ok(JournalData);
            }
            else
            {
                var jsonData = JsonSerializer.Deserialize<List<OptionDataDto>>(details.Data);

                var JournalData = new JournalDetailsDto
                {
                    Date = details.UpdatedDate,
                    Options = jsonData
                };

                return Ok(JournalData);
            }
        }



        /// <summary>
        /// Retrieves scoreboard details for a specific batch.
        /// </summary>
        /// <param name="batchId">The ID of the batch for which scoreboard details are requested.</param>
        /// <returns>ActionResult containing the scoreboard details.</returns>
        [HttpGet("Scoreboard")]
        public async Task<ActionResult> GetScoreboardDetails(string batchId)
        {
            List<string> uniqueInternIds = await _repository.GetuniqueInternIds(batchId);
            List<ScoreboardResponse> responses = new List<ScoreboardResponse>();

            foreach (string uniqueInternId in uniqueInternIds)
            {
                double? marks = 0;
                double totalMarks = 0;
                double? percentage = 0;
                List<string> courseNames = new List<string>();
                ApplicationUser user = null;
                List<Internship> internships = await _repository.GetInternshipDetails(uniqueInternId);
                List<string> workingDays = await _repository.GetWorkingDays(uniqueInternId);
                string userId = await _repository.getUserId(uniqueInternId);
                Dictionary<string, BehaviouralScoreboard> behaviouralScoreboards = null;
                if (internships != null && internships.Any())
                {
                    foreach (Internship result in internships)
                    {
                        List<Topic> topicList = await _repository.GetTopic(result.CourseId);
                        DateTime currentDate = DateTime.UtcNow;
                        int todayday = FindTodayDay(result.StartDate, currentDate, workingDays);
                        List<TopicInfo> history = GetInternHistory(topicList, todayday, result.StartDate, result.Id, workingDays);

                        if (history == null)
                        {
                            return NotFound(new { message = "Not found Any history" });
                        }

                        foreach (TopicInfo details in history)
                        {
                            if (details.Journal != null)
                            {
                                double? Journalrating = await _repository.GetJournalFeedbackDetails(details.Journal.Id);

                                if (Journalrating != null)
                                {
                                    marks += Journalrating;
                                    totalMarks += 10;
                                }
                            }

                            if (details.Assginment != null)
                            {
                                foreach (AssginmentInfo assignmentDetails in details.Assginment)
                                {
                                    double? assignmentMarks = await _repository.AssignmentMarks(assignmentDetails.SubmissionId);

                                    if (assignmentMarks != null)
                                    {
                                        marks += assignmentMarks;

                                        double assignmentTotalMarks = await _repository.AssignmentTotalMarks(assignmentDetails.AssignmentId);

                                        totalMarks += assignmentTotalMarks;
                                    }
                                }
                            }

                            // Add Quiz Marks if Quiz is submitted
                            if (details.Quiz != null)
                            {
                                double quizTotalMarks = await _repository.FindQuizTotalMarks(details.Quiz.Id);
                                marks += details.Quiz.ScoreAchieved;
                                totalMarks += quizTotalMarks;
                            }
                        }

                        user = await _repository.GetUserDeatils(result.InternId);
                        string courseName = _repository.CourseName(result.CourseId);

                        courseNames.Add(courseName);
                        Dictionary<string, BehaviouralScoreboard> behaviouralFeedbacks = await _repository.GetBehaviouralFeedback(result.Id);
                        if (behaviouralFeedbacks != null)
                        {
                            behaviouralScoreboards = new Dictionary<string, BehaviouralScoreboard>();

                            foreach (KeyValuePair<string, BehaviouralScoreboard> behaviouralFeedback in behaviouralFeedbacks)
                            {
                                BehaviouralScoreboard behaviouralScoreboard = new()
                                {
                                    category = behaviouralFeedback.Value.category,
                                    TotalMarks = behaviouralFeedback.Value.TotalMarks,
                                    TotalReceivedMarks = behaviouralFeedback.Value.TotalReceivedMarks,
                                };
                                marks += behaviouralFeedback.Value.TotalReceivedMarks;
                                totalMarks += behaviouralFeedback.Value.TotalMarks;

                                behaviouralScoreboards.Add(behaviouralFeedback.Key, behaviouralScoreboard);
                            }
                        }

                        if (marks != 0)
                        {
                            percentage = marks / totalMarks * 100;
                        }
                    }
                }
                else
                    continue;

                responses.Add(new ScoreboardResponse
                {
                    id = uniqueInternId,
                    userId = userId,
                    Percentage = percentage,
                    Firstname = user.FirstName,
                    Lastname = user.LastName,
                    Course = courseNames,
                    behaviourScoreboard = behaviouralScoreboards
                });
            }

            return Ok(responses);
        }

        /// <summary>
        /// Downloads scoreboard details for a specific batch.
        /// </summary>
        /// <param name="batchId">The ID of the batch for which scoreboard details are requested.</param>
        /// <returns>File as an attachment.</returns>
        [HttpGet("DownloadScoreboard")]
        public async Task<IActionResult> DownloadScoreboard(string batchId)
        {
            try
            {
                var scoreboardResult = await GetScoreboardDetails(batchId);

                if (scoreboardResult is OkObjectResult okResult)
                {
                    var responses = okResult.Value as List<ScoreboardResponse>;
                    if (responses != null)
                    {
                        byte[] fileContent = ExcelHelper.CreateFile(responses);
                        return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "scoreboard.xlsx");
                    }
                    else
                    {
                        return NotFound("No scoreboard data found.");
                    }
                }
                else
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
                }
            }
            catch (Exception ex)
            {            
                _logger.LogError(ex, "Error occurred while downloading scoreboard for batch {BatchId}", batchId);
                Console.WriteLine($"Error occurred while downloading scoreboard for batch {batchId}");
                Console.WriteLine(ex.ToString());

                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }

        /// <summary>
        /// Retrieves the history of topics completed by an intern.
        /// </summary>
        /// <param name="topicList">The list of topics for the course.</param>
        /// <param name="todayday">The current day within the course.</param>
        /// <param name="startDate">The start date of the course.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <param name="workingDays">The list of working days for the intern.</param>
        /// <returns>The list of TopicInfo containing details of completed topics.</returns>
        private List<TopicInfo> GetInternHistory(List<Topic> topicList, int todayday, DateTime startDate, string internshipId, List<string> workingDays)
        {            
            List<TopicInfo> topicInfoList = new List<TopicInfo>();

            for (var i = 0; i <= todayday; i++) 
            {
                if (!workingDays.Contains(startDate.DayOfWeek.ToString()))
                {
                    startDate = startDate.AddDays(1);
                    i--;
                    continue; // Skip processing for Sunday
                }

                if (startDate.Date <= DateTime.UtcNow.Date && i < topicList.Count)
                {
                    var topic = topicList[i];
                    var startdate = startDate;
                    DateTime? topicEndDate = null;
                    if (topic.Duration >= 1)
                    {
                        topicEndDate = CalculateDate(startDate, topic.Duration, workingDays);
                    }

                    if (topicEndDate != null)
                    {
                        startDate = topicEndDate.Value.AddDays(1);
                    }
                    else
                    {
                        startDate = startDate.AddDays(1);
                    }

                    var assignment = _repository.AssignmentHistory(topic.Id, internshipId);

                    var journal = _repository.JournalHistory(topic.Id, internshipId);
                    var quiz = _repository.QuizHistory(topic.Id, internshipId);
                    topicInfoList.Add(new TopicInfo
                    {
                        Topic = topic,
                        Assginment = assignment,
                        Journal = journal,
                        Quiz = quiz,
                        StartDate = startdate,
                        EndDate = topicEndDate
                    });
                }
            }

            return topicInfoList;
        }


        /// <summary>
        /// Retrieves the topic for the current day based on the provided parameters.
        /// </summary>
        /// <param name="topicList">The list of topics for the course.</param>
        /// <param name="todayday">The current day within the course.</param>
        /// <param name="startDate">The start date of the course.</param>
        /// <param name="workingDays">The list of working days for the intern.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>The topic for the current day along with its details.</returns>
        private object GetTopicByDay(List<Topic> topicList, int todayday, DateTime startDate, List<string> workingDays, string internshipId)
        {
            var lastCountDay = 0;

            foreach (var topic in topicList)
            {
                if (todayday >= lastCountDay && todayday <= (lastCountDay + topic.Duration))
                {
                    var startDay = lastCountDay + 1;
                    DateTime topicStartDate = CalculateDate(startDate, startDay, workingDays);
                    DateTime? topicEndDate = null;
                    if (topic.Duration > 1)
                    {
                        var endDay = lastCountDay + topic.Duration;
                        topicEndDate = CalculateDate(startDate, endDay, workingDays);
                    }

                    var assignment = _repository.GetAssignment(topic.Id, internshipId);
                    var topicPerDay = new TopicInfoDTO
                    {
                        Topics = topic,
                        Assignment = assignment,
                        TopicStartDate = topicStartDate,
                        TopicEndDate = topicEndDate,
                    };

                    return topicPerDay;
                }

                lastCountDay = lastCountDay + topic.Duration;
            }

            return null;
        }


        /// <summary>
        /// Calculates the end date based on the start date, duration, working days.
        /// </summary>
        /// <param name="startDate">The start date of the calculation.</param>
        /// <param name="durationInDays">The duration of the calculation in days.</param>
        /// <param name="workingDays">The list of working days for the intern.</param>
        /// <returns>The calculated end date.</returns>
        private static DateTime CalculateDate(DateTime startDate, int durationInDays, List<string> workingDays)
        {
            DateTime endDate = startDate;

            while (durationInDays > 1)
            {
                endDate = endDate.AddDays(1);
              
                if (workingDays.Contains(endDate.DayOfWeek.ToString()))
                {
                    durationInDays--;
                }
            }

            return endDate;
        }


        /// <summary>
        /// Finds the day number of the current date relative to the start date, considering working days.
        /// </summary>
        /// <param name="startDate">The start date of the calculation.</param>
        /// <param name="currentDate">The current date.</param>
        /// <param name="workingDays">The list of working days for the calculation.</param>
        /// <returns>The day number of the current date.</returns>
        private static int FindTodayDay(DateTime startDate, DateTime currentDate, List<string> workingDays)
        {
            int duration = ((currentDate.Date - startDate.Date).Days) + 1;
            int day = 0;

            for (int i = 0; i < duration; i++)
            {
                DateTime currentDateInLoop = startDate.AddDays(i);

                if (!workingDays.Contains(currentDateInLoop.DayOfWeek.ToString()))
                {
                    continue;
                }

                day++;
            }

            return day;
        }


        /// <summary>
        /// Retrieves internship details for the logged-in intern.
        /// </summary>
        /// <param name="currentPage">The current page number.</param>
        /// <param name="count">The number of items per page.</param>
        /// <returns>The internship details along with pagination information.</returns>
        [HttpGet("GetInternInternship")]
        public async Task<ActionResult<InternInternshipResult>> GetScoreboardDetails(int currentPage, int count)
        {
            var lastIndex = count * currentPage;
            var firstIndex = lastIndex - count;
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var internId = _repository.GetInternId(userId);

           

            var result = await _repository.GetInternshipDetails(internId);
            var totalCount = result.Count();

            var totalPageNumber = (int)Math.Ceiling((double)totalCount / count);
            List<InternInternship>  internships = new List<InternInternship>();
            foreach (var item in result)
            {
                var Duration = _repository.Duration(item.CourseId);
                var workingDays = await _repository.GetWorkingDays(internId);
                var endDate = CalculateDate(item.StartDate, Duration, workingDays);
                List<MentorDetails> mentorName = _internshipRepository.GetMentors(item.MentorId);
                var internInternship = new InternInternship
                {
                    CourseName = _repository.CourseName(item.CourseId),
                    MentorsName = mentorName,
                    StartDate = item.StartDate,
                    Duration = Duration,
                    EndTime = endDate,
                    Status = item.Status,
                };

                internships.Add(internInternship);
            }
            var internInternshipResult = new InternInternshipResult
            {
                Internships = internships.Skip(firstIndex).Take(lastIndex - firstIndex).ToList(),
                TotalPages = totalPageNumber,
            };

            return internInternshipResult;
        }


        /// <summary>
        /// Retrieves progress details of the intern.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>The progress details of the intern.</returns>
        [HttpGet("IntenProgress")]
        public async Task<ActionResult<ProgressIntern>> GetProgressIntern(string internId)
        {
            double? marks = 0;
            double totalMarks = 0;
            double? percentage = 0;
            List<Internship> internships = await _repository.GetInternshipDetails(internId);
            List<string> workingDays = await _repository.GetWorkingDays(internId);
            ProgressIntern progressResult = new ProgressIntern();
            progressResult.AssignmentDetails = new List<AssignmentDetails>();
            progressResult.QuizDetails = new List<QuizDetails>();
            progressResult.JournalDetails = new List<JournalDetails>();
            progressResult.BehaviouralScoreboard = new List<BehaviouralScoreboard>();
            foreach (Internship result in internships)
            {
                List<Topic> topicList = await _repository.GetTopic(result.CourseId);
                DateTime currentDate = DateTime.UtcNow;
                int todayday = FindTodayDay(result.StartDate, currentDate, workingDays);
                List<TopicInfo> history = GetInternHistory(topicList, todayday, result.StartDate, result.Id, workingDays);
                if (history == null)
                {
                    return NotFound(new { message = "Not found Any history" });
                }

                foreach (TopicInfo details in history)
                {
                    if (details.Journal != null)
                    {
                        double? Journalrating = await _repository.GetJournalFeedbackDetails(details.Journal.Id);

                        if (Journalrating != null)
                        {
                            marks = Journalrating;
                            totalMarks = 10;
                            progressResult.JournalDetails.Add(new JournalDetails
                            {
                                JournalName = details.Topic.TopicName,
                                JournalScore = Journalrating ?? 0,
                                JournalDate = details.Journal.Date,
                                TotalMarks = totalMarks
                            });
                        }
                    }

                    if (details.Assginment != null)
                    {
                        foreach (AssginmentInfo assignmentDetails in details.Assginment)
                        {
                            double? assignmentMarks = await _repository.AssignmentMarks(assignmentDetails.SubmissionId);

                            if (assignmentMarks != null)
                            {
                                marks += assignmentMarks;

                                double assignmentTotalMarks = await _repository.AssignmentTotalMarks(assignmentDetails.AssignmentId);

                                totalMarks = assignmentTotalMarks;
                                progressResult.AssignmentDetails.Add(new AssignmentDetails
                                {
                                    AssignmentName = assignmentDetails.AssignmentTitle,
                                    AssignmentScore = assignmentMarks,
                                    AssignmentDate = assignmentDetails.submittedDate,
                                    TotalMarks = totalMarks
                                });
                            }
                        }
                    }
                    // Add Quiz Marks if Quiz is submitted
                    if (details.Quiz != null)
                    {
                        double quizTotalMarks = await _repository.FindQuizTotalMarks(details.Quiz.Id);
                        marks = details.Quiz.ScoreAchieved;
                        totalMarks = quizTotalMarks;
                        progressResult.QuizDetails.Add(new QuizDetails
                        {
                            QuizName = details.Topic.TopicName,
                            QuizScore = marks ?? 0,
                            QuizDate = details.Quiz.CreatedDate,
                            TotalMarks = totalMarks
                        });
                    }
                }

                Dictionary<string, BehaviouralScoreboard> behaviouralFeedbacks = await _repository.GetBehaviouralFeedback(result.Id);
                if (behaviouralFeedbacks != null)
                {
                    string courseName = _repository.CourseName(result.CourseId);
                    foreach (KeyValuePair<string, BehaviouralScoreboard> behaviouralFeedback in behaviouralFeedbacks)
                    {
                        progressResult.BehaviouralScoreboard.Add(new BehaviouralScoreboard
                        {
                            category = behaviouralFeedback.Value.category,
                            TotalMarks = behaviouralFeedback.Value.TotalMarks,
                            TotalReceivedMarks = behaviouralFeedback.Value.TotalReceivedMarks,
                            DateBehave = behaviouralFeedback.Value.DateBehave
                        });
                        marks += behaviouralFeedback.Value.TotalReceivedMarks;
                        totalMarks += behaviouralFeedback.Value.TotalMarks;
                    }
                }
            }

            return progressResult;
        }


        /// <summary>
        /// Checks the availability of dates for a new course start.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <param name="newStartDate">The new start date for the course.</param>
        /// <param name="courseId">The ID of the course.</param>
        /// <param name="batchId">The ID of the batch.</param>
        /// <returns>True if the date is available; otherwise, false.</returns>
        [HttpGet("CheckDateAvailability")]
        public async Task<bool> CheckDateAvailability(string internId, DateTime newStartDate, string courseId, string batchId)
        {
            var newCourseDuration = _repository.Duration(courseId);
            var existingworkingDays = await _repository.GetWorkingDays(internId);
            var currentBatchWorkingDays = await _repository.GetWorkingDaysFromBatch(batchId);
            var newCourseEndDate = CalculateDate(newStartDate, newCourseDuration, currentBatchWorkingDays);
           
            var existingInternships = await _repository.GetActiveInternshipDetails(internId);
            var committedDates = new List<DateTime>();
            var newCourseDate = new List<DateTime>();

            foreach (var existingInternship in existingInternships)
            {
                var existingCourseDuration = _repository.Duration(existingInternship.CourseId);
                var endDates = CalculateDate(existingInternship.StartDate, existingCourseDuration, existingworkingDays);
                var i = existingInternship.StartDate;
                while (i <= endDates)
                {
                    committedDates.Add(i);
                    i = i.AddDays(1);
                }
            }

            var j = newStartDate;
            while (j <= newCourseEndDate)
            {
                newCourseDate.Add(j);
                j = j.AddDays(1);
            }

            bool isAvailable = newCourseDate.All(date => !committedDates.Contains(date));
            return isAvailable;
        }
    }
}
