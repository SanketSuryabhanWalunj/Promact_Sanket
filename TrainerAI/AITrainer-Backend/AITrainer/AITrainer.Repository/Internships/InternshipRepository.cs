using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Text;
using static AITrainer.AITrainer.Repository.Interns.InternRepository;

namespace AITrainer.AITrainer.Repository.Internships
{
    public class InternshipRepository : IInternshipRepository
    {
        #region Dependencies
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        #endregion
        #region Constructors
        public InternshipRepository(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
        }
        #endregion
        #region Public methods

        /// <summary>
        /// Retrieves a list of internships with optional search and filter options.
        /// </summary>
        /// <param name="searchWord">The search keyword to filter internships by name or other criteria.</param>
        /// <param name="userId">The user ID of the logged-in user.</param>
        /// <param name="filterWord">The filter keyword to further refine the list of internships.</param>
        /// <returns> Returns a list of internships filtered and sorted as per the search and filter criteria. </returns>
        public async Task<IEnumerable<InternshipList>> GetInternshipListAsync(string? searchWord, string userId, string? filterWord, string? batchFilter, string? statusFilter, string? courseNameFilter, string? careerPathFilter)
        {
            var role = await _userManager.FindByIdAsync(userId);
            List<Internship> internships = new List<Internship>();

            // Fetching interns, courses, and active internships
            var interns = await _dbContext.Intern.Where(intern => !intern.IsDeleted).Include(intern => intern.CareerPath).Include(x => x.Batch).ToListAsync();
            var courses = await _dbContext.Courses.Where(c => !c.IsDeleted).ToListAsync();
            var courseId = courses.Select(i => i.Id).ToList();
            var activeInternships = await _dbContext.Internship
                .Where(i => i.isDismissed == false && courseId.Contains(i.CourseId)).ToListAsync();
            var organizationId = await _dbContext.Admin
                .Where(u => u.UserId == userId).Select(u => u.OrganizationId).FirstOrDefaultAsync();

            var usersInOrganization = await _dbContext.Admin
                .Where(u => u.OrganizationId == organizationId).Select(u => u.UserId).ToListAsync();

            var mentors = activeInternships.Select(i => i.MentorId).ToList();

            var distinctMentors = mentors.SelectMany(m => m.Split(',')).Distinct()
                .Where(mentor => usersInOrganization.Contains(mentor)).ToList();

            foreach (var m in activeInternships)
            {
                var mentorList = m.MentorId.Split(",").ToList();
                if (mentorList.Any(mentor => distinctMentors.Contains(mentor)))
                {
                    // Check if the associated intern is not deleted.
                    if (interns.Any(intern => intern.Id == m.InternId))
                    {
                        internships.Add(m);
                    }
                }
            }

            if (role!.Type == "Technical Administrator")
            {
                internships = internships.OrderByDescending(m => m.CreatedDate).ToList();
            }
            else
            {
                internships = internships.Where(i => ("," + i.MentorId + ",").Contains("," + userId + ",")
                || i.MentorId.StartsWith(userId + ",") || i.MentorId.EndsWith("," + userId + ","))
                    .OrderByDescending(m => m.CreatedDate).ToList();
            }

            // Fetching BatchName and CareerPath for each internship
            List<InternshipList> internshipList = new List<InternshipList>();
            foreach (var internship in internships)
            {
                var internInfo = interns.FirstOrDefault(i => i.Id == internship.InternId);
                var courseInfo = courses.FirstOrDefault(c => c.Id == internship.CourseId);
                var internshipEndDate = CalculateDate(internship.StartDate, courseInfo.Duration);


                var internshipInfo = new InternshipList()
                {
                    Id = internship.Id,
                    FirstName = internInfo?.FirstName ?? "Unknown",
                    LastName = internInfo?.LastName ?? "Unknown",
                    CourseName = courseInfo?.Name ?? "Unknown",
                    Mentors = GetMentors(internship.MentorId),
                    Duration = courseInfo.Duration,
                    StartDate = internship.StartDate,
                    EndTime = internshipEndDate.Date,
                    BatchName = internInfo?.Batch?.BatchName ?? "Unknown",
                    CareerPath = internInfo?.CareerPath,
                    Status = internshipEndDate < DateTime.Now ? false : internship.Status
                };
                internshipList.Add(internshipInfo);
            }

            List<InternshipList> orderedInternshipList = internshipList
                                                    .OrderBy(i => GetSortPriority(i)) // Sort by status priority first.
                                                    .ThenByDescending(m => m.StartDate) // Then, sort by StartDate.
                                                    .ToList();

            // Applying search and filter
            var searchResult = new List<InternshipList>();
            var filterResult = new List<InternshipList>();

            if (batchFilter != null)
            {
                orderedInternshipList = ApplyFilters(orderedInternshipList, "", batchFilter, null, null);
            }

            if (courseNameFilter != null)
            {
                orderedInternshipList = ApplyFilters(orderedInternshipList, "", null, courseNameFilter, null);
            }

            if (careerPathFilter != null)
            {
                orderedInternshipList = ApplyFilters(orderedInternshipList, "", null, null, careerPathFilter);
            }

            if (statusFilter != null)
            {
                if (statusFilter == "true")
                {
                    // Show active courses
                    orderedInternshipList = orderedInternshipList.Where(course => course.Status == true).ToList();
                }
                else if (statusFilter == "false")
                {
                    // Show closed courses
                    orderedInternshipList = orderedInternshipList.Where(course => course.Status == false).ToList();
                }
            }

            // Apply search and filter
            if (searchWord != null)
            {
                searchResult = ApplySearch(orderedInternshipList, searchWord);
                orderedInternshipList = searchResult;
            }

            if (filterWord != null)
            {
                filterResult = ApplyFilters(orderedInternshipList, filterWord, null, null, null);
                orderedInternshipList = filterResult;
            }

            return orderedInternshipList;
        }


        /// <summary>
        /// Creates a new internship asynchronously based on the provided internship details.
        /// </summary>
        /// <param name="internship">The internship details including course, intern, start date, batch ID, mentor ID, and behavior template ID.</param>
        /// <returns> Returns the created internship. </returns>
        public async Task<Internship> CreateInternshipAsync(InternshipDetails internship)
        {
            var existingInternship = await _dbContext.Internship
                .FirstOrDefaultAsync(i => i.CourseId == internship.CourseId
                && i.InternId == internship.InternId && i.Status == true && i.isDismissed == false);

            if (existingInternship != null)
            {
                if (!existingInternship.Status)
                {
                    throw new InternException("Course is already completed by this intern.");
                }
                throw new InternException("Course is already assigned to this intern.");
            }
            else if (existingInternship != null && existingInternship.Status == false)
            {
                throw new InternException("Course is already completed by this intern.");
            }
            var course = await _dbContext.Courses.Where(i => i.Id == internship.CourseId).FirstOrDefaultAsync();
            var internshipDetail = new Internship
            {
                Id = Guid.NewGuid().ToString(),
                CourseId = internship.CourseId,
                InternId = internship.InternId,
                StartDate = internship.StartDate,
                CreatedDate = course.CreatedDate,
                UpdatedDate = course.UpdatedDate,
                Status = true,
                MentorId = string.Join(",", internship.MentorId),
                isDismissed = false,
                BehaviourTemplateId = internship.TemplateId != null ? string.Join(",", internship.TemplateId) : null
            };
            await _dbContext.Internship.AddAsync(internshipDetail);
            await _dbContext.SaveChangesAsync();

            return internshipDetail;
        }


        /// <summary>
        /// Updates the internship asynchronously based on the provided internship details.
        /// </summary>
        /// <param name="internship">The updated internship details including intern ID and course ID.</param>
        /// <returns> Returns a boolean value indicating whether the internship update was successful. </returns>
        public async Task<bool> UpdateInternshipAsync(UpdateInternship internship)
        {
            var detail = await _dbContext.Internship
                .Where(i => (i.InternId == internship.InternId)
                && (i.CourseId == internship.CourseId && i.Status == true)).FirstOrDefaultAsync();
            detail.Status = false;
            detail.isDismissed = true;
            _dbContext.Internship.Update(detail);
            await _dbContext.SaveChangesAsync();
            if (detail.Status)
            {
                return true;
            }
            return false;
        }


        /// <summary>
        /// Retrieves the first name of the user based on the provided user ID asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <returns> Returns the first name of the user associated with the provided user ID. </returns>
        public async Task<string> GetUserName(string userId)
        {
            var userName = await _userManager.FindByIdAsync(userId);
            return userName.FirstName;
        }


        /// <summary>
        /// Retrieves intern information based on the provided intern ID asynchronously.
        /// </summary>
        /// <param name="internId">The ID of the intern.</param>
        /// <returns> Returns the intern information associated with the provided intern ID. </returns>
        public async Task<Intern> GetInternName(string internId)
        {
            var intern = await _dbContext.Intern.FindAsync(internId);
            return intern;
        }


        /// <summary>
        /// Retrieves topic information for the provided overall feedback asynchronously.
        /// </summary>
        /// <param name="feedback">The overall feedback response.</param>
        /// <returns> Returns the intern overall feedback with topic information. </returns>
        public async Task<InternOverallFeedback> GetTopicName(OverallFeedbackResponse feedback)
        {
            if (feedback.Type == "Assignment")
            {
                var assignment = await _dbContext.AssignmentSubmissions
                    .Where(i => i.Id == feedback.AssignmentSubmissionId).FirstOrDefaultAsync();
                var assignmentInfo = await _dbContext.Assignments
                    .Where(i => i.Id == assignment.AssignmentId).FirstOrDefaultAsync();
                string topicName = await _dbContext.Topics
                    .Where(i => i.Id == assignmentInfo.TopicId).Select(f => f.TopicName).FirstOrDefaultAsync();

                var internshipInfo = await _dbContext.Internship
                    .Where(i => i.Id == feedback.InternshipId).FirstOrDefaultAsync();
                var course = await _dbContext.Courses.Where(i => i.Id == internshipInfo.CourseId).FirstOrDefaultAsync();

                InternOverallFeedback internOverallFeedback = new InternOverallFeedback()
                {
                    CourseName = course.Name,
                    TopicName = topicName,
                    Type = feedback.Type,
                    Feedback = feedback.Message.Feedback,
                    ImprovementArea = feedback.Message.ImprovementArea,
                    Comment = feedback.Message.Comment,
                    JournalRating = feedback.Message.Rating,
                    AssignmentReceivedMarks = feedback.Message.Score,
                    AssignmentTotalMarks = assignmentInfo.Marks,
                    BehaviouralScore = feedback.Message.Score,
                    BehaviouralTotalScore = null,
                    ReviewerName = feedback.ReviewerName,
                    UpdatedDate = feedback.UpdatedDate
                };
                return internOverallFeedback;

            }
            else if (feedback.Type == "Journal")
            {

                var journal = await _dbContext.Journals.Where(i => i.Id == feedback.JournalId).FirstOrDefaultAsync();
                var topicInfo = await _dbContext.Topics.Where(i => i.Id == journal.Topic_Id).FirstOrDefaultAsync();

                var internshipInfo = await _dbContext.Internship.Where(i => i.Id == feedback.InternshipId).FirstOrDefaultAsync();
                var course = await _dbContext.Courses.Where(i => i.Id == internshipInfo.CourseId).FirstOrDefaultAsync();

                InternOverallFeedback internOverallFeedback = new InternOverallFeedback()
                {
                    CourseName = course.Name,
                    TopicName = topicInfo.TopicName,
                    Type = feedback.Type,
                    Feedback = feedback.Message.Feedback,
                    ImprovementArea = feedback.Message.ImprovementArea,
                    Comment = feedback.Message.Comment,
                    JournalRating = feedback.Message.Rating,
                    AssignmentReceivedMarks = feedback.Message.Score,
                    AssignmentTotalMarks = null,
                    BehaviouralScore = feedback.Message.Score,
                    BehaviouralTotalScore = null,
                    ReviewerName = feedback.ReviewerName,
                    UpdatedDate = feedback.UpdatedDate
                };
                return internOverallFeedback;
            }
            else
            {
                var internshipInfo = await _dbContext.Internship.Where(i => i.Id == feedback.InternshipId).FirstOrDefaultAsync();
                var course = await _dbContext.Courses.Where(i => i.Id == internshipInfo.CourseId).FirstOrDefaultAsync();
                List<string> categoryIds = await _dbContext.GeneralInternshipFeedbacks.Where(i => i.InternshipId == feedback.InternshipId && i.IsDeleted == false && i.IsPublished == true).Select(i => i.BehaviourCategoryId).ToListAsync();
                List<double> Marks = await _dbContext.BehaviourCategories.Where(i => categoryIds.Contains(i.Id)).Select(i => i.TotalMarks).ToListAsync();
                double totalScore = Marks.Sum(mark => mark);
                InternOverallFeedback internOverallFeedback = new InternOverallFeedback()
                {
                    CourseName = course.Name,
                    TopicName = null,
                    Type = feedback.Type,
                    Feedback = feedback.Message.Feedback,
                    ImprovementArea = feedback.Message.ImprovementArea,
                    Comment = feedback.Message.Comment,
                    JournalRating = feedback.Message.Rating,
                    AssignmentReceivedMarks = null,
                    AssignmentTotalMarks = null,
                    BehaviouralScore = feedback.Message.Score,
                    BehaviouralTotalScore = totalScore,
                    ReviewerName = feedback.ReviewerName,
                    UpdatedDate = feedback.UpdatedDate
                };
                return internOverallFeedback;
            }
        }


        /// <summary>
        /// Creates general internship feedback asynchronously.
        /// </summary>
        /// <param name="feedback">The general internship feedback to create.</param>
        /// <returns> Returns the overall feedback response containing the details of the created feedback. </returns>
        public async Task<OverallFeedbackResponse> CreateGeneralFeedback(GeneralInternshipFeedback feedback)
        {
            await _dbContext.GeneralInternshipFeedbacks.AddAsync(feedback);
            await _dbContext.SaveChangesAsync();
            OverallFeedbackResponse generalFeedbacks = new OverallFeedbackResponse
            {
                Id = feedback.Id,
                ReviewerId = feedback.CreatedById,
                ReviewerName = feedback.CreatedByName,
                Message = new MessageFormat
                {
                    Comment = feedback.Comment
                },
                Type = "General",
                UpdatedDate = feedback.UpdatedDate
            };
            return (generalFeedbacks);
        }


        /// <summary>
        /// Retrieves overall feedback for a specific internship asynchronously.
        /// </summary>
        /// <param name="internshipId">The ID of the internship to retrieve feedback for.</param>
        /// <returns> Returns a list of overall feedback responses for the specified internship. </returns>
        public async Task<List<OverallFeedbackResponse>> GetOverallFeedback(string internshipId)
        {
            List<OverallFeedbackResponse> mergedFeedback = new List<OverallFeedbackResponse>();

            var journalFeedback = await GetJournalFeedback(internshipId);
            mergedFeedback.AddRange(await ConvertToFeedback<JournalFeedback>(journalFeedback, "Journal"));

            var assignmentFeedback = await GetAssignmentFeedback(internshipId);
            mergedFeedback.AddRange(await ConvertToFeedback<AssignmentFeedback>(assignmentFeedback, "Assignment"));

            var generalFeedback = await GetGeneralFeedback(internshipId);
            mergedFeedback.AddRange(await ConvertToFeedback<GeneralInternshipFeedback>(generalFeedback, "General"));

            List<OverallFeedbackResponse> behaviourFeedbackResonses = new List<OverallFeedbackResponse>();
            foreach (var item in mergedFeedback)
            {
                if (item.Type == "Behaviour")
                {
                    behaviourFeedbackResonses.Add(item);
                }
            }

            foreach (var item in behaviourFeedbackResonses)
            {
                mergedFeedback.Remove(item);
            }

            var behaviourFeedback = await GetBehaviourFeedbackInOne(behaviourFeedbackResonses);
            foreach (OverallFeedbackResponse feedbackItem in behaviourFeedback)
            {
                if (!string.IsNullOrEmpty(feedbackItem.InternshipId))
                {
                    mergedFeedback.Add(feedbackItem);
                }
            }



            mergedFeedback = mergedFeedback.OrderBy(f => f.CreatedDate).ToList();
            return mergedFeedback;
        }


        /// <summary>
        /// Retrieves required overall feedback for a batch of internships asynchronously.
        /// </summary>
        /// <param name="internshipIds">The list of internship IDs for which feedback is required.</param>
        /// <param name="intern">The intern for whom the feedback is being retrieved.</param>
        /// <returns> Returns batchwise internship information containing the intern ID, name, and feedback list. </returns>
        public async Task<BatchwiseInternshipInfo> GetRequiredOverallFeedback(List<string> internshipIds, Intern intern, string? batchName, List<string>? courseName, List<string>? careerPaths, List<string>? reviewer)
        {
            if (careerPaths != null && careerPaths.Any())
            {
                if (intern.CareerPathId == null || !careerPaths.Contains(intern.CareerPathId))
                {
                    return null;
                }
            }

            List<OverallFeedbackResponse> overallFeedbackList = new List<OverallFeedbackResponse>();
            foreach (string internshipId in internshipIds)
            {
                var feedback = await GetOverallFeedback(internshipId);
                overallFeedbackList.AddRange(feedback);
            }

            List<InternOverallFeedback> internOverallFeedback = new List<InternOverallFeedback>();
            foreach (OverallFeedbackResponse feedback in overallFeedbackList)
            {
                InternOverallFeedback overallFeedback = await GetTopicName(feedback);
                internOverallFeedback.Add(overallFeedback);
            }

            if (courseName != null)
            {
                internOverallFeedback = internOverallFeedback.Where(i => courseName.Contains(i.CourseName)).ToList();
            }

            if (reviewer != null)
            {
                internOverallFeedback = internOverallFeedback.Where(i => reviewer.Contains(i.ReviewerName)).ToList();
            }

            string? careerPathID = intern.CareerPathId;
            CareerPath? careerPath = null;
            if (careerPathID != null)
            {
                careerPath = await _dbContext.CareerPaths.FirstOrDefaultAsync(c => c.Id == careerPathID);
            }

            BatchwiseInternshipInfo internFeedback = new()
            {
                InternId = intern.Id,
                Name = $"{intern.FirstName} {intern.LastName}",
                EmailId = intern.Email,
                CareerPath = careerPath,
                BatchName = batchName != null ? batchName : null,
                FeedbackList = internOverallFeedback.OrderByDescending(x => x.UpdatedDate).ToList(),
            };

            return internFeedback;
        }

        /// <summary>
        /// Retrieves a list of internship IDs associated with a specific intern asynchronously.
        /// </summary>
        /// <param name="internId">The ID of the intern to retrieve internship IDs for.</param>
        /// <returns> Returns a list of internship IDs associated with the specified intern. </returns>
        public async Task<List<string>> GetInternshipId(string internId)
        {
            return await _dbContext.Internship
                .Where(f => f.InternId == internId)
                .Select(f => f.Id)
                .ToListAsync();
        }


        /// <summary>
        /// Creates behaviour feedback for an internship asynchronously.
        /// </summary>
        /// <param name="request">The request containing behaviour feedback information.</param>
        /// <param name="userId">The ID of the user creating the feedback.</param>
        /// <returns>
        /// Returns a boolean indicating whether the operation to create behaviour feedback was successful.
        /// </returns>
        public async Task<bool> CreateBehaviourFeedback(BehaviourFeedbackRequest request, string userId)
        {
            bool IsSuccessful = false;
            int count = 0;
            string username = await GetUserName(userId);
            List<GeneralInternshipFeedback> feedbacks = new List<GeneralInternshipFeedback>();
            foreach (Category category in request.Categories)
            {
                GeneralInternshipFeedback feedback = new()
                {
                    Id = Guid.NewGuid().ToString(),
                    InternshipId = request.InternshipId,
                    BehaviourCategoryId = category.CategoryId,
                    Type = "Behaviour",
                    Comment = category.Feedback,
                    ReceivedMarks = category.ReceivedMarks,
                    CreatedById = userId,
                    CreatedByName = username,
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow,
                    IsDeleted = false,
                    IsPublished = false,
                };

                feedbacks.Add(feedback);
            }
            await _dbContext.GeneralInternshipFeedbacks.AddRangeAsync(feedbacks);
            int ans = await _dbContext.SaveChangesAsync();
            count = feedbacks.Count;
            if (count == ans)
            {
                IsSuccessful = true;
            }
            return IsSuccessful;
        }


        /// <summary>
        /// Retrieves behaviour feedback for an internship asynchronously.
        /// </summary>
        /// <param name="templateId">The ID of the behaviour template associated with the feedback.</param>
        /// <param name="internshipId">The ID of the internship for which feedback is requested.</param>
        /// <returns>
        /// Returns behaviour feedback response containing feedback details for the specified internship.
        /// </returns>
        public async Task<BehaviourFeedbackResponse> GetBehaviourFeedback(string templateId, string internshipId)
        {
            string[] templateIds = templateId.Split(',');

            List<BehaviourTemplate> templates = await _dbContext.BehaviourTemplates
                .Where(t => templateIds.Contains(t.Id))
                .ToListAsync();

            Dictionary<string, List<BehaviourCategoryFeedback>> feedbackResponses = new Dictionary<string, List<BehaviourCategoryFeedback>>();
            Dictionary<string, string> templateNamesDict = templates.ToDictionary(t => t.Id, t => t.TemplateName);

            List<GeneralInternshipFeedback> feedback = await _dbContext.GeneralInternshipFeedbacks
                .Where(f => f.InternshipId == internshipId && f.Type == "Behaviour" && !f.IsDeleted)
                .Include(f => f.Category)
                .OrderBy(f => f.UpdatedDate)
                .ToListAsync();

            List<BehaviourCategory> categories = await _dbContext.BehaviourCategories
                .Where(c => templateIds.Contains(c.BehaviourTemplateId))
                .ToListAsync();


            foreach (string id in templateIds)
            {
                List<BehaviourCategory> templateCategories = categories.Where(c => c.BehaviourTemplateId == id).ToList();
                Dictionary<string?, GeneralInternshipFeedback?> templateFeedback = feedback.Where(f => templateCategories.Any(c => c.Id == f.BehaviourCategoryId))
                    .GroupBy(f => f.BehaviourCategoryId).ToDictionary(g => g.Key, g => g.FirstOrDefault());

                List<BehaviourCategoryFeedback> templateFeedbackResponse = new List<BehaviourCategoryFeedback>();

                foreach (BehaviourCategory category in templateCategories)
                {
                    if (templateFeedback.TryGetValue(category.Id, out var feedbackItem))
                    {
                        templateFeedbackResponse.Add(new BehaviourCategoryFeedback
                        {
                            GeneralId = feedbackItem.Id,
                            CategoryId = category.Id,
                            CategoryName = category.CategoryName,
                            Feedback = feedbackItem.Comment,
                            ReceivedMarks = feedbackItem.ReceivedMarks ?? 0,
                            TotalMarks = category.TotalMarks,
                            Type = feedbackItem.Type ?? string.Empty,
                            CreatedDate = feedbackItem.UpdatedDate ?? DateTime.MinValue,
                            IsDeleted = feedbackItem.IsDeleted,
                            IsPublished = feedbackItem.IsPublished ?? false
                        });
                    }
                    else
                    {
                        templateFeedbackResponse.Add(new BehaviourCategoryFeedback
                        {
                            GeneralId = string.Empty,
                            CategoryId = category.Id,
                            CategoryName = category.CategoryName,
                            Feedback = string.Empty,
                            ReceivedMarks = 0,
                            TotalMarks = category.TotalMarks,
                            Type = string.Empty,
                            CreatedDate = DateTime.MinValue,
                            IsDeleted = false,
                            IsPublished = false
                        });
                    }
                }

                feedbackResponses.Add(id, templateFeedbackResponse);
            }

            BehaviourFeedbackResponse result = new()
            {
                TemplateName = templateNamesDict[templateId],
                CategoryWiseFeedback = feedbackResponses[templateId]
            };

            return result;
        }

        /// <summary>
        /// Publishes behaviour feedback for an internship asynchronously.
        /// </summary>
        /// <param name="request">The request containing updated behaviour feedback information.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <returns>
        /// Returns a boolean value indicating whether the behaviour feedback publishing process was successful.
        /// </returns>
        public async Task<bool> PublishBehaviourFeedback(UpdateBehviourFeedbackRequest request, string userId)
        {
            int count = 0;
            bool IsSuccessful = false;
            string username = await GetUserName(userId);
            List<GeneralInternshipFeedback> categoryFeedback = await _dbContext.GeneralInternshipFeedbacks.Where(i => !i.IsDeleted).ToListAsync();
            List<GeneralInternshipFeedback> generalInternshipFeedbacks = new List<GeneralInternshipFeedback>();
            foreach (var category in request.Categories)
            {
                GeneralInternshipFeedback feedback = categoryFeedback.Where(i => i.Id == category.GeneralId && i.InternshipId == request.InternshipId).FirstOrDefault();
                feedback.IsPublished = true;
                feedback.UpdatedDate = DateTime.UtcNow;
                feedback.CreatedById = userId;
                feedback.CreatedByName = username;
                generalInternshipFeedbacks.Add(feedback);
            }


            _dbContext.GeneralInternshipFeedbacks.UpdateRange(generalInternshipFeedbacks);
            int ans = await _dbContext.SaveChangesAsync();
            count = generalInternshipFeedbacks.Count;
            if (count == ans)
            {
                IsSuccessful = true;
            }

            return IsSuccessful;
        }


        /// <summary>
        /// Updates behaviour feedback for an internship asynchronously.
        /// </summary>
        /// <param name="request">The request containing updated behaviour feedback information.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <returns>
        /// Returns a <see cref="BehaviourFeedbackResponse"/> object containing updated behaviour feedback details.
        /// </returns>
        public async Task<BehaviourFeedbackResponse> UpdateBehaviourFeedback(UpdateBehviourFeedbackRequest request, string userId)
        {
            bool IsSuccessful = false;
            int count = 0;
            string username = await GetUserName(userId);
            List<BehaviourCategory> categories = await _dbContext.BehaviourCategories
                .Where(i => request.TemplateId.Contains(i.BehaviourTemplateId))
                .ToListAsync();

            List<GeneralInternshipFeedback> feedback = await _dbContext.GeneralInternshipFeedbacks
                .Where(f => f.InternshipId == request.InternshipId && f.Type == "Behaviour" && !f.IsDeleted)
                .Include(f => f.Category)
                .OrderBy(f => f.UpdatedDate)
                .ToListAsync();

            List<BehaviourCategoryFeedback> updatedFeedbackResponse = new List<BehaviourCategoryFeedback>();
            List<GeneralInternshipFeedback> feedbackToAddOrUpdate = new List<GeneralInternshipFeedback>();

            foreach (UpdateCategory category in request.Categories)
            {
                GeneralInternshipFeedback? categoryFeedback = feedback.FirstOrDefault(i => i.Id == category.GeneralId);
                BehaviourCategory? categoryInfo = categories.FirstOrDefault(c => c.Id == category.CategoryId);

                if (categoryInfo != null)
                {
                    if (categoryFeedback == null)
                    {
                        categoryFeedback = new GeneralInternshipFeedback
                        {
                            Id = Guid.NewGuid().ToString(),
                            InternshipId = request.InternshipId,
                            Type = "Behaviour",
                            BehaviourCategoryId = categoryInfo.Id,
                            CreatedById = userId,
                            CreatedByName = username,
                            CreatedDate = DateTime.UtcNow
                        };

                        feedbackToAddOrUpdate.Add(categoryFeedback);
                    }

                    categoryFeedback.Comment = category.Feedback;
                    categoryFeedback.ReceivedMarks = category.ReceivedMarks;
                    categoryFeedback.UpdatedDate = DateTime.UtcNow;

                    BehaviourCategoryFeedback behaviourFeedback = new()
                    {
                        GeneralId = categoryFeedback.Id,
                        CategoryId = categoryFeedback.BehaviourCategoryId,
                        CategoryName = categoryInfo.CategoryName,
                        Feedback = categoryFeedback.Comment,
                        ReceivedMarks = categoryFeedback.ReceivedMarks,
                        TotalMarks = categoryInfo.TotalMarks,
                        Type = categoryFeedback.Type,
                        CreatedDate = categoryFeedback.CreatedDate,
                        IsDeleted = categoryFeedback.IsDeleted,
                        IsPublished = categoryFeedback.IsPublished,
                    };

                    updatedFeedbackResponse.Add(behaviourFeedback);
                }
            }

            _dbContext.GeneralInternshipFeedbacks.AddRange(feedbackToAddOrUpdate);
            int ans = await _dbContext.SaveChangesAsync();
            count = updatedFeedbackResponse.Count;
            if (count == ans)
            {
                IsSuccessful = true;
            }


            BehaviourFeedbackResponse result = new()
            {
                CategoryWiseFeedback = updatedFeedbackResponse
            };

            return result;
        }



        /// <summary>
        /// Deletes behaviour feedback for an internship asynchronously.
        /// </summary>
        /// <param name="request">The request containing the behaviour feedback information to delete.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <returns>
        /// Returns a boolean value indicating whether the deletion of behaviour feedback was successful or not.
        /// </returns>
        public async Task<bool> DeleteBehaviourFeedback(UpdateBehviourFeedbackRequest request, string userId)
        {
            int count = 0;
            bool IsSuccessful = false;
            string username = await GetUserName(userId);
            List<string> feedbackIds = request.Categories.Select(category => category.GeneralId).ToList();

            List<GeneralInternshipFeedback> categoryFeedbacks = await _dbContext.GeneralInternshipFeedbacks
                .Where(i => feedbackIds.Contains(i.Id) && i.InternshipId == request.InternshipId)
                .ToListAsync();

            foreach (GeneralInternshipFeedback categoryFeedback in categoryFeedbacks)
            {
                categoryFeedback.IsDeleted = true;
                categoryFeedback.UpdatedDate = DateTime.UtcNow;
                categoryFeedback.CreatedById = userId;
                categoryFeedback.CreatedByName = username;
                categoryFeedback.IsPublished = false;
            }

            count = await _dbContext.SaveChangesAsync();

            if (count == categoryFeedbacks.Count)
            {
                IsSuccessful = true;
            }

            return IsSuccessful;
        }


        /// <summary>
        /// Checks if behaviour feedback exists for an internship asynchronously.
        /// </summary>
        /// <param name="internshipId">The ID of the internship to check for behaviour feedback.</param>
        /// <returns> Returns the behaviour feedback if it exists; otherwise, returns null. </returns>
        public async Task<GeneralInternshipFeedback> IsBehaviourFeedbackExist(string internshipId)
        {
            GeneralInternshipFeedback? feedback = await _dbContext.GeneralInternshipFeedbacks
                .Where(i => i.InternshipId == internshipId && i.Type == "Behaviour"
                && i.IsPublished == true && !i.IsDeleted).FirstOrDefaultAsync();
            if (feedback == null)
            {
                return null;
            }

            return feedback;
        }


        /// <summary>
        /// Retrieves the names of mentors associated with the given mentor IDs.
        /// </summary>
        /// <param name="mentorId">Comma-separated mentor IDs.</param>
        /// <returns> Returns a string containing the names of mentors. </returns>
        public List<MentorDetails> GetMentors(string mentorId)
        {
            List<string> mentorIds = mentorId.Split(",").ToList();
            List<MentorDetails> mentorInfoList = new List<MentorDetails>();
            List<ApplicationUser> mentorUsers = _userManager.Users.Where(u => mentorIds.Contains(u.Id)).ToList();

            foreach (var id in mentorIds)
            {
                ApplicationUser user = mentorUsers.FirstOrDefault(u => u.Id == id);
                MentorDetails mentorDetails = new()
                {
                    MentorId = id,
                    FirstName = user != null ? user.FirstName : "Unknown",
                    LastName = user != null ? user.LastName : "Unknown"
                };
                mentorInfoList.Add(mentorDetails);
            }

            return mentorInfoList;
        }


        /// <summary>
        /// Retrieves course information based on the provided course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns> Returns course information including ID, name, duration, and duration type. </returns>
        public async Task<CourseInfo> GetCourseName(string courseId)
        {
            var course = await _dbContext.Courses.Where(u => u.Id == courseId).Select(u => new CourseInfo
            {
                courseId = u.Id,
                Name = u.Name,
                Duration = u.Duration,
                DurationType = u.DurationType
            }).FirstOrDefaultAsync();

            if (course != null)
            {
                return course;
            }
            else
            {
                return null;
            }
        }


        /// <summary>
        /// Retrieves details of the intern associated with the provided internship ID.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns> Returns details of the intern including first name and last name. </returns>
        public async Task<InternDetailsDto> GetInternDetails(string internshipId)
        {
            var internship = await _dbContext.Internship.FirstOrDefaultAsync(i => i.Id == internshipId);
            if (internship != null)
            {
                var internName = await _dbContext.Intern.Where(i => i.Id == internship.InternId).Select(i => new InternDetailsDto
                {
                    firstName = i.FirstName,
                    lastName = i.LastName,
                }).FirstOrDefaultAsync();

                if (internName != null)
                {
                    return internName;
                }
                else
                {
                    return null;
                }
            }
            else
            {
                return null;
            }
        }


        /// <summary>
        /// Retrieves details of the course associated with the provided internship ID.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns> Returns details of the course including the course ID. </returns>
        public async Task<CourseDetailsDto> GetCourseDetails(string internshipId)
        {
            var course = await _dbContext.Internship
                .Where(u => u.Id == internshipId && u.isDismissed == false)
                .Select(u => new CourseDetailsDto
                {
                    CourseId = u.CourseId,
                })
                .FirstOrDefaultAsync();

            return course;
        }
        /// <summary>
        /// Retrieves all internships assosciated with the given batchId
        /// </summary>
        /// <param name="batchId"></param>
        /// <returns>Returns all internships in the batchI </returns>
        public async Task<List<string>> GetInternshipByBatchId(string batchId)
        {
            List<string> activeInternIds = await _dbContext.Intern.AsNoTracking()
                                                           .Where(i => i.IsDeleted == false && i.BatchId == batchId)
                                                           .Select(i => i.Id)
                                                           .ToListAsync();

            List<string> internshipInternIds = await _dbContext.Internship.AsNoTracking()
                                                                .Where(i => i.isDismissed == false)
                                                                .Select(i => i.InternId)
                                                                .ToListAsync();

            if (activeInternIds == null || internshipInternIds == null)
                return null;
            return internshipInternIds.Where(id => activeInternIds.Contains(id)).Distinct().ToList();
        }

        /// <summary>
        /// Retrieves details of the internship associated with the provided internship ID.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns> Returns details of the internship. </returns>
        public async Task<Internship> GetInternshipDetails(string internshipId)
        {
            Internship internship = await _dbContext.Internship
                .Where(u => u.Id == internshipId && u.isDismissed == false)
                .FirstOrDefaultAsync();

            return internship;
        }

        /// <summary>
        /// Saves changes made to internship .
        /// </summary>
        /// <param name="internship">The ID of the internship.</param>
        /// <returns> Returns details of the internship. </returns>
        public async Task<InternshipEditInfoDto> EditInternshipDetails(Internship internship)
        {
            _dbContext.Internship.Update(internship);
            await _dbContext.SaveChangesAsync();
            Course courseInfo = _dbContext.Courses.FirstOrDefault(c => c.Id == internship.CourseId);
            DateTime internshipEndDate = CalculateDate(internship.StartDate, courseInfo.Duration);

            InternshipEditInfoDto internshipEditInfo = new()
            {
                Id = internship.Id,
                Mentors = GetMentors(internship.MentorId),
                StartDate = internship.StartDate,
                EndDate = internshipEndDate
            };

            return internshipEditInfo;
        }

        /// <summary>
        /// Retrieves assignment feedback associated with the specified assignment ID.
        /// </summary>
        /// <param name="assignmentFeedbackId">The ID of the assignment feedback .</param>
        /// <returns> Returns a assignment feedback objects associated with the assignment Id. </returns>
        public async Task<AssignmentFeedback> GetAssignmentFeedbackById(string assignmentFeedbackId)
        {
            AssignmentFeedback assignment = await _dbContext.AssignmentFeedbacks
                                  .FirstOrDefaultAsync(f => f.Id == assignmentFeedbackId && !f.IsDeleted);
            if (assignment != null)
            {
                return assignment;
            }
            else
            {
                throw new Exception("Assignment feedback not found.");
            }

        }

        /// <summary>
        /// Edits assignment feedback by mentors or interns
        /// </summary>
        /// <param name="feedback">The selected feedback to edit.</param>
        /// <returns> Returns updated feedback </returns>
        public async Task<OverallFeedbackResponse> EditAssignmentFeedback(AssignmentFeedback feedback)
        {
            _dbContext.AssignmentFeedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
            OverallFeedbackResponse commonFeedback = await ConvertIndividualFeedback<AssignmentFeedback>(feedback, "Assignment");

            return commonFeedback;

        }

        /// <summary>
        /// Retrieves Journal feedback associated with the specified journal ID.
        /// </summary>
        /// <param name="journalFeedbackId">The ID of the journal feedback .</param>
        /// <returns> Returns a journal feedback objects associated with the journal Id. </returns>
        public async Task<JournalFeedback> GetJournalFeedbackById(string journalFeedbackId)
        {
            JournalFeedback journal = await _dbContext.JournalFeedbacks
                                  .FirstOrDefaultAsync(f => f.Id == journalFeedbackId && !f.IsDeleted);
            if (journal != null)
            {
                return journal;
            }
            else
            {
                throw new Exception("Journal feedback not found.");
            }
        }

        /// <summary>
        /// Edits journal feedback by mentors or interns
        /// </summary>
        /// <param name="feedback">The selected feedback to edit.</param>
        /// <returns> Returns updated feedback </returns>
        public async Task<OverallFeedbackResponse> EditJournalFeedback(JournalFeedback feedback)
        {
            _dbContext.JournalFeedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
            OverallFeedbackResponse commonFeedback = await ConvertIndividualFeedback<JournalFeedback>(feedback, "Journal");

            return commonFeedback;

        }

        /// <summary>
        /// Retrieves General feedback associated with the specified journal ID.
        /// </summary>
        /// <param name="generalFeedbackId">The ID of the journal feedback .</param>
        /// <returns> Returns a journal feedback objects associated with the journal Id. </returns>
        public async Task<GeneralInternshipFeedback> GetGeneralFeedbackById(string generalFeedbackId)
        {
            GeneralInternshipFeedback generalFeedback = await _dbContext.GeneralInternshipFeedbacks
                                  .FirstOrDefaultAsync(f => f.Id == generalFeedbackId && !f.IsDeleted);
            if (generalFeedback != null)
            {
                return generalFeedback;
            }
            else
            {
                throw new Exception("General feedback not found.");
            }
        }

        /// <summary>
        /// Edits general feedback by mentors or interns
        /// </summary>
        /// <param name="feedback">The selected feedback to edit.</param>
        /// <returns> Returns updated feedback </returns>
        public async Task<OverallFeedbackResponse> EditGeneralFeedback(GeneralInternshipFeedback feedback)
        {
            _dbContext.GeneralInternshipFeedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
            OverallFeedbackResponse commonFeedback = await ConvertIndividualFeedback<GeneralInternshipFeedback>(feedback, "General");

            return commonFeedback;

        }

        /// <summary>
        /// Deletes general feedback by mentors or interns
        /// </summary>
        /// <param name="feedback">The selected feedback to edit.</param>
        /// <returns> Returns updated feedback </returns>
        public async Task<OverallFeedbackResponse> DeleteGeneralFeedback(GeneralInternshipFeedback feedback)
        {
            _dbContext.GeneralInternshipFeedbacks.Update(feedback);
            await _dbContext.SaveChangesAsync();
            OverallFeedbackResponse commonFeedback = await ConvertIndividualFeedback<GeneralInternshipFeedback>(feedback, "General");

            return commonFeedback;

        }




        #endregion

        #region Private methods


        /// <summary>
        /// Converts a list of specific feedback objects to a list of overall feedback responses.
        /// </summary>
        /// <typeparam name="T">The type of feedback objects.</typeparam>
        /// <param name="feedbackList">The list of feedback objects.</param>
        /// <param name="type">The type of feedback.</param>
        /// <returns> Returns a list of overall feedback responses. </returns>
        private async Task<List<OverallFeedbackResponse>> ConvertToFeedback<T>(List<T> feedbackList, string type)
        {
            List<OverallFeedbackResponse> OverallFeedbackResponses = new List<OverallFeedbackResponse>();

            foreach (var feedback in feedbackList)
            {
                OverallFeedbackResponse OverallFeedbacks = await GetMessageFromFeedback(feedback, type);
                if (OverallFeedbacks != null)
                {
                    if (OverallFeedbacks.Message.Feedback == "")
                    {
                        OverallFeedbacks.Message.Feedback = "No feedback";
                    }
                    if (OverallFeedbacks.Message.ImprovementArea == "")
                    {
                        OverallFeedbacks.Message.ImprovementArea = "No Improvement Area";
                    }
                    if (OverallFeedbacks.Message.Rating == 0)
                    {
                        OverallFeedbacks.Message.Rating = 0;
                    }
                    OverallFeedbackResponses.Add(OverallFeedbacks);
                }
            }

            return OverallFeedbackResponses;
        }


        /// <summary>
        /// Converts a specific feedback object to overall feedback response.
        /// </summary>
        /// <typeparam name="T">The type of feedback objects.</typeparam>
        /// <param name="feedback">The feedback object.</param>
        /// <param name="type">The type of feedback.</param>
        /// <returns> Returns a overall feedback response. </returns>
        private async Task<OverallFeedbackResponse> ConvertIndividualFeedback<T>(T feedback, string type)
        {
            OverallFeedbackResponse OverallFeedback = await GetMessageFromFeedback(feedback, type);
            if (OverallFeedback != null)
            {
                if (OverallFeedback.Message.Feedback == "")
                {
                    OverallFeedback.Message.Feedback = "No feedback";
                }
                if (OverallFeedback.Message.ImprovementArea == "")
                {
                    OverallFeedback.Message.ImprovementArea = "No Improvement Area";
                }
                if (OverallFeedback.Message.Rating == 0)
                {
                    OverallFeedback.Message.Rating = 0;
                }
            }

            return OverallFeedback;
        }


        /// <summary>
        /// Retrieves an overall feedback response from a specific feedback object based on the feedback type.
        /// </summary>
        /// <param name="feedback">The specific feedback object.</param>
        /// <param name="type">The type of feedback.</param>
        /// <returns> Returns an overall feedback response. </returns>
        private async Task<OverallFeedbackResponse> GetMessageFromFeedback(object feedback, string type)
        {
            switch (type)
            {
                case "Journal":
                    JournalFeedback journalFeedback = (JournalFeedback)feedback;
                    OverallFeedbackResponse OverallJournalFeedbacks = new OverallFeedbackResponse
                    {
                        Id = journalFeedback.Id,
                        ReviewerId = journalFeedback.reviewerId,
                        ReviewerName = await GetUserName(journalFeedback.reviewerId),
                        Message = new MessageFormat
                        {
                            Feedback = journalFeedback.FeedbackPoints,
                            ImprovementArea = journalFeedback.ImprovementArea,
                            Rating = journalFeedback.Rating
                        },
                        Type = type,
                        JournalId = journalFeedback.JournalId,
                        InternshipId = journalFeedback.InternshipId,
                        CreatedDate = journalFeedback.CreatedDate,
                        UpdatedDate = journalFeedback.UpdatedDate,
                        IsEdited = journalFeedback.IsEdited,
                    };
                    return OverallJournalFeedbacks;

                case "Assignment":
                    AssignmentFeedback assignmentFeedback = (AssignmentFeedback)feedback;
                    OverallFeedbackResponse OverallAssignmentFeedbacks = new OverallFeedbackResponse
                    {
                        Id = assignmentFeedback.Id,
                        ReviewerId = assignmentFeedback.ReviewerId,
                        ReviewerName = await GetUserName(assignmentFeedback.ReviewerId),
                        Message = new MessageFormat
                        {
                            Feedback = assignmentFeedback.Feedback,
                            Score = assignmentFeedback.Score
                        },
                        Type = type,
                        AssignmentSubmissionId = assignmentFeedback.SubmitedAssgnimentId,
                        InternshipId = assignmentFeedback.InternshipId,
                        CreatedDate = assignmentFeedback.CreatedDate,
                        UpdatedDate = assignmentFeedback.UpdatedDate,
                        IsEdited = assignmentFeedback.IsEdited,
                    };
                    return OverallAssignmentFeedbacks;

                case "General":
                    GeneralInternshipFeedback generalFeedback = (GeneralInternshipFeedback)feedback;

                    OverallFeedbackResponse OverallGeneralFeedbacks = new OverallFeedbackResponse
                    {
                        Id = generalFeedback.Id,
                        ReviewerId = generalFeedback.CreatedById,
                        ReviewerName = generalFeedback.CreatedByName,
                        Message = new MessageFormat
                        {
                            Comment = generalFeedback.Comment
                        },
                        InternshipId = generalFeedback.InternshipId,
                        CreatedDate = generalFeedback.CreatedDate,
                        UpdatedDate = generalFeedback.UpdatedDate,
                        IsEdited = generalFeedback.IsEdited,
                    };

                    if (generalFeedback.Type == "Behaviour")
                    {
                        OverallGeneralFeedbacks.Type = generalFeedback.Type;
                        OverallGeneralFeedbacks.Message.Score = generalFeedback.ReceivedMarks;
                    }

                    else
                    {
                        OverallGeneralFeedbacks.Type = type;
                    }

                    return OverallGeneralFeedbacks;


                default:
                    return null;
            }
        }


        /// <summary>
        /// Constructs a single overall behaviour feedback from a list of general feedback responses.
        /// </summary>
        /// <param name="generalFeedback">The list of general feedback responses.</param>
        /// <returns>
        /// Returns a single overall behaviour feedback.
        /// </returns>
        private async Task<List<OverallFeedbackResponse>> GetBehaviourFeedbackInOne(List<OverallFeedbackResponse> generalFeedback)
        {
            List<OverallFeedbackResponse> overallFeedbackList = new List<OverallFeedbackResponse>();

            List<string> feedbackIds = generalFeedback.Select(f => f.Id).ToList();
            List<GeneralInternshipFeedback> feedbackInfo = await _dbContext.GeneralInternshipFeedbacks
                .Include(f => f.Category)
                .Where(f => feedbackIds.Contains(f.Id))
                .ToListAsync();

            // Group feedback by BehaviourTemplateId
            Dictionary<string, List<OverallFeedbackResponse>> feedbackByTemplate = new Dictionary<string, List<OverallFeedbackResponse>>();

            foreach (OverallFeedbackResponse feedback in generalFeedback)
            {
                GeneralInternshipFeedback? feedbackItem = feedbackInfo.FirstOrDefault(f => f.Id == feedback.Id);
                if (feedbackItem == null)
                    continue;

                string? behaviourCategoryId = feedbackItem.BehaviourCategoryId;
                if (behaviourCategoryId == null)
                    continue;

                BehaviourCategory? categoryInfo = feedbackItem.Category;

                if (categoryInfo == null)
                    continue;

                string templateId = categoryInfo.BehaviourTemplateId;
                if (templateId == null)
                    continue;

                if (!feedbackByTemplate.ContainsKey(templateId))
                {
                    feedbackByTemplate[templateId] = new List<OverallFeedbackResponse>();
                }

                feedbackByTemplate[templateId].Add(feedback);
            }

            foreach (string templateId in feedbackByTemplate.Keys)
            {
                List<OverallFeedbackResponse> feedbackForTemplate = feedbackByTemplate[templateId];
                StringBuilder templateFeedbackBuilder = new();
                string reviewerName = string.Empty;
                string reviewerId = string.Empty;
                string? internshipId = string.Empty;
                DateTime? updatedDate = DateTime.UtcNow;
                double? totalScore = 0.0;

                foreach (OverallFeedbackResponse feedbackItem in feedbackForTemplate)
                {
                    GeneralInternshipFeedback? feedbackInfoItem = feedbackInfo.FirstOrDefault(f => f.Id == feedbackItem.Id);
                    if (feedbackInfoItem == null)
                        continue;

                    BehaviourCategory? categoryInfo = feedbackInfoItem.Category;

                    if (categoryInfo == null)
                        continue;

                    if (string.IsNullOrEmpty(reviewerName))
                    {
                        reviewerName = feedbackInfoItem.CreatedByName;
                        reviewerId = feedbackInfoItem.CreatedById;
                    }

                    templateFeedbackBuilder.AppendLine($"{categoryInfo.CategoryName} ");
                    templateFeedbackBuilder.AppendLine($"{feedbackItem.Message?.Comment} ");
                    templateFeedbackBuilder.AppendLine($"Marks : {feedbackItem.Message?.Score}/{categoryInfo.TotalMarks} ");
                    templateFeedbackBuilder.AppendLine();

                    totalScore += feedbackInfoItem.ReceivedMarks;

                    if (string.IsNullOrEmpty(internshipId))
                    {
                        internshipId = feedbackItem.InternshipId;
                        updatedDate = feedbackItem.UpdatedDate;
                    }
                }

                OverallFeedbackResponse overallFeedback = new()
                {
                    Id = templateId,
                    InternshipId = internshipId,
                    ReviewerId = reviewerId,
                    ReviewerName = reviewerName,
                    Type = "Behaviour",
                    Message = new MessageFormat
                    {
                        Feedback = templateFeedbackBuilder.ToString().Trim(),
                        Score = totalScore
                    },
                    UpdatedDate = updatedDate
                };

                overallFeedbackList.Add(overallFeedback);
            }

            return overallFeedbackList;
        }


        /// <summary>
        /// Filters the internship list based on the provided search word.
        /// </summary>
        /// <param name="orderedInternshipList">The list of internships to be filtered.</param>
        /// <param name="searchWord">The search keyword to filter internships by name or course.</param>
        /// <returns> Returns a filtered list of internships based on the search criteria. </returns>
        private List<InternshipList> ApplySearch(List<InternshipList> orderedInternshipList, string searchWord)
        {
            var searchFilter = orderedInternshipList
                .Where(u => u.FirstName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)
                || u.LastName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)
                || u.CourseName.Contains(searchWord, StringComparison.OrdinalIgnoreCase)).ToList();

            return searchFilter;
        }


        /// <summary>
        /// Applies filters to the internship list based on the provided filter word.
        /// </summary>
        /// <param name="orderedInternshipList">The list of internships to be filtered.</param>
        /// <param name="filterWord">The filter word indicating the type of internships to be filtered.</param>
        /// <returns> Returns a filtered list of internships based on the filter criteria. </returns>
        private List<InternshipList> ApplyFilters(List<InternshipList> orderedInternshipList, string filterWord, string? batchFilter, string? courseNameFilter, string? careerPathFilter)
        {
            DateTime currentDate = DateTime.UtcNow;
            List<InternshipList> filteredInterns = orderedInternshipList;

            if (!string.IsNullOrEmpty(batchFilter))
            {
                filteredInterns = filteredInterns
                    .Where(u => u.BatchName.Equals(batchFilter, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (filterWord == "InProgress")
            {
                filteredInterns = filteredInterns
                    .Where(u => u.StartDate.Date <= currentDate.Date && u.Status == true)
                    .ToList();
            }
            else if (filterWord == "Upcoming")
            {
                filteredInterns = filteredInterns
                    .Where(u => u.StartDate.Date > currentDate.Date && u.Status == true)
                    .ToList();
            }

            if (!string.IsNullOrEmpty(courseNameFilter))
            {
                filteredInterns = filteredInterns
                    .Where(u => u.CourseName.Contains(courseNameFilter, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            if (!string.IsNullOrEmpty(careerPathFilter))
            {
                filteredInterns = filteredInterns
                    .Where(u => u.CareerPath?.Id == careerPathFilter)
                    .ToList();
            }

            return filteredInterns;
        }


        /// <summary>Applies a status filter to the provided list of internship items based on the given status filter value. </summary>
        /// <param name="orderedInternshipList">The list of internship items to be filtered.</param>
        /// <param name="statusFilter">The status filter value indicating whether to include active (true) or inactive (false) internships.</param>
        /// <returns>A filtered list of internship items based on the status filter.</returns>
        private List<InternshipList> ApplyStatusFilter(List<InternshipList> orderedInternshipList, string? statusFilter)
        {
            bool? filterValue = null;
            if (statusFilter != null)
            {
                filterValue = bool.Parse(statusFilter);
            }

            DateTime currentDate = DateTime.UtcNow;
            List<InternshipList> filteredInterns = orderedInternshipList;

            if (filterValue == true)
            {
                filteredInterns = filteredInterns
                    .Where(u => u.StartDate.Date <= currentDate.Date && u.Status == true)
                    .ToList();
            }
            else if (filterValue == false)
            {
                filteredInterns = filteredInterns
                    .Where(u => u.StartDate.Date > currentDate.Date || u.Status == false)
                    .ToList();
            }

            return filteredInterns;
        }


        /// <summary>
        /// Retrieves journal feedback associated with the specified internship.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns> Returns a list of journal feedback objects associated with the internship. </returns>
        private async Task<List<JournalFeedback>> GetJournalFeedback(string internshipId)
        {
            return await _dbContext.JournalFeedbacks
                .Where(f => f.InternshipId == internshipId && !f.IsDeleted && f.IsPublished)
                .ToListAsync();
        }


        /// <summary>
        /// Retrieves assignment feedback associated with the specified internship.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns> Returns a list of assignment feedback objects associated with the internship. </returns>
        private async Task<List<AssignmentFeedback>> GetAssignmentFeedback(string internshipId)
        {
            var result = await _dbContext.AssignmentFeedbacks
                .Where(f => f.InternshipId == internshipId && !f.IsDeleted && f.IsPublished)
                .ToListAsync();
            return result;
        }


        /// <summary>
        /// Retrieves general internship feedback associated with the specified internship.
        /// </summary>
        /// <param name="internshipId">The ID of the internship.</param>
        /// <returns> Returns a list of general internship feedback objects associated with the internship. </returns>
        private async Task<List<GeneralInternshipFeedback>> GetGeneralFeedback(string internshipId)
        {
            return await _dbContext.GeneralInternshipFeedbacks
                .Where(f => f.InternshipId == internshipId && !f.IsDeleted
                && (f.IsPublished == null || f.IsPublished == true))
                .ToListAsync();
        }


        /// <summary>
        /// Calculates the end date of an internship based on the start date and duration in days,while skipping Sundays.
        /// </summary>
        /// <param name="startDate">The start date of the internship.</param>
        /// <param name="durationInDays">The duration of the internship in days.</param>
        /// <returns> The end date of the internship. </returns>
        private DateTime CalculateDate(DateTime startDate, int durationInDays)
        {
            DateTime endDate = startDate.AddDays(durationInDays);
            int sundayCount = 0;
            int daysUntilSunday = ((int)DayOfWeek.Sunday - (int)startDate.DayOfWeek + 7) % 7;
            DateTime firstSunday = startDate.AddDays(daysUntilSunday);
            if (firstSunday > endDate)
            {
                sundayCount = 0;
            }
            else
            {
                int totalDays = (endDate - firstSunday).Days;
                sundayCount = totalDays / 7 + 1;
            }

            List<DateTime> holidaysInDays = _dbContext.Holidays.Where(d => (d.Date.Date >= startDate.Date && d.Date.Date <= startDate.AddDays(durationInDays + sundayCount).Date)).Select(d => d.Date).ToList();
            endDate = startDate;
            var durationInHours = durationInDays * 24;

            while (durationInHours > 0)
            {

                if (durationInHours > 0 && durationInHours <= 24)
                {
                    endDate = endDate.AddHours(23);
                }
                else
                {
                    endDate = endDate.AddHours(24);
                }

                // Skip Sundays
                if (endDate.DayOfWeek != DayOfWeek.Sunday)
                {
                    durationInHours -= 24;
                }
            }

            return endDate;
        }


        /// <summary>
        /// Sorts the internship in order of In Progress, Closed and Upcoming.
        /// </summary>
        /// <param name="internship">Internship List.</param>
        /// <returns> SOrting order of internship </returns>
        private static int GetSortPriority(InternshipList internship)
        {
            var currentDate = DateTime.Now;

            // Upcoming Internship: Status is true and StartDate is in the future.
            if (internship.Status && internship.StartDate > currentDate)
            {
                return 3; // Assign the highest number for upcoming, meaning it will come last in the sort order.
            }
            // In Progress Internship: Status is true and EndTime is in the future.
            else if (internship.Status && internship.EndTime > currentDate)
            {
                return 1; // The lowest number, meaning it will come first.
            }
            // Closed Internship: Either status is false, or the internship has ended.
            else
            {
                return 2; // Middle value, ensuring closed internships come between In Progress and Upcoming.
            }
        }

        #endregion
    }
}
