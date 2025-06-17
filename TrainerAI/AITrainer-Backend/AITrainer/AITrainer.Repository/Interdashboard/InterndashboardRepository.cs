using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;
using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Core.Dto.Interndashboard;
using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.Core.Dto.Quizes;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Util;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace AITrainer.AITrainer.Repository.Interdashboard
{
    public class InterndashboardRepository : IInterndashboardRepository
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;

        public InterndashboardRepository(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }

        /// <summary>
        /// Retrieves the ID of the intern based on the user ID asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>The ID of the intern associated with the provided user ID.</returns>
        public string GetInternId(string userId)
        {
            var internId = _dbContext.Intern.Where(u => u.UserId == userId)
                    .Select(u => u.Id)
                    .FirstOrDefault();

            return internId;
        }

        /// <summary>
        /// Retrieves a list of active internships along with their associated courses for a specific intern asynchronously.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>A list of InternCourseDto objects containing internship details.</returns>
        public async Task<List<InternCourseDto>> CourseByActive(string internId)
        {
            var course = await _dbContext.Internship
                .Where(u => u.InternId == internId && u.Status == true && u.isDismissed == false)
                .Select(u => new InternCourseDto
                {
                    IntershipId = u.Id,
                    CourseId = u.CourseId,
                    StartDate = ConvertTime.UtcToLocal(u.StartDate),
                    Status = u.Status
                })
                .ToListAsync();

            return course;
        }

        /// <summary>
        /// Retrieves the course associated with the internship for a specific intern asynchronously.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>An InternCourseDto object containing the course details.</returns>
        public async Task<InternCourseDto> Course(string internId)
        {
            var course = await _dbContext.Internship
                .Where(u => u.InternId == internId && u.isDismissed == false)
                .Select(u => new InternCourseDto
                {
                    CourseId = u.CourseId,
                    StartDate = ConvertTime.UtcToLocal(u.StartDate),
                })
                .FirstOrDefaultAsync();

            return course;
        }

        /// <summary>
        /// Retrieves the name of the course associated with the provided course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>The name of the course.</returns>
        public string CourseName(string courseId)
        {
            var courseName = _dbContext.Courses
                .Where(u => u.Id == courseId)
                .Select(u => u.Name)
                .FirstOrDefault();

            return courseName;
        }

        /// <summary>
        /// Retrieves the duration of the course associated with the provided course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>The duration of the course.</returns>
        public int Duration(string courseId)
        {
            var duration = _dbContext.Courses
                .Where(u => u.Id == courseId)
                .Select(u => u.Duration)
                .FirstOrDefault();

            return duration;
        }

        /// <summary>
        /// Retrieves a list of topics associated with the provided course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>A list of topics.</returns>
        public async Task<List<Topic>> GetTopic(string courseId)
        {
            var topic = await _dbContext.Topics
                .Where(u => u.CourseId == courseId && u.IsDeleted == false)
                .OrderBy(u => u.Index)
                .ToListAsync();

            return topic;
        }

        /// <summary>
        /// Retrieves a list of assignments for a specific topic within an internship, along with submission information if available.
        /// </summary>
        /// <param name="topicId">The ID of the topic.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>A list of assignment details.</returns>
        public List<InternAssignmentInfoDto> GetAssignment(string topicId, string internshipId)
        {
            var assignments = _dbContext.Assignments
                .Where(u => u.TopicId == topicId && u.IsDeleted == false)
                .Select(u => new InternAssignmentInfoDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Content = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(u.Content),
                    Marks = u.Marks,
                })
                .ToList();
            foreach (var assignment in assignments)
            {
                var submission = _dbContext.AssignmentSubmissions
                    .FirstOrDefault(s => s.AssignmentId == assignment.Id && !s.IsDeleted && s.InternshipId == internshipId);

                if (submission != null)
                {
                    bool isEvaluated = _dbContext.AssignmentFeedbacks.Where(i => i.InternshipId == internshipId && i.SubmitedAssgnimentId == submission.Id && !i.IsDeleted).Select(i => i.IsPublished).FirstOrDefault();
                    assignment.SubmissionLink = submission.GithubLink;
                    assignment.isPublished = isEvaluated;

                }
            }

            return assignments;
        }

        /// <summary>
        /// Retrieves the assignment history for a specific topic within an internship, including submission information if available.
        /// </summary>
        /// <param name="topicId">The ID of the topic.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>A list of assignment details including submission information.</returns>
        public List<AssginmentInfo> AssignmentHistory(string topicId, string internshipId)
        {
            var assignments = _dbContext.Assignments
                .Where(u => u.TopicId == topicId && u.IsDeleted == false)
                .ToList(); // ToList() is synchronous

            if (assignments == null || assignments.Count == 0)
            {
                return null;
            }

            var assginmentInfos = new List<AssginmentInfo>();

            foreach (var assignment in assignments)
            {
                var submissions = _dbContext.AssignmentSubmissions
                    .Where(u => u.AssignmentId == assignment.Id && u.IsDeleted == false && u.InternshipId == internshipId)
                    .ToList(); // ToList() is synchronous

                if (submissions == null || submissions.Count == 0)
                {
                    assginmentInfos.Add(new AssginmentInfo
                    {
                        AssignmentId = assignment.Id,
                        AssignmentTitle = assignment.Name,
                    });
                }
                else
                {
                    foreach (var submission in submissions)
                    {
                        assginmentInfos.Add(new AssginmentInfo
                        {
                            AssignmentId = assignment.Id,
                            AssignmentTitle = assignment.Name,
                            SubmissionId = submission.Id,
                            SubmissionLink = submission.GithubLink,
                            submittedDate = submission.SubmitedDate
                        });
                    }
                }
            }

            return assginmentInfos;
        }

        /// <summary>
        /// Retrieves the journal history for a specific topic within an internship.
        /// </summary>
        /// <param name="topicId">The ID of the topic.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>The journal data and its last updated date.</returns>
        public JournalDataInfo JournalHistory(string topicId, string internshipId)
        {
            var journal = _dbContext.Journals
                .Where(u => u.Topic_Id == topicId && u.Internship_Id == internshipId && u.IsDeleted == false)
                .Select(u => new JournalDataInfo
                {
                    Id = u.Id,
                    Data = u.Data,
                    Date = u.UpdatedDate
                })
                .FirstOrDefault();

            return journal;
        }

        /// <summary>
        /// Retrieves assignment information by its ID and assignment submission ID.
        /// </summary>
        /// <param name="id">The ID of the assignment.</param>
        /// <param name="assignmentSubmisionId">The ID of the assignment submission.</param>
        /// <returns>Assignment information including its title, submission link (if available), submission ID, assignment content, marks, and submission date.</returns>
        public async Task<AssginmentInfo> GetAssignmentById(string id, string assignmentSubmisionId)
        {
            var Assignment = await _dbContext.Assignments
            .Where(assignment => assignment.Id == id && assignment.IsDeleted == false)
            .FirstOrDefaultAsync();

            var submision = await _dbContext.AssignmentSubmissions
                .Where(u => u.Id == assignmentSubmisionId && u.IsDeleted == false)
                .FirstOrDefaultAsync();

            var assignmentResponseList = new List<AssignmentInfoDto>
            {
                new AssignmentInfoDto
                {
                    Content = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(Assignment.Content),
                    Marks = Assignment.Marks,
                }
            };

            if (submision == null)
            {
                return new AssginmentInfo
                {
                    AssignmentTitle = Assignment.Name,
                    Assignment = assignmentResponseList,
                };
            }

            return new AssginmentInfo
            {
                AssignmentTitle = Assignment.Name,
                SubmissionLink = submision.GithubLink,
                SubmissionId = submision.Id,
                Assignment = assignmentResponseList,
                submittedDate = submision.SubmitedDate
            };
        }

        /// <summary>
        /// Retrieves journal details by its ID.
        /// </summary>
        /// <param name="id">The ID of the journal.</param>
        /// <returns>Journal details including its data and date of update.</returns>
        public async Task<Journal> GetJournalDetails(string id)
        {
            var journal = await _dbContext.Journals.FirstOrDefaultAsync(u => u.Id == id && u.IsDeleted == false);

            return journal;
        }

        /// <summary>
        /// Retrieves the active course name for a given intern.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>Course information including its ID and name.</returns>
        public async Task<CourseInfo> ActiveCourseName(string? internshipId)
        {
               var  courseId = await _dbContext.Internship
                    .Where(u => u.Id == internshipId && u.Status == true && u.isDismissed == false)
                    .Select(u => u.CourseId)
                    .FirstOrDefaultAsync();

            var cousrse = await _dbContext.Courses
                .Where(u => u.Id == courseId)
                  .Select(c => new CourseInfo
                  {
                      CourseId = c.Id,
                      CourseName = c.Name,
                  })
                .FirstOrDefaultAsync();

            return cousrse;
        }

        /// <summary>
        /// Retrieves the names of all courses associated with a given intern.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>A list of course information including their IDs and names.</returns>
        public async Task<List<CourseInfo>> AllCourseName(string? internId, string? internshipId)
        {
            var internships = await _dbContext.Internship
                    .Where(u => u.InternId == internId && u.isDismissed == false)
                    .Select(u => new { CourseId = u.CourseId, Id = u.Id })
                    .ToListAsync();

            var courses = (from internship in internships
                           join course in _dbContext.Courses on internship.CourseId equals course.Id
                           select new CourseInfo
                           {
                               CourseId = course.Id,
                               CourseName = course.Name,
                               InternshipId = internship.Id
                           }).ToList();

            return courses;
        }

        /// <summary>
        /// Retrieves course information for a specific course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>Course information including its ID and start date.</returns>
        public async Task<InternCourseDto> CourseListById(string courseId)
        {
            var course = await _dbContext.Internship
                .Where(u => u.CourseId == courseId && u.isDismissed == false)
                .Select(u => new InternCourseDto
                {
                    CourseId = u.CourseId,
                    StartDate = u.StartDate
                })
                .FirstOrDefaultAsync();

            return course;
        }

        /// <summary>
        /// Retrieves course details associated with a specific internship ID.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>Course details including its ID and start date.</returns>
        public async Task<InternCourseDto> GetCourseDetails(string internshipId)
        {
            var course = await _dbContext.Internship
                .Where(u => u.Id == internshipId && u.isDismissed == false)
                .Select(u => new InternCourseDto
                {
                    CourseId = u.CourseId,
                    StartDate = u.StartDate,
                })
                .FirstOrDefaultAsync();

            return course;
        }

        /// <summary>
        /// Retrieves unique intern IDs associated with a specific batch ID.
        /// </summary>
        /// <param name="batchId">The ID of the batch.</param>
        /// <returns>List of unique intern IDs.</returns>
        public async Task<List<string>> GetuniqueInternIds(string batchId)
        {
            var activeInternIds = await _dbContext.Intern
            .Where(i => i.BatchId == batchId && i.IsDeleted == false)
            .Select(i => i.Id)
            .Distinct()
            .ToListAsync();

            return activeInternIds;
        }

        /// <summary>
        /// Retrieves the feedback rating for a specific journal.
        /// </summary>
        /// <param name="journalId">The ID of the journal.</param>
        /// <returns>The feedback rating for the journal.</returns>
        public async Task<double?> GetJournalFeedbackDetails(string journalId)
        {
            var journalfeedback = await _dbContext.JournalFeedbacks
                .Where(u => u.JournalId == journalId && u.IsPublished == true)
                .Select(u => u.Rating)
                .FirstOrDefaultAsync();

            return journalfeedback;
        }

        /// <summary>
        /// Retrieves the marks received for a specific assignment submission.
        /// </summary>
        /// <param name="submissionId">The ID of the assignment submission.</param>
        /// <returns>The marks received for the assignment submission.</returns>
        public async Task<double?> AssignmentMarks(string SubmissionId)
        {
            var assignmentFeedback = await _dbContext.AssignmentFeedbacks
                .Where(u => u.SubmitedAssgnimentId == SubmissionId && u.IsPublished == true)
                .Select(u => u.Score)
                .FirstOrDefaultAsync();

            return assignmentFeedback;
        }

        /// <summary>
        /// Retrieves the total marks assigned for a specific assignment.
        /// </summary>
        /// <param name="assignmentId">The ID of the assignment.</param>
        /// <returns>The total marks assigned for the assignment.</returns>
        public async Task<double> AssignmentTotalMarks(string assignmentId)
        {
            var assignment = await _dbContext.Assignments
                .Where(u => u.Id == assignmentId)
                .Select(u => u.Marks)
                .FirstOrDefaultAsync();

            return assignment;
        }

        /// <summary>
        /// Retrieves the details of a user associated with a specific intern ID.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>The user details associated with the intern ID.</returns>
        public async Task<ApplicationUser> GetUserDeatils(string InternId)
        {
            var userId = await _dbContext.Intern
                .Where(u => u.Id == InternId)
                .Select(u => u.UserId)
                .FirstOrDefaultAsync();

            var user = await _userManager.FindByIdAsync(userId);

            return user;
        }

        /// <summary>
        /// Retrieves the ID of the internship associated with a specific intern and course ID.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>The ID of the internship associated with the provided intern and course ID.</returns>
        public string GetInternshipId(string internId, string courseId)
        {
            var internshipId = _dbContext.Internship
                .Where(u => u.InternId == internId && u.CourseId == courseId && u.isDismissed == false)
                .Select(u => u.Id + "###" + u.StartDate)
                .FirstOrDefault();

            return internshipId;
        }

        /// <summary>
        /// Retrieves internship details for a specific intern.
        /// </summary>
        /// <param name="InternId">The ID of the intern.</param>
        /// <returns>A list of internship details associated with the provided intern ID.</returns>
        public async Task<List<Internship>> GetInternshipDetails(string InternId)
        {
            var internship = await _dbContext.Internship
                .Where(u => u.InternId == InternId && u.isDismissed == false)
                .ToListAsync();

            return internship;
        }

        /// <summary>
        /// Retrieves active internship details for a specific intern.
        /// </summary>
        /// <param name="InternId">The ID of the intern.</param>
        /// <returns>A list of active internship details associated with the provided intern ID.</returns>
        public async Task<List<Internship>> GetActiveInternshipDetails(string InternId)
        {
            var internship = await _dbContext.Internship
                .Where(u => u.InternId == InternId && u.Status == true)
                .ToListAsync();

            return internship;
        }

        /// <summary>
        /// Retrieves the working days for a specific intern based on their internship details.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>A list of working days associated with the provided intern ID.</returns>
        public async Task<List<string>> GetWorkingDays(string internId)
        {
            Intern? intern = await _dbContext.Intern
            .Where(i => i.Id == internId && i.IsDeleted == false)
             .FirstOrDefaultAsync();

               if (intern == null)
                return null;

              Batch? batch = await _dbContext.Batch
                .Where(b => b.Id == intern.BatchId && b.IsDeleted == false)
                .FirstOrDefaultAsync();

            if (batch == null)
                return null;

            return batch.WeekdaysNames;
        }

        /// <summary>
        /// Retrieves the working days for a specific batch based on its ID.
        /// </summary>
        /// <param name="batchId">The ID of the batch.</param>
        /// <returns>A list of working days associated with the provided batch ID.</returns>
        public async Task<List<string>> GetWorkingDaysFromBatch(string batchId)
        {


            var workingDays = _dbContext.Batch
                .Where(u => u.Id == batchId)
                .AsEnumerable()
                .SelectMany(i => i.WeekdaysNames)
                .ToList();

            return workingDays;
        }

        /// <summary>
        /// Retrieves the ID of the intern associated with a specific internship and course.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>The ID of the intern associated with the provided internship and course.</returns>
        public async Task<string> GetInternDetails(string internshipId, string CourseId)
        {
            var internId = await _dbContext.Internship
                .Where(u => u.Id == internshipId && u.CourseId == CourseId && u.isDismissed == false)
                .Select(u => u.InternId)
                .FirstOrDefaultAsync();

            return internId;
        }

        /// <summary>
        /// Retrieves the journal template associated with a specific course.
        /// </summary>
        /// <param name="CourseId">The ID of the course.</param>
        /// <returns>The journal template associated with the provided course.</returns>
        public async Task<JournalTemplate> GetJournalFromCourse(string CourseId)
        {
            var journalTemplate = await _dbContext.Courses.FirstOrDefaultAsync(i => i.Id == CourseId);
            var journal = await _dbContext.JournalTemplate.FirstOrDefaultAsync(i => i.Id == journalTemplate.JournalTemplate_Id);
            return journal;
        }

        /// <summary>
        /// Retrieves the leave details for a specific intern.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>An array of DateTime representing the leave dates within the working days of the intern.</returns>
        public async Task<DateTime[]> GetLeaveDetails(string internId)
        {
            var leaveDetails = await _dbContext.LeaveApplications
                .Where(i => i.InternId == internId).Where(i => i.leaveStatus == "Approved")
                .Where(i => i.isDeleted == false)
                .ToListAsync();
            List<DateTime> leaveDates = new List<DateTime>();

            foreach (var leave in leaveDetails)
            {
                DateTime currentDate = leave.leaveStartDate;

                while (currentDate <= leave.leaveEndDate)
                {
                    leaveDates.Add(currentDate);
                    currentDate = currentDate.AddDays(1);
                }
            }

            var workingDays = await GetWorkingDays(internId);

            List<DateTime> leaveDatesInWorkingDays = new List<DateTime>();

            foreach (var leave in leaveDates)
            {
                if (workingDays.Contains(leave.DayOfWeek.ToString()))
                {
                    leaveDatesInWorkingDays.Add(leave.Date);
                }
            }

            return leaveDatesInWorkingDays.ToArray();
        }

        /// <summary>
        /// Updates the status of an internship to false, indicating a change.
        /// </summary>
        /// <param name="internshipId">The ID of the internship to be updated.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        public async Task MakeChange(string internshipId)
        {
            var result = await _dbContext.Internship.FirstOrDefaultAsync(i => i.Id == internshipId);
            result.Status = false;
            await _dbContext.SaveChangesAsync();
        }

        /// <summary>
        /// Retrieves a list of active internships that have not been dismissed.
        /// </summary>
        /// <returns>A list of active internships.</returns>
        public async Task<List<Internship>> getActiveInternships()
        {
            var activeInternship = await _dbContext.Internship.Where(i => i.Status == true && i.isDismissed == false).ToListAsync();
            return activeInternship;
        }

        /// <summary>
        /// Updates the status of an internship.
        /// </summary>
        /// <param name="internship">The internship object containing the updated status.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task UpdateInternshipStatus(Internship internship)
        {
            var result = await _dbContext.Internship.FirstOrDefaultAsync(i => i.Id == internship.Id);
            result.Status = false;
            await _dbContext.SaveChangesAsync();

        }

        /// <summary>
        /// Retrieves the quiz submission history for a specific topic and internship.
        /// </summary>
        /// <param name="topicId">The ID of the topic.</param>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>The quiz submission history.</returns>
        public QuizSubmission QuizHistory(string topicId, string internshipId)
        {
            var reult = _dbContext.QuizSubmissions.Where(i => i.TopicId == topicId && i.InternshipId == internshipId).FirstOrDefault();
            return reult;

        }

        /// <summary>
        /// Retrieves quiz responses by submission ID.
        /// </summary>
        /// <param name="id">The ID of the quiz submission.</param>
        /// <returns>A list of quiz responses.</returns>
        public async Task<List<QuizQuestyResponseDto>> GetQuizById(string id)
        {
            var result = await _dbContext.QuizSubmissions.Where(i => i.Id == id && i.IsDeleted == false).ToListAsync();
            var quizResponses = new List<QuizQuestyResponseDto>();

            foreach (var submission in result)
            {
                var deserializedResponse = JsonConvert.DeserializeObject<QuizQuestyResponseDto>(submission.QuestionList);
                quizResponses.Add(deserializedResponse);
            }

            return quizResponses;
        }

        /// <summary>
        /// Retrieves the quiz link associated with a topic.
        /// </summary>
        /// <param name="topicId">The ID of the topic.</param>
        /// <returns>The quiz link serialized as a string.</returns>
        public async Task<string> GetQuizLink(string TopicId)
        {
            var Topic = await _dbContext.Topics.Where(i => i.Id == TopicId && i.IsDeleted == false).FirstOrDefaultAsync();
            var result = await _dbContext.Topics.Where(i => i.Id == TopicId && i.IsDeleted == false).Select(i => i.QuizLink).FirstOrDefaultAsync();
            var serializedResult = JsonConvert.SerializeObject(result);

            return serializedResult;
        }

        /// <summary>
        /// Finds the total marks for a quiz submission.
        /// </summary>
        /// <param name="quizSubmissionId">The ID of the quiz submission.</param>
        /// <returns>The total marks for the quiz submission.</returns>
        public async Task<double> FindQuizTotalMarks(string QuizSubmissionId)
        {
            double total = 0;
            var QuizTopicID = await _dbContext.QuizSubmissions.Where(i => i.Id == QuizSubmissionId).Select(i => i.TopicId).FirstOrDefaultAsync();
            var Quizes = await _dbContext.Quiz.Where(i => i.TopicId == QuizTopicID && i.IsDeleted == false).ToListAsync();
            foreach (var quiz in Quizes)
            {
                total += quiz.QuizMarks;
            }
            return total;
        }

        /// <summary>
        /// Retrieves the user ID associated with an intern.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns>The user ID associated with the intern.</returns>
        public async Task<string> getUserId(string InternId)
        {
            var userId = await _dbContext.Intern.Where(i => i.Id == InternId && i.IsDeleted == false).Select(i => i.UserId).FirstOrDefaultAsync();
            return userId;
        }

        /// <summary>
        /// Retrieves the behavioral feedback for a specific internship.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>The behavioral scoreboard for the internship.</returns>
        public async Task<Dictionary<string, BehaviouralScoreboard>> GetBehaviouralFeedback(string internshipId)
        {
            List<GeneralInternshipFeedback> behaviouralFeedback = await _dbContext.GeneralInternshipFeedbacks
                .Include(f => f.Category)
                .Where(i => i.InternshipId == internshipId && i.Type == "Behaviour" && !i.IsDeleted && i.IsPublished == true)
                .ToListAsync();

            if (behaviouralFeedback.Count == 0)
                return null;

            Dictionary<string, BehaviouralScoreboard> behaviouralScores = new Dictionary<string, BehaviouralScoreboard>();

            IEnumerable<IGrouping<string, GeneralInternshipFeedback>> feedbackByTemplateGrouped = behaviouralFeedback.GroupBy(f => f.Category.BehaviourTemplateId);

            foreach (IGrouping<string, GeneralInternshipFeedback> templateGroup in feedbackByTemplateGrouped)
            {
                string templateId = templateGroup.Key;

                List<GeneralInternshipFeedback> feedbackByTemplate = templateGroup.ToList();

                List<BehaviourCategory> categories = await _dbContext.BehaviourCategories
                    .Where(c => c.BehaviourTemplateId == templateId)
                    .ToListAsync();

                double totalMarks = categories.Sum(category => category.TotalMarks);
                double? totalReceivedMarks = feedbackByTemplate.Sum(item => item.ReceivedMarks);

                List<BehavioralCategoryDetails> categoryDetailsList = categories.Select(category => new BehavioralCategoryDetails
                {
                    CategoryName = category.CategoryName,
                    categoryTotalMark = category.TotalMarks,
                    categoryReceivedMark = feedbackByTemplate
                        .Where(feedback => feedback.BehaviourCategoryId == category.Id)
                        .Sum(feedback => feedback.ReceivedMarks ?? 0)
                }).ToList();

                DateTime? dateTime = feedbackByTemplate.Select(i => i.CreatedDate).FirstOrDefault();

                BehaviouralScoreboard behaviouralScore = new()
                {
                    TotalMarks = totalMarks,
                    TotalReceivedMarks = totalReceivedMarks,
                    category = categoryDetailsList,
                    DateBehave = dateTime
                };

                behaviouralScores.Add(templateId, behaviouralScore);
            }

            return behaviouralScores;
        }

        /// <summary>
        /// Retrieves the template ID associated with the provided internship ID.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns>The template ID associated with the provided internship ID.</returns>
        public async Task<string> GetTemplateId(string internshipId)
        {
            Internship? result = await _dbContext.Internship.Where(i => i.Id == internshipId).FirstOrDefaultAsync();
            return string.Join(",", result.BehaviourTemplateId);
        }
    }
}
