using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.CareerPaths;
using AITrainer.AITrainer.Repository.TechStacks;
using AITrainer.AITrainer.Util;
using AITrainer.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;

namespace AITrainer.AITrainer.Repository.SuperAdmin
{
    public class SuperAdminRepository :  ISuperAdminRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ITechStackRepository _techStackRepository;
        private readonly ICareerPathRepository _careerPathRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public SuperAdminRepository(UserManager<ApplicationUser> userManager, ApplicationDbContext context, ITechStackRepository techStackRepository, ICareerPathRepository careerPathRepository, IEmailService emailSerice, IConfiguration configuration)
        {
            _userManager = userManager;
            _context = context;
            _techStackRepository = techStackRepository;
            _careerPathRepository = careerPathRepository;
            _emailService = emailSerice;
            _configuration = configuration;
        }


        public async Task<Admin> GetAdminByUserIdAsync(string userId)
        {
            return await _context.Admin
                .Include(a => a.User)
                .Include(a => a.TechStacks)
                .Include(a => a.CareerPath)
                .Include(a => a.ProjectManagers)
                .FirstOrDefaultAsync(a => a.UserId == userId);
        }

        public async Task AddToRoleAsync(ApplicationUser users, string roleName)
        {
            await _userManager.AddToRoleAsync(users, "Admin");
        }

        /// <summary>
        /// Counts the number of filtered users asynchronously based on the provided filters.
        /// </summary>
        /// <param name="roleType">The role type filter.</param>
        /// <param name="organizationId">The organization ID filter.</param>
        /// <param name="techStacks"> The techStacks filter</param>
        /// <returns>Returns the count of users that match all specified conditions.</returns>
       
        public async Task<int> CountFilteredUsersAsync(string? roleType, string? organizationId, List<string> techStacks)
        {
            IQueryable<ApplicationUser> userQuery = _userManager.Users.Where(user => !user.isDeleted);
            IQueryable<Admin> adminQuery = _context.Admin.AsQueryable();

            if (!string.IsNullOrWhiteSpace(roleType))
            {
                userQuery = userQuery.Where(u => u.Type == roleType);
            }

            if (techStacks.Any())
            {
                adminQuery = adminQuery.Where(a => a.TechStacks.Any(ts => techStacks.Contains(ts.Name)));
            }

            var query = userQuery
                .Join(adminQuery, user => user.Id, admin => admin.UserId, (user, admin) => new { User = user, Admin = admin })
                .Where(x => (!string.IsNullOrWhiteSpace(organizationId) ? x.Admin.OrganizationId == organizationId : true));

            int filteredUsersCount = await query.CountAsync();

            return filteredUsersCount;
        }

        public async Task<int> Count()
        {
            var userCount = await _userManager.GetUsersInRoleAsync("Admin");

            int user = userCount
                    .Where(u => !u.isDeleted)
                    .Count();

            return user;
        }

        public async Task<bool> checkDelete(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user != null)
            {
                if (user.isDeleted == true)
                {
                    return true;
                }

                return false;
            }

            return false;
        }

        public async Task<IdentityResult> CreateAsync(ApplicationUser users, string password)
        {
            var result = await _userManager.CreateAsync(users, password);
            return result;
        }

        public async Task<ApplicationUser> FindByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<ApplicationUser> FindByIdAsync(string id)
        {
            return await _userManager.FindByIdAsync(id);
        }

        /// <summary>
        /// Retrieves a list of filtered users asynchronously based on the provided filters and pagination.
        /// </summary>
        /// <param name="roleType">The role type filter.</param>
        /// <param name="firstIndex">The starting index for pagination.</param>
        /// <param name="lastIndex">The ending index for pagination.</param>
        /// <param name="organizationId">The organization ID filter.</param>
        /// <param name="techStacks">The TechStacks filter</param>
        /// <returns>Returns a list of filtered users based on the specified conditions and pagination.</returns>

        public async Task<List<ApplicationUser>> GetFilteredUsersAsync(string roleType, int firstIndex, int lastIndex, string organizationId, List<string> techStacks)
        {
            IQueryable<ApplicationUser> userQuery = _userManager.Users.Where(user => !user.isDeleted);
            IQueryable<Admin> adminQuery = _context.Admin.AsQueryable();
            adminQuery = adminQuery.Include(x => x.TechStacks);

            if (!string.IsNullOrWhiteSpace(roleType))
            {
                userQuery = userQuery.Where(u => u.Type == roleType);
            }

            if (techStacks.Any())
            {
                adminQuery = adminQuery.Where(a => a.TechStacks.Any(ts => techStacks.Contains(ts.Name)));
            }

            var query = userQuery
                .Join(adminQuery, user => user.Id, admin => admin.UserId, (user, admin) => new { User = user, Admin = admin })
                .Where(x => (!string.IsNullOrWhiteSpace(organizationId) ? x.Admin.OrganizationId == organizationId : true));
                
            List<ApplicationUser> filteredUsers = await query
                .Select(x => x.User)
                .OrderByDescending(u => u.CreatedDate)
                .Skip(firstIndex)
                .Take(lastIndex - firstIndex)
                .ToListAsync();

            return filteredUsers;
        }

        /// <summary>
        /// Retrieves a list of application users by the specified role name, excluding deleted users, and orders them by creation date descending.
        /// </summary>
        /// <param name="roleName">The name of the role to filter the users by.</param>
        /// <returns>A list of application users.</returns>
        public async Task<List<ApplicationUser>> GetUsersByRoleAsync(string roleName)
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);

            var user = usersInRole
                  .Where(u => u.isDeleted != true)
                  .OrderByDescending(u => u.CreatedDate);

            return user.ToList();
        }

        public async Task<IdentityResult> UpdateAsync(ApplicationUser users)
        {
            var result = await _userManager.UpdateAsync(users);

            return result;
        }


        public async Task AddToAdminTable(Admin admin, List<TechStackDTO> techStacksDto, string careerPathId, List<string> projectManagerIds)
        {

            var techStackNames = techStacksDto.Select(ts => ts.Name).ToList();
            var existingTechStacks = await _context.TechStacks
                                       .Where(ts => !ts.IsDeleted && techStackNames.Contains(ts.Name))
                                       .ToListAsync();

            var careerPath = await _context.CareerPaths.FirstOrDefaultAsync(cp => !cp.IsDeleted && cp.Id == careerPathId);
            admin.CareerPath = careerPath;

            var existingProjectManagers = await _context.Admin
                                                         .Where(admin => projectManagerIds.Contains(admin.User.Email))
                                                         .ToListAsync();


            foreach (var techStackDto in techStacksDto)
            {
                var techStack = existingTechStacks.FirstOrDefault(ts => ts.Name == techStackDto.Name);
                if (techStack == null)
                {
                    techStack = new TechStack
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = techStackDto.Name
                    };
                    _context.TechStacks.Add(techStack);
                    await _techStackRepository.CreateTechStackAsync(techStack);
                    existingTechStacks.Add(techStack);
                }
                admin.TechStacks.Add(techStack);
            }

            foreach (var projectManager in existingProjectManagers)
            {
                admin.ProjectManagers.Add(projectManager);
            }

            await _context.Admin.AddAsync(admin);
            await _context.SaveChangesAsync();
        }
        
        public async Task UpdateAdminTable(string adminId, List<TechStackDTO> updatedTechStacksDto, string careerPathId, List<string> updatedProjectManagerIds)
        {
            Admin admin = await _context.Admin.Include(a => a.TechStacks).Include(a => a.CareerPath).Include(a => a.ProjectManagers).FirstOrDefaultAsync(a => a.Id == adminId);
            if (admin == null) throw new Exception("Admin not found");

            var allTechStacks = await _techStackRepository.GetAllTechStacksAsync();
            var updatedTechStackNames = updatedTechStacksDto.Select(ts => ts.Name).ToList();

            CareerPath careerpath = await _careerPathRepository.GetCareerPathByIdAsync(careerPathId);
            admin.CareerPath = careerpath;

            var existingTechStacks = allTechStacks.Where(ts => updatedTechStackNames.Contains(ts.Name)).ToList();
            var newTechStackNames = updatedTechStackNames.Except(existingTechStacks.Select(ts => ts.Name)).ToList();

            foreach (var techStackName in newTechStackNames)
            {
                var newTechStack = new TechStack { Id = Guid.NewGuid().ToString(), Name = techStackName };
                existingTechStacks.Add(await _techStackRepository.CreateTechStackAsync(newTechStack));
            }

            admin.TechStacks.Clear();
            foreach (var techStack in existingTechStacks)
            {
                admin.TechStacks.Add(techStack);
            }

            await _context.SaveChangesAsync();

            var techStackIdsWithAdmins = await _context.Admin
                                                .SelectMany(a => a.TechStacks)
                                                .Select(ts => ts.Id)
                                                .Distinct()
                                                .ToListAsync();

            var unusedTechStacks = allTechStacks.Where(ts => !techStackIdsWithAdmins.Contains(ts.Id)).ToList();
            foreach (var unusedTechStack in unusedTechStacks)
            {
                await _techStackRepository.DeleteAsync(unusedTechStack.Id);
            }
            List<string> currentProjectManagerEmails = admin.ProjectManagers.Select(pm => pm.User.Email).ToList();

            admin.ProjectManagers.RemoveAll(pm => !updatedProjectManagerIds.Contains(pm.User.Email));

            List<Admin> updatedProjectManagers = await _context.Admin
            .Include(a => a.User)
            .Where(pm => pm.User != null && updatedProjectManagerIds.Contains(pm.User.Email))
            .ToListAsync();

            List<Admin> newProjectManagers = updatedProjectManagers
            .Where(pm => !currentProjectManagerEmails.Contains(pm.User.Email))
            .ToList();
           
            foreach (Admin pmToAdd in newProjectManagers)
            {
                if (!admin.ProjectManagers.Any(pm => pm.Id == pmToAdd.Id))
                {
                    admin.ProjectManagers.Add(pmToAdd);
                }
            }

            await _context.SaveChangesAsync();
            foreach(Admin pm in newProjectManagers)
            {
                ApplicationUser adminuser = await FindByEmailAsync(pm.User.Email);
                if (adminuser != null)
                {
                    string mentorName = $"{admin.User.FirstName} {admin.User.LastName}";
                    string projectManagerName = $"{adminuser.FirstName} {adminuser.LastName}";
                    string subject = string.Format(EmailSubjects.InternshipInvitationToProjectManager,mentorName);
                    string emailcontent = EmailTemplates.GenerateProjectManagerInvitationEmail(projectManagerName, mentorName);
                    await _emailService.SendEmailAsync(pm.User.Email, subject, emailcontent);
                }
            }
        }

        public async Task<Organization> FindOrganization(string UserId)
        {
            var admin = await _context.Admin
        .Include(a => a.Organization)
        .FirstOrDefaultAsync(a => a.UserId == UserId);

            var result = admin.Organization;
            return result;

        }

        public async Task UpdateAdminTable(string orgId, string userId)
        {
            var admin = await _context.Admin.FirstOrDefaultAsync(i => i.UserId == userId);
            admin.OrganizationId = orgId;

            await _context.SaveChangesAsync();
        }

        public async Task<Organization> FindOrgById(string OrgId)
        {
            var result = await _context.Organizations.FirstOrDefaultAsync(a => a.Id == OrgId);
            return result;
        }
        public async Task<Organization> FindOrgByName(string OrgName)
        {
            var result = await _context.Organizations.FirstOrDefaultAsync(a => a.OrganizationName == OrgName);
            return result;
        }
        public async Task<List<Admin>> GetAdminListAsync()
        {
            var result = await _context.Admin.Include(x => x.TechStacks).Include(x => x.CareerPath).Include(x => x.ProjectManagers).ThenInclude(x => x.User).ToListAsync();
            return result;
        }
        
        public async Task<Admin> GetAdminDetailsByUserIdAsync(string userId)
        {
            var result = await _context.Admin.Include(x => x.TechStacks).Include(x => x.CareerPath).Include(x => x.ProjectManagers).ThenInclude(x => x.User).FirstOrDefaultAsync(x => x.UserId == userId);
            return result;
        }
        public async Task<string> CreatePasswordLink(string PasswordToken, string id)
        {
            string? frontendAppUrl = _configuration["Urls:frontendUrl"];
            //var frontendAppUrl = "http://localhost:4200/#";
            var resetPageUrl = $"{frontendAppUrl}/#/create-password";
            var createPasswordLink = $"{resetPageUrl}?token={PasswordToken}&Id={id}";

            return createPasswordLink;
        }
    }
}
