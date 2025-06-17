
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Interns;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static AITrainer.AITrainer.Repository.Interns.InternRepository;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InternController : ControllerBase
    {

        #region Dependencies
        private readonly IInternRepository _internRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        #endregion
        #region Constructors
        public InternController(IInternRepository internRepository, IHttpContextAccessor httpContextAccessor)
        {
            _internRepository = internRepository;
            _httpContextAccessor = httpContextAccessor;
        }
        #endregion
        #region Public methods

        /// <summary>
        /// Retrieves details of an intern by their ID.
        /// </summary>
        /// <param name="internId">The ID of the intern to retrieve</param>
        /// <returns>Returns the intern details if found, else returns a not found response</returns>
        [HttpGet("viewIntern")]
        public async Task<ActionResult<Intern>> GetInternAsync(string internId)
        {
            var result = await _internRepository.GetInternAsync(internId);
            return result;
        }

        /// <summary>
        /// Retrieves a paginated list of interns based on search and filter criteria.
        /// </summary>
        /// <param name="currentPageNo">The current page number of the pagination</param>
        /// <param name="count">The number of interns to retrieve per page</param>
        /// <param name="searchWord">Optional. A keyword to search for interns</param>
        /// <param name="filterWord">Optional. A keyword to filter interns</param>
        /// <returns>Returns a paginated list of interns based on the search and filter criteria</returns>
        [HttpGet("viewList")]
        public async Task<ActionResult> GetInternListAsync(int currentPageNo, int count, string? searchWord, string? filterWord)
        {

            var lastIndex = count * currentPageNo;

            var firstIndex = lastIndex - count;
            var interns = await _internRepository.GetInternListByOrganizationAsync(searchWord, filterWord);
            var totalCount = interns.Count();

            var totalPageNumber = (int)Math.Ceiling((double)totalCount / count);


            var result = new InternPaginatedResponse<InternList>
            {
                Data = interns.Skip(firstIndex).Take(lastIndex - firstIndex),
                TotalPages = totalPageNumber,
            };
            return Ok(result);
        }

        /// <summary>
        /// Creates a new intern.
        /// </summary>
        /// <param name="info">The details of the intern to be created</param>
        /// <returns>Returns the created intern if successful, otherwise returns an error message</returns>
        [HttpPost("addIntern")]
        //[Authorize(Roles ="Admin")]
        public async Task<IActionResult> CreateInternAsync(InternDetails info)
        {
            try
            {
                var claimsPrincipal = HttpContext.User;
                string createdBy = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
                return Ok(await _internRepository.CreateInternAsync(info, createdBy));
            }
            catch (InternException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle other exceptions if needed
                return StatusCode(500, new { message = "An error occurred while creating the intern." });
            }
        }

        /// <summary>
        /// Updates an existing intern.
        /// </summary>
        /// <param name="intern">The updated details of the intern</param>
        /// <returns>Returns the updated intern if successful</returns>
        [HttpPut("editIntern")]
        public async Task<ActionResult<Intern>> UpdateInternAsync(UpdateIntern intern)
        {
            return await _internRepository.UpdateInternAsync(intern);
        }

        /// <summary>
        /// Deletes an intern.
        /// </summary>
        /// <param name="Id">The ID of the intern to be deleted</param>
        /// <returns>Returns true if the intern is successfully deleted; otherwise, false</returns>
        [HttpDelete("deleteIntern")]
        public bool DeleteIntern(string Id)
        {
            return _internRepository.DeleteIntern(Id);
        }

        /// <summary>
        /// Retrieves the list of courses assigned to an intern.
        /// </summary>
        /// <param name="userId">The ID of the intern</param>
        /// <returns>Returns the list of courses assigned to the intern</returns>
        [HttpGet("List-course")]
        public async Task<ActionResult<AssignCourseDto>> GetList(string userId)
        {
            return Ok(await _internRepository.GetCourse(userId));
        }

        /// <summary>
        /// Retrieves the list of interns belonging to the organization.
        /// </summary>
        /// <returns>Returns the list of interns associated with the organization</returns>
        [HttpGet("viewIntern-organization")]
        public async Task<ActionResult<List<Intern>>> GetInternByOrganizationAsync()
        {
            return await _internRepository.GetInternsByOrganizationAsync();
        }

        /// <summary>
        /// Retrieves the list of administrators.
        /// </summary>
        /// <returns>Returns the list of administrators.</returns>
        [HttpGet("GetAdminList")]
        public async Task<ActionResult> GetAdminList()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Ok(await _internRepository.GetAdminList(userId));
        }

        /// <summary>
        /// Checks if the intern with the specified email has been deleted.
        /// </summary>
        /// <param name="email">The email of the intern to check.</param>
        /// <returns>Returns true if the intern has been deleted; otherwise, false.</returns>
        [HttpGet("IsDeletd")]
        public async Task<bool> IsDeleted(string email)
        {
            return await _internRepository.checkDelete(email);
        }

        /// <summary>
        /// Enables an intern with the provided details.
        /// </summary>
        /// <param name="intern">The details of the intern to enable.</param>
        /// <returns>Returns the result of enabling the intern.</returns>
        [HttpPut("enableIntern")]
        public async Task<ActionResult> EnableIntern(InternDetails intern)
        {
            var user = await _internRepository.FindByEmailAsync(intern.Email);
            user.isDeleted = false;

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var claimsPrincipal = HttpContext.User;
            string createdBy = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _internRepository.EnableInternAsync(intern, createdBy, user.Id);
            return Ok(result);
        }

        /// <summary>
        /// Retrieves the details of the currently logged-in admin user.
        /// </summary>
        /// <returns>Returns the profile details of the admin user.</returns>
        [HttpGet("getAdminDetail")]
        public async Task<ActionResult> GetAdminDetail()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var user = await _internRepository.FindByIdAsync(userId);
            var orgName = await _internRepository.FindOrganization(user.Id);
            var Profile = new AdminProfile
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                organization = orgName.OrganizationName,
                ContactNo = user.PhoneNumber,
                isDeleted = user.isDeleted,
                Type = user.Type
            };

            return Ok(Profile);
        }


        #endregion

    }
}
