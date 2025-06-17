using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Repository.MentorDashboard;
using AITrainer.AITrainer.Repository.SuperAdmin;
using AITrainer.Services.MentorDashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static AITrainer.AITrainer.Core.Dto.MentorDashboard.MentorDashboardDTO;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MentorDashboardController : ControllerBase
    {
        #region Dependencies
        private readonly IMentorDashboardService _mentorDashboardService;
        private readonly IMentorDashboardRepository _repository;
        private readonly ISuperAdminRepository _superAdminRepository;
        #endregion
        #region Constructors
        public MentorDashboardController(ISuperAdminRepository superAdminRepository,IMentorDashboardService mentorDashboardService, IMentorDashboardRepository repository)
        {
            _mentorDashboardService = mentorDashboardService;
            _repository = repository;
            _superAdminRepository = superAdminRepository;
        }
        #endregion
        #region Public methods

        /// <summary>
        /// Retrieves the list of batches associated with the mentor
        /// </summary>
        /// <returns>Returns an ActionResult with the batch information</returns>
        [HttpGet("GetBatch")]

        public async Task<ActionResult> ListBatch()
        {
            var batch = await _mentorDashboardService.GetMentorBatch();

            return Ok(batch);
        }

        /// <summary>
        /// Retrieves internships based on mentor ID, course ID, or batch ID.
        /// </summary>
        /// <param name="internshipInfo">Query parameters for filtering internships.</param>
        /// <returns>An ActionResult containing filtered internships.</returns>
        [HttpGet("GetInternships")]
        public async Task<ActionResult> GetInternships([FromQuery] InternshipRequestMentorPage internshipInfo)
        {
            var result = await _mentorDashboardService.GetInternships(internshipInfo);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves mentors based on a list of course IDs.
        /// </summary>
        /// <param name="mentortListRequest">Request DTO containing course IDs and optional keyword.</param>
        /// <returns>An ActionResult containing a list of mentors.</returns>
        [HttpGet("GetMentors")]
        public async Task<ActionResult<List<MentorDTO>>> GetMentors([FromQuery] MentorListRequestDto mentortListRequest)
        {
            List<MentorDTO> mentors = await _mentorDashboardService.GetMentors(mentortListRequest.CourseIds, mentortListRequest.KeyWord, mentortListRequest.BatchId);

            return Ok(mentors);
        }

        /// <summary>
        /// Retrieves a list of courses based on the provided batch ID and search keyword.
        /// </summary>
        /// <param name="batchId">The ID of the batch to filter the courses by (can be null).</param>   
        /// <param name="keyWord">The keyword to search for courses by name (can be null).</param>
        /// <returns>An ActionResult containing the list of courses.</returns>
        [HttpGet("GetCourses")]
        public async Task<ActionResult> GetCourses(string? batchId, string? keyWord)
        {
            List<CourseInfoDto> courses = await _mentorDashboardService.GetCourses(batchId, keyWord);

            return Ok(courses);
        }

        /// <summary>
        /// Retrieves a list of admin users based on the provided parameters.
        /// </summary>
        /// <param name="currentPage">The current page number of the pagination.</param>
        /// <param name="defaultList">The default number of items per page.</param>
        /// <param name="searchWord">The keyword to search for admin users (can be null).</param>
        /// <returns>An ActionResult containing the list of admin users.</returns>
        [HttpGet("list-admin")]
        public async Task<ActionResult> ListAdmin(int currentPage, int defaultList, string? searchWord)
        {
            
                var count = await _superAdminRepository.Count();

                var totalPages = (int)Math.Ceiling((double)count / defaultList);

                var lastIndex = defaultList * currentPage;

                var firstIndex = lastIndex - defaultList;

                var Adminuser = await _superAdminRepository.GetUsersByRoleAsync("Admin");

                if (Adminuser == null)
                {
                    return NotFound(new { message = "Admin not found" });
                }

                var result = await _mentorDashboardService.GetAdminProfiles(searchWord, Adminuser, totalPages, firstIndex, lastIndex);

                return Ok(result);
        }
        #endregion
    }
}
