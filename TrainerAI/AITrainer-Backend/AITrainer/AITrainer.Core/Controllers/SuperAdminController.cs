using System.IO;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.SuperAdmin;
using AITrainer.AITrainer.Repository.User;
using AITrainer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data;
using AITrainer.AITrainer.Util;
using AITrainer.AITrainer.Core.Dto.CareerPaths;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuperAdminController : ControllerBase
    {
        private readonly ISuperAdminRepository _superAdminRepository;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;

        public SuperAdminController(ISuperAdminRepository superAdminRepository, IConfiguration configuration)
        {
            _configuration = configuration;
            _superAdminRepository = superAdminRepository;
            _emailService = new EmailService(configuration);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpPost("create-admin")]

        /// <summary>
        /// Creates a new admin user. It validates the model state, checks if the user already exists, 
        /// generates a password, and sends an email invitation with a password setup link.
        /// </summary>
        /// <param name="user">The admin user details to create.</param>
        /// <returns>An ActionResult indicating the result of the admin creation process.</returns>
        public async Task<ActionResult<CreateAdmin>> CreateAdmin(CreateAdmin user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Login failed due to validation errors." });
            }

            ApplicationUser userExits = await _superAdminRepository.FindByEmailAsync(user.Email);

            if (userExits != null)
            {
                return Conflict(new { message = "User Already Register" });
            }

            string password = PasswordGenerator.GeneratePassword();

            ApplicationUser users = new ApplicationUser
            {
                Email = user.Email,
                UserName = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                isDeleted = false,
                PhoneNumber = user.ContactNo,
                CreatedDate = DateTime.UtcNow,
                Type = user.Type,
            };

            IdentityResult result = await _superAdminRepository.CreateAsync(users, password);

            if (!result.Succeeded)
            {
                return BadRequest(new { message = "Registration failed" });
            }

         

            await _superAdminRepository.AddToRoleAsync(users, "Admin");
            string encodedPassword = PasswordGenerator.EncodeToken(password);
            string createPasswordLink = await _superAdminRepository.CreatePasswordLink(encodedPassword, users.Id);
            string emailBody = EmailTemplates.GenerateAdminInvitationEmail(user.FirstName, user.LastName, createPasswordLink);
            string invitationSubject = EmailSubjects.InternshipInvitationSubject;

            await _emailService.SendEmailAsync(user.Email, invitationSubject, emailBody);
            AdminProfile Profile = new AdminProfile
            {
                Id = users.Id,
                FirstName = users.FirstName,
                LastName = users.LastName,
                organization=user.Organization,
                Type = user.Type,
                Email = users.Email,
                ContactNo= users.PhoneNumber,
                isDeleted = users.isDeleted,
            };

            Admin orgAdmin = new Admin
            {
                Id = Guid.NewGuid().ToString(),
                UserId = users.Id,
                OrganizationId = user.Organization,
                Type = user.Type,
                TechStacks = new List<TechStack>(),
                CareerPathId = user.CareerPathId,
                ProjectManagers = new List<Admin>()
            };

            await _superAdminRepository.AddToAdminTable(orgAdmin, user.TechStacks, user.CareerPathId, user.ProjectManagerIds);
            foreach (string email in user.ProjectManagerIds)
            {
                ApplicationUser adminuser = await _superAdminRepository.FindByEmailAsync(email);
                if(adminuser != null)
                {
                    string mentorName = $"{user.FirstName} {user.LastName}";
                    string projectMananagerName = $"{adminuser.FirstName} {adminuser.LastName}";
                    string subject = string.Format(EmailSubjects.InternshipInvitationToProjectManager, mentorName);
                    string emailcontent = EmailTemplates.GenerateProjectManagerInvitationEmail(projectMananagerName, mentorName);
                    await _emailService.SendEmailAsync(email, subject, emailcontent);
                }

            }


            return Ok(Profile);

        }

        /// <summary>
        /// Lists admin users with pagination. It calculates total pages based on the default list size 
        /// and current page, fetches users in the 'Admin' role within the specified range, and returns their profiles.
        /// </summary>
        /// <param name="currentPage">The current page number for pagination.</param>
        /// <param name="defaultList">The number of items per page.</param>
        /// <returns>An ActionResult containing a list of admin profiles and pagination info.</returns>
        
        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("list-admin")]
        public async Task<ActionResult> ListAdmin([FromQuery] ListAdminRequest request)
        {
            List<string> techStacks = request.TechStacks?.Split(',').ToList() ?? new List<string>();

            int count = await _superAdminRepository.CountFilteredUsersAsync(request.RoleType,request.OrganizationId, techStacks);


            int pageNumber = (int)Math.Ceiling((double)count / request.DefualtList);

            int lastIndex = request.DefualtList * request.CurrentPage;

            int firstIndex = lastIndex - request.DefualtList;

            List<ApplicationUser> Adminuser = await _superAdminRepository.GetFilteredUsersAsync(request.RoleType, firstIndex, lastIndex, request.OrganizationId, techStacks);
            var adminList = await _superAdminRepository.GetAdminListAsync();

            if (Adminuser == null)
            {
                return NotFound(new { message = "Admin not found" });
            }

            var adminProfiles = new List<AdminProfile>();

            foreach (var user in Adminuser)
            {
                var orgName = await _superAdminRepository.FindOrganization(user.Id);
                var adminData = adminList.Where(x => x.UserId == user.Id).FirstOrDefault();
                AdminProfile Profile = new();
                if (orgName != null)
                {

                    Profile.Id = user.Id;
                    Profile.FirstName = user.FirstName;
                    Profile.LastName = user.LastName;
                    Profile.Email = user.Email;
                    Profile.organization = orgName.OrganizationName;
                    Profile.Type = user.Type;
                    Profile.ContactNo = user.PhoneNumber;
                    Profile.isDeleted = user.isDeleted;
                    Profile.TechStacks = adminData.TechStacks.Select(x => x.Name).ToList();                    
                    Profile.ProjectManagersEmails = adminData.ProjectManagers.Select(x => x.User.Email).ToList();
                    Profile.ProjectManagersNames = adminData.ProjectManagers.Select(x => $"{x.User.FirstName} {x.User.LastName}").ToList();

                    if(adminData.CareerPath != null)
                    {
                        Profile.CareerPath = new CareerPathDto { Id = adminData.CareerPathId, Name = adminData.CareerPath.Name };
                    }
                    else
                    {
                        Profile.CareerPath = null;
                    }

                    

                    adminProfiles.Add(Profile);

                }
            }

            var result = new ListAdmin
            {
                AdminProfiles = adminProfiles,
                TotalPages = pageNumber,
            };

            return Ok(result);
        }
        
        /// <summary>
        /// Retrieves the details of an admin user by their ID.
        /// </summary>
        /// <param name="Id">The ID of the admin user.</param>
        /// <returns>An ActionResult containing the admin user's profile details if found; otherwise, NotFound.</returns>
        [Authorize]
        [HttpGet("detials")]

        public async Task<ActionResult> DetailsAdmin(string Id)
        {
            var user = await _superAdminRepository.FindByIdAsync(Id);
            var admin = await _superAdminRepository.GetAdminDetailsByUserIdAsync(Id);

            if (user == null)
            {
                return NotFound(new { message = "User details not found" });
            }
            var orgName = await _superAdminRepository.FindOrganization(user.Id);
            AdminProfile Profile = new();

            Profile.Id = user.Id;
            Profile.FirstName = user.FirstName;
            Profile.LastName = user.LastName;
            Profile.Email = user.Email;
            Profile.organization = orgName.OrganizationName;
            Profile.ContactNo = user.PhoneNumber;
            Profile.isDeleted = user.isDeleted;
            Profile.Type = user.Type;
            Profile.TechStacks = admin.TechStacks.Select(x => x.Name).ToList();            
            Profile.ProjectManagersEmails = admin.ProjectManagers.Select(x => x.User.Email).ToList();

            if(admin.CareerPath != null)
            {
                Profile.CareerPath = new CareerPathDto { Id = admin.CareerPathId, Name = admin.CareerPath.Name };
            }
            else
            {
                Profile.CareerPath = null;
            }

            return Ok(Profile);
        }

        /// <summary>
        /// Updates the details of an existing admin user. 
        /// </summary>
        /// <param name="updateProfile">The new details to apply to the admin user.</param>
        /// <returns>An ActionResult indicating the result of the update operation.</returns>
        [Authorize]
        [HttpPut("updateDetails")]
        public async Task<IActionResult> UpdateDetails(UpdateProfile updateProfile)
        {
            var user = await _superAdminRepository.FindByIdAsync(updateProfile.Id);


             var Organization = await _superAdminRepository.FindOrganization(user.Id);
           // var newOrganization = await _superAdminRepository.FindOrgByName(updateProfile.Organization);
           // await _superAdminRepository.UpdateAdminTable(newOrganization.Id,user.Id);
           
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.FirstName = updateProfile.FirstName;
            user.LastName = updateProfile.LastName;
            user.PhoneNumber = updateProfile.ContactNo;
            user.Type = updateProfile.Type;

            var result = await _superAdminRepository.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return Conflict(new { message = "Update Failed" });

            }
            var admin = await _superAdminRepository.GetAdminDetailsByUserIdAsync(updateProfile.Id);
            if(admin == null)
            {
                return NotFound(new { message = "Admin details not found." });
            }
            await _superAdminRepository.UpdateAdminTable(admin.Id, updateProfile.TechStacks, updateProfile.CareerPath?.Id, updateProfile.ProjectManagerIds);

            AdminProfile Profile = new();
            
            Profile.Id = user.Id;
            Profile.FirstName = user.FirstName;
            Profile.LastName = user.LastName;
            Profile.Email = user.Email;
            Profile.organization = Organization.OrganizationName;
            Profile.ContactNo = user.PhoneNumber;
            Profile.isDeleted = user.isDeleted;
            Profile.Type = user.Type;
            Profile.TechStacks = updateProfile.TechStacks.Select(x =>x.Name).ToList();

            Profile.ProjectManagersEmails = updateProfile.ProjectManagerIds;
            
            if (updateProfile.CareerPath != null)
            {
                Profile.CareerPath = new CareerPathDto { Id = updateProfile.CareerPath.Id, Name = updateProfile.CareerPath.Name };
            }
            else
            {
                Profile.CareerPath = null;
            }

            return Ok(Profile);

        }

        /// <summary>
        /// Marks an admin user as deleted by setting their 'isDeleted' flag. Does not physically remove the user.
        /// </summary>
        /// <param name="Id">The ID of the admin user to mark as deleted.</param>
        /// <returns>An IActionResult indicating the result of the deletion operation.</returns>
       
        [Authorize(Roles = "SuperAdmin")]
        [HttpDelete("delete")]

        public async Task<IActionResult> UpdateDetails(string Id)
        {
            var user = await _superAdminRepository.FindByIdAsync(Id);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (user.isDeleted)
            {
                return NotFound(new { message = "User not found" });
            }

            user.isDeleted = true;

            var result = await _superAdminRepository.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return Conflict(new { message = "Failed" });
            }

            return Ok(new { message = "User successfully Deleted" });

        }

        /// <summary>
        /// Checks if a user is marked as deleted based on their email.
        /// </summary>
        /// <param name="email">The email of the user to check.</param>
        /// <returns>A Task<bool> indicating whether the user is deleted.</returns>
        [Authorize]
        [HttpGet("IsDeletd")] 

        public async Task<bool> IsDeleted(string email) 
        
        {
            return await _superAdminRepository.checkDelete(email); 
        }

        /// <summary>
        /// Reactivates a previously deactivated admin user, updating their details and marking them as not deleted.
        /// </summary>
        /// <param name="admin">The admin user details to update and reactivate.</param>
        /// <returns>An ActionResult indicating the result of the reactivation process.</returns>
        [Authorize]
        [HttpPut("enableAdmin")]

        public async Task<ActionResult> EnableAdmin(CreateAdmin admin)
        {
            var user = await _superAdminRepository.FindByEmailAsync(admin.Email);

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.FirstName = admin.FirstName;
            user.LastName = admin.LastName;
            user.isDeleted = false;

            var result = await _superAdminRepository.UpdateAsync(user);
            var orgAdmin = new Admin
            {
                Id = Guid.NewGuid().ToString(),
                UserId = user.Id,
                OrganizationId = admin.Organization
            };
            var orgName = await _superAdminRepository.FindOrganization(user.Id);
            if (!result.Succeeded)
            {
                return Conflict(new { message = "Update Failed" });
            }


            var Profile = new AdminProfile
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                organization = orgName.OrganizationName,
                ContactNo   = user.PhoneNumber,   
                isDeleted = user.isDeleted,
                Type = user.Type
            };

            return Ok(Profile);
        }

        /// <summary>
        /// Finds an organization by a user ID.
        /// </summary>
        /// <param name="UserId">The user ID to search the organization for.</param>
        /// <returns>A Task<Organization> representing the asynchronous operation to find an organization.</returns>
        [HttpGet("orgName")]
        public async Task<Organization> FindOrganization(string UserId)
        {
            return await _superAdminRepository.FindOrganization(UserId);
        }

    }
}
