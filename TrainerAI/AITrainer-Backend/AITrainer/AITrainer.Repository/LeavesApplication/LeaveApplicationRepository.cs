using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.Core.Dto.Notification;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.LeavesApplication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.LeaveApplications
{
    public class LeaveApplicationRepository : ILeaveApplicationRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public LeaveApplicationRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }


        /// <summary>
        /// Retrieves the details of an intern based on the user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern</param>
        /// <returns>The details of the intern</returns>
        public async Task<Intern> GetInternDetails(string userId)
        {
            var result = await _context.Intern.FirstOrDefaultAsync(i => i.UserId == userId);
            return result;
        }


        /// <summary>
        /// Adds a new leave application to the database.
        /// </summary>
        /// <param name="newApplication">The leave application to be added</param>
        public async Task<LeaveApplication> AddLeave(LeaveApplication newApplication)
        {
            await _context.LeaveApplications.AddAsync(newApplication);
            await _context.SaveChangesAsync();
            return newApplication;
        }


        /// <summary>
        /// Retrieves leave details for a specific intern from the database.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>The list of leave applications for the intern</returns>
        public async Task<List<LeaveApplication>> GetLeaveDetails(string internId)
        {

            var leaveApplications = await _context.LeaveApplications
                .Where(i => (i.InternId == internId && i.isDeleted == false)).Include(l => l.Attachments)
                .OrderByDescending(i => i.createdDate).ToListAsync();
            return leaveApplications;
        }


        /// <summary>
        /// Retrieves a list of user IDs for admins within the same organization as the specified user.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of user IDs for admins within the same organization</returns>
        public async Task<List<string>> GetAdminsInOrganization(string userId)
        {
            Admin admin = await _context.Admin.FirstOrDefaultAsync(i => i.UserId == userId);
            List<string> adminList = await _context.Admin
                .Where(i => i.OrganizationId == admin.OrganizationId)
                .Select(i => i.UserId).ToListAsync();
            return adminList;
        }


        /// <summary>
        /// Retrieves leave details for interns mentored by the admin identified by the specified admin ID.
        /// </summary>
        /// <param name="adminId">The admin ID</param>
        /// <returns>A list of leave applications for interns mentored by the admin</returns>
        public async Task<List<LeaveApplication>> GetLeaveDetailsIntern(string adminId)
        {
            List<Internship> internships = await _context.Internship.AsNoTracking().ToListAsync();
            

            List<string> internIds = internships
                .Where(i => i.MentorId.Split(',', StringSplitOptions.RemoveEmptyEntries).Contains(adminId))
                .Select(i => i.InternId)
                .ToList();

            List<string> leaveInternIds =  _context.Intern.Where(i => i.CreatedBy == adminId).Select(t => t.Id).ToList();
            internIds.AddRange(leaveInternIds);

            List<LeaveApplication> leaveDetails = await _context.LeaveApplications
                .Where(l => (internIds.Contains(l.InternId)) && l.isDeleted == false).Include(l => l.Attachments).OrderBy(i => i.leaveStartDate).ToListAsync();
            return leaveDetails;
        }


        /// <summary>
        /// Retrieves leave details for the leave application identified by the specified leave ID.
        /// </summary>
        /// <param name="leaveId">The ID of the leave application</param>
        /// <returns>The leave application details</returns>
        public async Task<LeaveApplication> GetLeaveDetailsById(string leaveId)
        {
            var result = await _context.LeaveApplications.FirstOrDefaultAsync(i => i.Id == leaveId);
            return result;
        }


        /// <summary>
        /// Updates the leave application with the provided leave details.
        /// </summary>
        /// <param name="leave">The leave application to be updated</param>
        public async Task UpdateLeave(LeaveApplication leave)
        {
            _context.LeaveApplications.Update(leave);
            await _context.SaveChangesAsync();
        }


        /// <summary>
        /// Calculates the total number of days between the leave start date and end date 
        /// considering the weekdays of the intern's batch.
        /// </summary>
        /// <param name="leaveStartDate">The start date of the leave</param>
        /// <param name="leaveEndDate">The end date of the leave</param>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>The total number of leave days</returns>
        public async Task<int> FindTotalDays(DateTime leaveStartDate, DateTime? leaveEndDate, string internId,string LeaveType)
        {
            //var internship = await _context.Internship.FirstOrDefaultAsync(i => i.InternId == internId);
            var intern = await _context.Intern.FirstOrDefaultAsync(i => i.Id == internId);
            var batchDays = await _context.Batch
                .Where(i => i.Id == intern.BatchId)
                .Select(i => i.WeekdaysNames)
                .FirstOrDefaultAsync();

            int totalDay = 0;

            if (!leaveEndDate.HasValue)
            {
                return totalDay;
            }

            DateTime currentDate = leaveStartDate;

            while (currentDate <= leaveEndDate)
            {
                if (batchDays.Contains(currentDate.DayOfWeek.ToString()))
                { 
                    if(LeaveType!="Work From Home")
                    {
                        totalDay++;
                    }  
                }

                currentDate = currentDate.AddDays(1);
            }

            return totalDay;
        }


        /// <summary>
        /// Retrieves the full name of an intern based on their ID.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>The full name of the intern</returns>
        public async Task<string> GetInternName(string internId)
        {
            var intern = await _context.Intern.FirstOrDefaultAsync(i => i.Id == internId);

            if (intern != null)
            {
                return $"{intern.FirstName} {intern.LastName}";
            }

            return string.Empty;
        }


        /// <summary>
        /// Retrieves the dates of approved leave for an intern.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>An array of DateTime objects representing the leave dates</returns>
        public async Task<DateTime[]> GetLeaveDates(string internId)
        {
            var leaveDetails = await _context.LeaveApplications
                .Where(i => i.InternId == internId).Where(i => i.leaveStatus == "Approved")
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
        /// Retrieves the working days for an intern based on their batch.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>A list of strings representing the working days</returns>
        public async Task<List<string>> GetWorkingDays(string internId)
        {
            var batchIds = _context.Intern
              .Where(i => i.Id == internId)
              .Select(i => i.BatchId)
              .ToList();

            var workingDays = _context.Batch
                .Where(u => batchIds.Contains(u.Id))
                .AsEnumerable()
                .SelectMany(i => i.WeekdaysNames)
                .ToList();

            return workingDays;
        }
        /// <summary>
        /// Retrieves a list of user IDs for admins within the same organization as the specified user.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of user IDs for admins within the same organization</returns>
        public async Task<List<AdminEmailModel>> GetAdminsInInternship(string userId)
        {
            List<string> admins = new List<string>();
            string techadmin = await _context.Intern.Where(i => i.Id == userId).Select(t => t.CreatedBy).FirstOrDefaultAsync();
            List<string> adminlist = await _context.Internship.Where(i => i.InternId == userId).Select(i => i.MentorId).Distinct()
                .ToListAsync();
            foreach (var admim in adminlist)
            {
                if (admim.Contains(","))
                {
                    string[] adminspilt = admim.Split(',');
                    admins.AddRange(adminspilt);
                }
                else
                {
                    admins.Add(admim);
                }
            }
            admins.Add(techadmin);
            List<AdminEmailModel> adminList = await _userManager.Users
                   .Where(i => admins.Contains(i.Id)).Select(a => new AdminEmailModel { Id = a.Id, Email = a.Email, Name = a.FirstName + " " + a.LastName }).ToListAsync();

            return adminList;
        }
        /// <summary>
        /// Retrieves a user email.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A user ID email.</returns>
        public async Task<string> GetInternEmail(string userId)
        {
            string intern = await _context.Intern.Where(i => i.Id == userId).Select(e => e.UserId).FirstOrDefaultAsync();
            string internemail = await _context.Users.Where(i => i.Id == intern).Select(e => e.Email).FirstOrDefaultAsync();
            return internemail;
        }
        /// <summary>
        /// Finds a leave application by its ID asynchronously.
        /// </summary>
        /// <param name="leaveId">The ID of the leave application to find.</param>
        /// <returns>
        /// Returns a LeaveApplication object with the specified ID.
        /// </returns>
        public async Task<LeaveApplication> FindLeaveByIdAsync(string leaveId)
        {
            return await _context.LeaveApplications.AsNoTracking()
               .Where(f => f.Id == leaveId && f.isDeleted == false)
                .Include(f => f.Attachments.Where(a => a.IsDeleted == false))
               .FirstOrDefaultAsync();
        }
        /// <summary>
        /// Retrieves the full name of an admin based on their ID.
        /// </summary>
        /// <param name="adminId">The ID of the admin</param>
        /// <returns>The full name of the admin</returns>
        public async Task<string> GetAdminName(string adminId)
        {
            var admin = await _userManager.Users.FirstOrDefaultAsync(i => i.Id == adminId);

            if (admin != null)
            {
                return $"{admin.FirstName} {admin.LastName}";
            }

            return string.Empty;
        }
    }
}

