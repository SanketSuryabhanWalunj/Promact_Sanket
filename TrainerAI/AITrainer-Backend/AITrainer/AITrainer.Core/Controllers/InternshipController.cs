using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Interns;
using AITrainer.AITrainer.Repository.Internships;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using static AITrainer.AITrainer.Repository.Interns.InternRepository;
using System.Security.Claims;
using AITrainer.AITrainer.Core.Dto.Intern;
using Microsoft.AspNetCore.Authorization;
using System.Net.Sockets;
using AITrainer.AITrainer.Util;
using Microsoft.AspNetCore.Http.HttpResults;
using NPOI.HSSF.Record.PivotTable;
using Org.BouncyCastle.Bcpg.OpenPgp;
using AITrainer.AITrainer.Repository.Interdashboard;
using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.JournalFeedbacks.Consts;
using AITrainer.Services.OpenAiServices;
using Newtonsoft.Json;
using AITrainer.AITrainer.Core.Dto.Internship.Const;
using System.Linq;
using AITrainer.AITrainer.Core.Enums;
using System.Collections.Generic;


namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InternshipController : ControllerBase
    {
        #region Dependencies
        private readonly IInternshipRepository _internshipRepository;
        private readonly IInterndashboardRepository _internDashboardRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IOpenAiService _openAiService;
        #endregion
        #region Constructors
        public InternshipController(IInternshipRepository internshipRepository, IHttpContextAccessor httpContextAccessor, IOpenAiService openAiService)
        {
            _internshipRepository = internshipRepository;
            _httpContextAccessor = httpContextAccessor;
            _openAiService = openAiService;
        }
        #endregion


        #region Public methods


        /// <summary>
        /// Retrieves a paginated list of internship data based on specified parameters.
        /// </summary>
        /// <param name="currentPageNo">The current page number of the paginated list.</param>
        /// <param name="count">The number of items per page.</param>
        /// <param name="searchWord">Optional. A keyword for searching internships.</param>
        /// <param name="filterWord">Optional. A keyword for filtering internships.</param>
        /// <returns> A paginated list of internship data along with total pages. </returns>
        [Authorize]
        [HttpGet("GetList")]
        public async Task<ActionResult> GetInternshipListAsync(int currentPageNo, int count, string? searchWord, string? filterWord, string? batchFilter, string? statusFilter, string? courseNameFilter, string? careerPathFilter)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            IEnumerable<InternshipList> internshipData = await _internshipRepository.GetInternshipListAsync(searchWord, userId, filterWord, batchFilter, statusFilter, courseNameFilter, careerPathFilter);

            int totalCount = internshipData.Count();
            int totalPageNumber = (int)Math.Ceiling((double)totalCount / count);

            int lastIndex = count * currentPageNo;
            int firstIndex = lastIndex - count;

            InternPaginatedResponse<InternshipList> result = new InternPaginatedResponse<InternshipList>
                                                    {
                                                        Data = internshipData.Skip(firstIndex).Take(lastIndex - firstIndex),
                                                        TotalPages = totalPageNumber,
                                                    };

            return Ok(result);
        }


        /// <summary>
        /// Assigns a course to an internship.
        /// </summary>
        /// <param name="internship">Details of the internship to be created.</param>
        /// <returns>
        /// Returns the created internship if successful.
        /// If an InternException occurs, returns a BadRequest with an error message.
        /// If any other exception occurs, returns a StatusCode 500 with an error message.
        /// </returns>
        [Authorize]
        [HttpPost("assignCourse")]
        public async Task<ActionResult<Internship>> CreateInternshipAsync(InternshipDetails internship)
        {
            try
            {
                return await _internshipRepository.CreateInternshipAsync(internship);
            }
            catch (InternException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while assigning the course." });
            }
        }


        /// <summary>
        /// Dismisses a course associated with an internship.
        /// </summary>
        /// <param name="info">Information containing the internship ID and the course ID to be updated.</param>
        /// <returns> Returns a boolean indicating whether the internship update was successful or not. </returns>
        [Authorize]
        [HttpPut("dismissCourse")]
        public async Task<bool> UpdateInternshipAsync(UpdateInternship info)
        {
            return await _internshipRepository.UpdateInternshipAsync(info);
        }


        /// <summary>
        /// Creates general feedback for an internship.
        /// </summary>
        /// <param name="feedbackRequest">Request containing general feedback information.</param>
        /// <returns>
        /// Returns the created general feedback if successful.
        /// If unsuccessful, returns a BadRequest with an error message. </returns>
        [Authorize]
        [HttpPost("CreateGeneralFeedback")]
        public async Task<ActionResult> CreateGeneralFeedbackAsync(GeneralFeedbackRequest feedbackRequest)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string userName = await _internshipRepository.GetUserName(userId);
            GeneralInternshipFeedback generalFeedback = new GeneralInternshipFeedback
            {
                Id = Guid.NewGuid().ToString(),
                InternshipId = feedbackRequest.InternshipId,
                Comment = feedbackRequest.Comment,
                CreatedById = userId,
                CreatedByName = userName,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            OverallFeedbackResponse result = await _internshipRepository.CreateGeneralFeedback(generalFeedback);
            if (result != null)
            {
                return Ok(result);
            }

            return BadRequest(new { message = "Please try again later" });
        }


        /// <summary>
        /// Retrieves overall feedback for a specific internship.
        /// </summary>
        /// <param name="internshipId">The ID of the internship to retrieve feedback for.</param>
        /// <returns>Returns the overall feedback for the specified internship if found, otherwise returns NotFound.</returns>
        [Authorize]
        [HttpGet("GetOverAllFeedback")]
        public async Task<ActionResult> GetOverallFeedback(string internshipId)
        {
            List<OverallFeedbackResponse> feedback = await _internshipRepository.GetOverallFeedback(internshipId);
            return Ok(feedback);
        }


        /// <summary>
        /// Retrieves overall feedback for a specific intern.
        /// </summary>
        /// <param name="internId">The ID of the intern to retrieve feedback for.</param>
        /// <param name="type">Type of response desired, either "Table" or null for Excel file.</param>
        /// <param name="batchName">Optional. The name of the batch to filter the feedback.</param>
        /// <returns>
        /// Returns an Excel file containing the overall feedback for the specified intern if successful.
        /// If the intern or feedback data is not found, returns a NotFound with an appropriate message.
        /// If an InternException occurs, returns a BadRequest with an error message.
        /// If any other exception occurs, returns a StatusCode 500 with an error message.
        /// </returns>
        [Authorize]
        [HttpGet("GetInternOverAllFeedback")]
        public async Task<ActionResult> GetInternOverallFeedback([FromQuery] InternOverallFeedbackDto request)
        {
            try
            {
                List<BatchwiseInternshipInfo> IndividualInternsFinalFeedback = new List<BatchwiseInternshipInfo>();
                Intern internName = await _internshipRepository.GetInternName(request.internId);
                if (internName == null)
                {
                    return NotFound(new { message = "Intern not found" });
                }
                List<string> internshipIds = await _internshipRepository.GetInternshipId(request.internId);

                BatchwiseInternshipInfo internFeedback = await _internshipRepository.GetRequiredOverallFeedback(internshipIds, internName, request.batchName, request.course, request.careerPath, request.reviewer);
                IndividualInternsFinalFeedback.Add(internFeedback);
               
                if (request.type == ResponseType.Doc)
                {
                    return Ok(IndividualInternsFinalFeedback);
                }
                byte[] file = ExcelHelper.CreateFile(IndividualInternsFinalFeedback, request.batchName);
                FeedbackResponse result = new FeedbackResponse
                                {
                                    File = File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{internName.FirstName}.xlsx"),
                                    FileName = internName.FirstName
                                };

                return Ok(result);
            }
            catch (InternException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while generating feedback." });
            }
        }


        /// <summary>
        /// Retrieves overall feedback for multiple interns and compiles them into a single Excel sheet.
        /// </summary>
        /// <param name="internIds">List of IDs of interns to retrieve feedback for.</param>
        /// <param name="type">Type of response desired, either "Table" or null for Excel file.</param>
        /// <param name="batchName">Optional. The name of the batch to filter the feedback.</param>
        /// <returns>
        /// Returns an Excel file containing the overall feedback for all specified interns if successful.
        /// If any intern or feedback data is not found, returns a NotFound response with an appropriate message.
        /// If any other exception occurs, returns a StatusCode 500 response with an error message.
        /// </returns>
        [Authorize]
        [HttpGet("GetInternOverAllFeedbackForAll")]
        public async Task<ActionResult> GetInternOverallFeedbackInOneSheet([FromQuery] OverallFeedbackRequest request, int currentPage = 0, int defaultList = 0)
        {
            try
            {
                List<BatchwiseInternshipInfo> AllInternsFinalFeedback = new List<BatchwiseInternshipInfo>();

                if (request.InternIds.Count() > 0 && currentPage > 0 && defaultList > 0 && request.Type == ResponseType.Table)
                {
                    int count = request.InternIds.Count();

                    int totalPages = (int)Math.Ceiling((double)count / defaultList);

                    int lastIndex = defaultList * currentPage;

                    int firstIndex = lastIndex - defaultList;

                    IEnumerable<string> uniqueInternIds = request.InternIds.Skip(firstIndex).Take(lastIndex - firstIndex);

                    foreach (string item in uniqueInternIds)
                    {
                        Intern internInfo = await _internshipRepository.GetInternName(item);
                        if (internInfo == null)
                        {
                            return NotFound(new { message = "Please try again later" });
                        }
                        List<string> internshipIds = await _internshipRepository.GetInternshipId(item);

                        BatchwiseInternshipInfo internwiseOverallFeedback = await _internshipRepository.GetRequiredOverallFeedback(internshipIds, internInfo, request.BatchName, request.Course, request.CareerPaths, request.Reviewer);

                        if (internwiseOverallFeedback != null)
                        {
                            AllInternsFinalFeedback.Add(internwiseOverallFeedback);
                        }
                    }

                    if (request.CareerPaths != null)
                    {
                        AllInternsFinalFeedback = AllInternsFinalFeedback
                            .Where(i => i.CareerPath != null && request.CareerPaths.Any(rcp => rcp == i.CareerPath.Id))
                            .ToList();
                    }

                    if (request.InternName != null)
                    {
                        AllInternsFinalFeedback = AllInternsFinalFeedback.Where(i => i.Name != null && request.InternName.Any(internName => i.Name.Contains(internName))).ToList();
                    }

                    GenerateOverAllFeedbackForAll list = new GenerateOverAllFeedbackForAll
                    {
                        AllInternsFinalFeedbacks = AllInternsFinalFeedback,
                        TotalPages = totalPages,
                    };
                    return Ok(list);
                }
                else if (currentPage == 0 && defaultList == 0 && request.Type == ResponseType.Excel)
                {
                    foreach (string item in request.InternIds)
                    {
                        Intern internInfo = await _internshipRepository.GetInternName(item);
                        if (internInfo == null)
                        {
                            return NotFound(new { message = "Please try again later" });
                        }
                        List<string> internshipIds = await _internshipRepository.GetInternshipId(item);

                        BatchwiseInternshipInfo internwiseOverallFeedback = await _internshipRepository.GetRequiredOverallFeedback(internshipIds, internInfo, request.BatchName, request.Course, request.CareerPaths, request.Reviewer);

                        if (internwiseOverallFeedback != null)
                        {
                            AllInternsFinalFeedback.Add(internwiseOverallFeedback);
                        }
                    }

                    byte[] file = ExcelHelper.CreateFile(AllInternsFinalFeedback, request.BatchName);
                    FeedbackResponse result = new FeedbackResponse
                    {
                        File = File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Feedback.xlsx"),
                        FileName = "Feedback"
                    };

                    return Ok(result);
                }
                else
                {
                    return BadRequest(new { message = "Invalid parameters" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while generating overall feedback." });
            }
        }


        /// <summary>
        /// Creates behavior feedback for an internship.
        /// </summary>
        /// <param name="request">Request containing behavior feedback information.</param>
        /// <returns>
        /// Returns Ok if behavior feedback creation is successful.
        /// Returns BadRequest if creation fails.
        /// </returns>
        [Authorize]
        [HttpPost("CreateBehaviourFeedback")]
        public async Task<ActionResult> CreateBehaviourFeedback(BehaviourFeedbackRequest request)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool result = await _internshipRepository.CreateBehaviourFeedback(request, userId);
            if (result)
            {
                return Ok(result);
            }

            return BadRequest();
        }


        /// <summary>
        /// Retrieves behavior feedback for a specific internship and template.
        /// </summary>
        /// <param name="templateId">The ID of the behavior feedback template.</param>
        /// <param name="internshipId">The ID of the internship to retrieve behavior feedback for.</param>
        /// <returns>
        /// Returns Ok with the behavior feedback if found.
        /// Returns NotFound if behavior feedback is not found.
        /// </returns>
        [Authorize]
        [HttpGet("GetBehaviourFeedback")]
        public async Task<ActionResult> GetBehaviourFeedback(string templateId, string internshipId)
        {
            BehaviourFeedbackResponse result = await _internshipRepository.GetBehaviourFeedback(templateId, internshipId);
            if (result != null)
            {
                return Ok(result);
            }

            return NotFound();
        }


        /// <summary>
        /// Publishes behavior feedback for an internship.
        /// </summary>
        /// <param name="request">Request containing information to publish behavior feedback.</param>
        /// <returns>
        /// Returns Ok with the published behavior feedback if successful.
        /// Returns BadRequest if publishing fails.
        /// </returns>
        [Authorize]
        [HttpPut("PublishBehaviourFeedback")]
        public async Task<ActionResult> PublishBehaviourFeedback(UpdateBehviourFeedbackRequest request)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool result = await _internshipRepository.PublishBehaviourFeedback(request, userId);
            if (result != null)
            {
                return Ok(result);
            }

            return BadRequest();
        }


        /// <summary>
        /// Updates behavior feedback for an internship.
        /// </summary>
        /// <param name="request">Request containing information to update behavior feedback.</param>
        /// <returns>
        /// Returns Ok with the updated behavior feedback if successful.
        /// Returns BadRequest if updating fails.
        /// </returns>
        [Authorize]
        [HttpPut("UpdateBehaviourFeedback")]
        public async Task<ActionResult> UpdateBehaviourFeedback(UpdateBehviourFeedbackRequest request)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            BehaviourFeedbackResponse result = await _internshipRepository.UpdateBehaviourFeedback(request, userId);
            if (result != null)
            {
                return Ok(result);
            }

            return BadRequest();
        }


        /// <summary>
        /// Deletes behavior feedback for an internship.
        /// </summary>
        /// <param name="request">Request containing information to delete behavior feedback.</param>
        /// <returns>
        /// Returns Ok with the result of the deletion if successful.
        /// Returns BadRequest if deletion fails.
        /// </returns>
        [Authorize]
        [HttpPut("DeleteBehaviourFeedback")]
        public async Task<ActionResult> DeleteBehaviourFeedback(UpdateBehviourFeedbackRequest request)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            bool result = await _internshipRepository.DeleteBehaviourFeedback(request, userId);
            if (result != null)
            {
                return Ok(result);
            }

            return BadRequest();
        }


        /// <summary>
        /// Checks if behavior feedback exists for a specific internship.
        /// </summary>
        /// <param name="internshipId">The ID of the internship to check for behavior feedback.</param>
        /// <returns>
        /// Returns Ok with a boolean value indicating whether behavior feedback exists for the internship.
        /// Returns BadRequest if the check encounters an error.
        /// </returns>
        [Authorize]
        [HttpGet("IsBehaviourFeedbackExist")]
        public async Task<ActionResult> IsBehaviourFeedbackExist(string internshipId)
        {
            GeneralInternshipFeedback isPublished = await _internshipRepository.IsBehaviourFeedbackExist(internshipId);
            if (isPublished == null)
            {
                return BadRequest();
            }

            return Ok(isPublished);
        }


        /// <summary>
        /// Retrieves details of an internship including course and intern information.
        /// </summary>
        /// <param name="internshipId">The ID of the internship to retrieve details for.</param>
        /// <returns>
        /// Returns Ok with the internship details including course and intern information.
        /// </returns>
        [Authorize]
        [HttpGet("GetInternshipDetails")]
        public async Task<ActionResult> GetInternshipDetails(string internshipId)
        {
            InternCourseDetailsDto internCourseDetails = new();

            CourseDetailsDto course = await _internshipRepository.GetCourseDetails(internshipId);
            internCourseDetails.CourseId = course.CourseId;

            CourseInfo courseDetails = await _internshipRepository.GetCourseName(internCourseDetails.CourseId);
            internCourseDetails.CourseName = courseDetails.Name;
            InternDetailsDto internName = await _internshipRepository.GetInternDetails(internshipId);
            internCourseDetails.firstName = internName.firstName;
            internCourseDetails.lastName = internName.lastName;

            return Ok(internCourseDetails);
        }
        

        /// <summary>
        /// Edits internship details like start date and mentors.
        /// </summary>
        /// <param name="internshipDetails">The edit internship request dto.</param>
        /// <returns>
        /// Returns Ok with the internship details.
        /// </returns>
        [Authorize]
        [HttpPut("EditInternshipDetails")]
        public async Task<ActionResult> EditInternshipDetails(EditInternshipRequestDto internshipDetails)
        {
            Internship internship = await _internshipRepository.GetInternshipDetails(internshipDetails.InternshipId);

            if (internship != null)
            {
                internship.MentorId = string.Join(",", internshipDetails.MentorIds);
                internship.StartDate = internshipDetails.StartDate;
                InternshipEditInfoDto result = await _internshipRepository.EditInternshipDetails(internship);
                return Ok(result);
            }
            else
            {
                return BadRequest();
            }
        }
        

        /// <summary>
        /// Edits overall feedback for a specific internship.
        /// </summary>
        /// <param name="feedback">The feedback to be edited.</param>
        /// <returns>Returns updated feedback.</returns>
        [Authorize]
        [HttpPut("EditFeedback")]
        public async Task<ActionResult> EditFeedback(OverallFeedbackResponse feedback)
        {
            switch (feedback.Type)
            {
                case "Assignment":
                    if (feedback.Message.Feedback != "" && feedback.Message.Score != null)
                    {
                        AssignmentFeedback assignmentFeedback = await _internshipRepository.GetAssignmentFeedbackById(feedback.Id);
                        assignmentFeedback.Feedback = feedback.Message.Feedback;
                        assignmentFeedback.Score = feedback.Message.Score;
                        assignmentFeedback.UpdatedDate = DateTime.UtcNow;
                        assignmentFeedback.IsEdited = true;

                        OverallFeedbackResponse assignment = await _internshipRepository.EditAssignmentFeedback(assignmentFeedback);
                        return Ok(assignment);
                    }
                    else
                    {
                        return BadRequest();
                    }


                case "Journal":
                    if (feedback.Message.Feedback != "" && feedback.Message.Rating != null && feedback.Message.ImprovementArea != "")
                    {
                        JournalFeedback journalFeedback = await _internshipRepository.GetJournalFeedbackById(feedback.Id);
                        journalFeedback.FeedbackPoints = feedback.Message.Feedback;
                        journalFeedback.Rating = feedback.Message.Rating;
                        journalFeedback.UpdatedDate = DateTime.UtcNow;
                        journalFeedback.ImprovementArea = feedback.Message.ImprovementArea;
                        journalFeedback.IsEdited = true;

                        OverallFeedbackResponse journal = await _internshipRepository.EditJournalFeedback(journalFeedback);
                        return Ok(journal);
                    }
                    else
                    {
                        return BadRequest();
                    }

                case "General":
                    if (feedback.Message.Comment != "")
                    {
                        GeneralInternshipFeedback generalFeedback = await _internshipRepository.GetGeneralFeedbackById(feedback.Id);
                        generalFeedback.Comment = feedback.Message.Comment;
                        generalFeedback.UpdatedDate = DateTime.UtcNow;
                        generalFeedback.IsEdited = true;

                        OverallFeedbackResponse general = await _internshipRepository.EditGeneralFeedback(generalFeedback);
                        return Ok(general);
                    }
                    else
                    {
                        return BadRequest();
                    }

                default: return BadRequest();

            }
        }

        /// <summary>
        /// Deletes overall feedback for a specific internship.
        /// </summary>
        /// <param name="feedback">The feedback to be delete.</param>
        /// <returns>Returns deleted feedback.</returns>
        [Authorize]
        [HttpDelete("DeleteFeedback")]
        public async Task<ActionResult> DeleteFeedback(string feedbackId)
        {
                GeneralInternshipFeedback generalFeedback = await _internshipRepository.GetGeneralFeedbackById(feedbackId);
                if (generalFeedback != null)
                {
                    generalFeedback.IsDeleted = true;
                    OverallFeedbackResponse general = await _internshipRepository.DeleteGeneralFeedback(generalFeedback);
                    return Ok(general);
                }
                else
                {
                    return BadRequest();
                }     

        }

        #endregion
    }
}
