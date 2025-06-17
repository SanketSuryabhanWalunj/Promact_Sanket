using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.Core.Dto.Organization;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;

namespace AITrainer.AITrainer.Repository.Organizations
{
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly ApplicationDbContext _context;
        public OrganizationRepository( ApplicationDbContext context) 
        {
            _context = context;
        
        }

        /// <summary>
        /// Creates a new organization with the specified details. If the organization already exists (based on the name), it throws an InvalidOperationException.
        /// </summary>
        /// <param name="organizationDto">The details of the organization to be created.</param>
        /// <returns>The newly created Organization object.</returns>

        public async Task<Organization> CreateOrganizationAsync(CreateOrganizationDto organizationDto)
        {
            var existingOrganization = _context.Organizations.FirstOrDefault(i=>i.OrganizationName == organizationDto.OrganizationName);
            if (existingOrganization == null)
            {
                var newOrganization = new Organization
                {
                    Id = Guid.NewGuid().ToString(),
                    OrganizationName = organizationDto.OrganizationName,
                    OrganizationContactNo = organizationDto.OrganizationContactNo,
                    CreatedDate = DateTime.UtcNow,
                    LastUpdatedDate = DateTime.UtcNow,
                    isDeleted = false
                };

                await _context.Organizations.AddAsync(newOrganization);
                await _context.SaveChangesAsync();
                return newOrganization;
            }
            else
            {
                throw new InvalidOperationException("Organization already exists");
            }

        }

        /// <summary>
        /// Updates an existing organization's details based on the provided information. It updates the name, contact number, and the last updated date to the current UTC time.
        /// </summary>
        /// <param name="updateOrganizationDto">The updated details of the organization.</param>
        /// <returns>The updated Organization object.</returns>

        public async Task<Organization> UpdateOrganizationAsync(UpdateOrganizationDto updateOrganizationDto)
        {
            var oldOrganization = _context.Organizations.FirstOrDefault(i=>i.Id == updateOrganizationDto.Id);
            oldOrganization.OrganizationName = updateOrganizationDto.OrganizationName;
            oldOrganization.OrganizationContactNo = updateOrganizationDto.OrganizationContactNo;
            oldOrganization.LastUpdatedDate = DateTime.UtcNow;
            oldOrganization.isDeleted = false;

             _context.Organizations.Update(oldOrganization);
             _context.SaveChanges();

            return oldOrganization;
        }

        /// <summary>
        /// Marks an organization as deleted based on its identifier. This does not physically remove the organization from the database but sets its isDeleted flag to true.
        /// </summary>
        /// <param name="organizationId">The identifier of the organization to delete.</param>
        /// <returns>A boolean value indicating the success of the deletion operation.</returns>
        public bool DeleteOrganizationAsync(string organizationId)
        {
            var existingOrganization = _context.Organizations.FirstOrDefault(i => i.Id == organizationId);
            existingOrganization.isDeleted = true;
           _context.Organizations.Update(existingOrganization);
            _context.SaveChanges();

            return true;
        }

        /// <summary>
        /// Retrieves a list of organizations that have not been marked as deleted, ordered by their creation date in descending order. Allows for pagination by specifying a starting index and an ending index.
        /// </summary>
        /// <param name="firstIndex">The start index for pagination.</param>
        /// <param name="lastIndex">The end index for pagination.</param>
        /// <returns>A list of OrganizationDetailsDto objects between the specified indices.</returns>

        public async Task<List<OrganizationDetailsDto>> GetOrganizationsAsync(int firstIndex, int lastIndex)
        {
            var organizations = await _context.Organizations.Where(i=>i.isDeleted==false).OrderByDescending(i => i.CreatedDate).ToListAsync();
            var results = new List<OrganizationDetailsDto>();
            foreach (var organization in organizations)
            {
               var result = new OrganizationDetailsDto
                {
                   Id = organization.Id,
                    OrganizationName = organization.OrganizationName,
                    OrganizationContactNo = organization.OrganizationContactNo,
                   
                };
                
                results.Add(result);

            }
            var res = results.Skip(firstIndex).Take(lastIndex-firstIndex);

            return res.ToList();
           
        }

        /// <summary>
        /// Retrieves a list of all organizations that have not been marked as deleted, ordered by their creation date in descending order.
        /// </summary>
        /// <returns>A list of OrganizationDetailsDto objects.</returns>
        
        public async Task<List<OrganizationDetailsDto>> ViewOrganizationsAsync()
        {
            var organizations = await _context.Organizations.Where(i => i.isDeleted == false).OrderByDescending(i => i.CreatedDate).ToListAsync();
            var results = new List<OrganizationDetailsDto>();
            foreach (var organization in organizations)
            {
                var result = new OrganizationDetailsDto
                {
                    Id = organization.Id,
                    OrganizationName = organization.OrganizationName,
                    OrganizationContactNo = organization.OrganizationContactNo,

                };

                results.Add(result);

            }
          

            return results.ToList();

        }

        public async Task<List<AdminProfileSummaryDto>> ViewAdminProfilesAsync()
        {
            return await _context.Admin
            .Where(admin => !admin.User.isDeleted)
            .Select(admin => new AdminProfileSummaryDto
                {
                Id = admin.Id,
                FirstName = admin.User.FirstName,
                LastName = admin.User.LastName,
                Email = admin.User.Email
            })
            .ToListAsync();
        }

        /// <summary>
        /// Retrieves a list of all organizations that have not been marked as deleted, ordered by their creation date in descending order.
        /// </summary>
        /// <returns>A list of OrganizationDetailsDto objects.</returns>

        public async Task<Organization> GetOrganizationByIdAsync(string organizationId)
        {
            var organization = await _context.Organizations.FirstOrDefaultAsync(i => i.Id == organizationId);
            return organization;
        }

        /// <summary>
        /// Counts the total number of organizations that have not been marked as deleted.
        /// </summary>
        /// <returns>The count of active organizations.</returns>

        public async Task<int> Count()
        {
            var orgCount =  _context.Organizations.Where(i=>i.isDeleted !=true);

            int org = orgCount
                    .Where(u => !u.isDeleted)
                    .Count();

            return org;
        }



        /// <summary>
        /// Finds an organization by its name.
        /// </summary>
        /// <param name="name">The name of the organization to find.</param>
        /// <returns>The Organization object if an organization with the specified name exists; otherwise, null.</returns>

        public async Task<Organization> FindByNameAsync(string name)
        {
            return await _context.Organizations.FirstOrDefaultAsync(i => i.OrganizationName == name);
        }

        /// <summary>
        /// Checks if an organization with the specified name has been marked as deleted.
        /// </summary>
        /// <param name="name">The name of the organization to check.</param>
        /// <returns>A boolean value indicating whether the organization is marked as deleted.</returns>

        public async Task<bool> checkDelete(string name)
        {
            var oganization = await _context.Organizations.FirstOrDefaultAsync(i => i.OrganizationName == name);

            if (oganization != null)
            {
                if (oganization.isDeleted == true)
                {
                    return true;
                }

                return false;
            }

            return false;
        }
    }
}
