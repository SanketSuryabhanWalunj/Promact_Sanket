using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.Organization;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Organizations;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
       
    
[Route("api/[controller]")]
[ApiController]
    public class OrganizationController :ControllerBase
    {
        private readonly IOrganizationRepository _organizationRepository;
        public OrganizationController(IOrganizationRepository organizationRepository)
        {
            _organizationRepository = organizationRepository;
            
        }

        /// <summary>
        /// Creates a new organization with the provided details.
        /// </summary>
        /// <param name="createOrganization">The organization details to create a new organization.</param>
        /// <returns>Returns an IActionResult with the result of the organization creation process.</returns>
        [HttpPost("addOrganization")]

        public async Task<IActionResult> CreateOrganizationAsync(CreateOrganizationDto createOrganization)
        {
            return Ok(await _organizationRepository.CreateOrganizationAsync(createOrganization));

        }

        /// <summary>
        /// Updates an existing organization with the provided details.
        /// </summary>
        /// <param name="updateOrganizationDto">The organization details to update an existing organization.</param>
        /// <returns>Returns the updated Organization object.</returns>
        [HttpPut("editOrganization")]

        public async Task<Organization> UpdateOrganizationAsync(UpdateOrganizationDto updateOrganizationDto)
        {
            return await _organizationRepository.UpdateOrganizationAsync(updateOrganizationDto);
        }

        /// <summary>
        /// Deletes an existing organization based on the provided ID.
        /// </summary>
        /// <param name="Id">The unique identifier of the organization to delete.</param>
        /// <returns>Returns true if the organization was successfully deleted.</returns>
        [HttpDelete("deleteOrganization")]
        public bool DeleteOrganization(string Id)
        {
            return _organizationRepository.DeleteOrganizationAsync(Id);
        }

        /// <summary>
        /// Retrieves a paginated list of organizations based on the current page and the specified default list size.
        /// </summary>
        /// <param name="currentPage">The current page number for pagination.</param>
        /// <param name="defaultList">The number of items to display per page.</param>
        /// <returns>Returns an ActionResult containing a list of organizations and the total number of pages.</returns>
        [HttpGet("Organizations")]

        public async Task<ActionResult> GetOrganizationsAsync(int currentPage, int defualtList)
        {
            var count = await _organizationRepository.Count();

            var pageNumber = (int)Math.Ceiling((double)count / defualtList);

            var lastIndex = defualtList * currentPage;

            var firstIndex = lastIndex - defualtList;
          var org= await _organizationRepository.GetOrganizationsAsync(firstIndex, lastIndex);
            var result = new ListOrganization
            {
                OrganizationDetails=org,
                TotalPages=pageNumber,

            };
            return Ok(result);
           


        }

        /// <summary>
        /// Retrieves a list of all organizations without pagination.
        /// </summary>
        /// <returns>Returns an ActionResult containing a list of all organizations.</returns>
        [HttpGet("List-Organizations")]

        public async Task<ActionResult> ViewOrganizationsAsync()
        {
            var org = await _organizationRepository.ViewOrganizationsAsync();
         
            return Ok(org);



        }
        /// <summary>
        /// Retrieves a list of admin profiles from the organization.
        /// </summary>
        /// <returns>An IActionResult containing a list of admin profiles. If successful, the content is wrapped in an Ok (200) HTTP response.</returns>

        [HttpGet("List-Admins")]
        public async Task<IActionResult> ViewAdminsAsync()
        {
            var admins = await _organizationRepository.ViewAdminProfilesAsync();
            return Ok(admins);
        }

        /// <summary>
        /// Retrieves a specific organization by its unique identifier.
        /// </summary>
        /// <param name="organizationId">The unique identifier of the organization to retrieve.</param>
        /// <returns>Returns the requested Organization object if found.</returns>
        [HttpGet("Organizations/id")]
        public async Task<Organization> GetOrganizationByIdAsync(string organizationId)
        {
            return await _organizationRepository.GetOrganizationByIdAsync(organizationId);
        }

        /// <summary>
        /// Checks if an organization is marked as deleted based on the provided name.
        /// </summary>
        /// <param name="name">The name of the organization to check.</param>
        /// <returns>Returns true if the organization is marked as deleted, false otherwise.</returns>
        [HttpGet("IsDeletd")]

        public async Task<bool> IsDeleted(string name)
        {
            return await _organizationRepository.checkDelete(name);
        }

        /// <summary>
        /// Enables an organization by updating its 'isDeleted' status to false and updating its details based on the provided information.
        /// </summary>
        /// <param name="createOrganization">The details of the organization to enable and update.</param>
        /// <returns>Returns an ActionResult containing the updated and enabled organization.</returns>
        [HttpPut("enableOrg")]

        public async Task<ActionResult> EnableOrg(CreateOrganizationDto createOrganization)
        {
            var org = await _organizationRepository.FindByNameAsync(createOrganization.OrganizationName);

            if (org == null)
            {
                return NotFound(new { message = "Organization not found" });
            }

            var update = new UpdateOrganizationDto
            {
                Id = org.Id,
                OrganizationName = createOrganization.OrganizationName,
                OrganizationContactNo = createOrganization.OrganizationContactNo,
            };
            var result = await _organizationRepository.UpdateOrganizationAsync(update);
            var newOrganization = new Organization
            {
                Id = org.Id,
                OrganizationName = createOrganization.OrganizationName,
                OrganizationContactNo = createOrganization.OrganizationContactNo,
                isDeleted = false,
                CreatedDate = DateTime.Now,
                LastUpdatedDate = DateTime.Now,
            };

           


            return Ok(newOrganization);
        }

    }
}
