using AITrainer.AITrainer.Core.Dto;
using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.PunchRecords
{
    public class PunchRecordsRepository : IPunchRecordsRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;


        public PunchRecordsRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;

        }


        /// <summary>
        /// Adds a new punchdate time to the database.
        /// </summary>
        /// <param name="punchRecord">The punchin time to be added</param>
        public async Task<PunchRecord> AddPunchIn(PunchRecord punchRecord)
        {
            if (punchRecord == null)
            {
                throw new ArgumentNullException(nameof(punchRecord), "Punch record cannot be null.");
            }

            try
            {
                await _context.PunchRecords.AddAsync(punchRecord);
                await _context.SaveChangesAsync();
                return punchRecord;
            }
            catch (DbUpdateException dbEx)
            {
                throw new InvalidOperationException("An error occurred while adding the punch record to the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while adding the punch record.", ex);
            }
        }
        /// <summary>
        /// Retrieves the details of an intern based on the user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern</param>
        /// <returns>The details of the intern</returns>
        public async Task<Intern> GetInternDetails(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            try
            {
                Intern result = await _context.Intern.FirstOrDefaultAsync(i => i.UserId == userId);
                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while retrieving intern details.", ex);
            }
        }
        /// <summary>
        /// Adds a new punchIn and punchout time to the database.
        /// </summary>
        /// <param name="punchLogTime">The punchin time to be added</param>
        public async Task<PunchLogTime> AddPunchInLogTime(PunchLogTime punchLogTime)
        {
            if (punchLogTime == null)
            {
                throw new ArgumentNullException(nameof(punchLogTime), "PunchLogTime cannot be null.");
            }

            try
            {
                await _context.PunchLogTimes.AddAsync(punchLogTime);
                await _context.SaveChangesAsync();
                return punchLogTime;
            }
            catch (DbUpdateException dbEx)
            {
                throw new InvalidOperationException("An error occurred while adding the PunchLogTime to the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while adding the PunchLogTime.", ex);
            }
        }
        /// <summary>
        /// Updates a old punchDate time to the database.
        /// </summary>
        /// <param name="punchRecord">The punchrecord to be added</param>
        public async Task UpdatePunchIn(PunchRecord punchRecord)
        {
            if (punchRecord == null)
            {
                throw new ArgumentNullException(nameof(punchRecord), "PunchRecord cannot be null.");
            }

            try
            {
                var existingRecord = await _context.PunchRecords.FindAsync(punchRecord.Id);

                if (existingRecord == null)
                {
                    throw new InvalidOperationException("The PunchRecord to update was not found.");
                }
                _context.PunchRecords.Update(punchRecord);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException dbConcurrencyEx)
            {
                throw new InvalidOperationException("A concurrency error occurred while updating the PunchRecord. Please try again.", dbConcurrencyEx);
            }
            catch (DbUpdateException dbEx)
            {
                throw new InvalidOperationException("An error occurred while updating the PunchRecord in the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while updating the PunchRecord.", ex);
            }
        }
        /// <summary>
        /// Updates a old punchIn and punchout time to the database.
        /// </summary>
        /// <param name="punchLogTime">The punchLogTime to be updated</param>
        public async Task UpdatePunchLogOut(PunchLogTime punchLogTime)
        {
            if (punchLogTime == null)
            {
                throw new ArgumentNullException(nameof(punchLogTime), "PunchLogTime cannot be null.");
            }

            try
            {
                var existingRecord = await _context.PunchLogTimes.FindAsync(punchLogTime.Id);

                if (existingRecord == null)
                {
                    throw new InvalidOperationException("The PunchLogTime to update was not found.");
                }
                _context.PunchLogTimes.Update(punchLogTime);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException dbConcurrencyEx)
            {
                throw new InvalidOperationException("A concurrency error occurred while updating the PunchLogTime. Please try again.", dbConcurrencyEx);
            }
            catch (DbUpdateException dbEx)
            {
                throw new InvalidOperationException("An error occurred while updating the PunchLogTime in the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while updating the PunchLogTime.", ex);
            }
        }
        /// <summary>
        /// Updates a old punchrecord isrequest to the database.
        /// </summary>
        /// <param name="punchRecord">The punchRecord to be updated</param>
        public async Task<PunchRecord> UpdatePunchRecordForRequest(PunchRecord punchRecord)
        {
            if (punchRecord == null)
            {
                throw new ArgumentNullException(nameof(punchRecord), "PunchRecord cannot be null.");
            }

            try
            {
                var existingRecord = await _context.PunchRecords.FindAsync(punchRecord.Id);

                if (existingRecord == null)
                {
                    throw new InvalidOperationException("The PunchRecord to update was not found.");
                }
                _context.PunchRecords.Update(punchRecord);
                await _context.SaveChangesAsync();
                return punchRecord;
            }
            catch (DbUpdateConcurrencyException dbConcurrencyEx)
            {
                throw new InvalidOperationException("A concurrency error occurred while updating the PunchRecord. Please try again.", dbConcurrencyEx);
            }
            catch (DbUpdateException dbEx)
            {
                throw new InvalidOperationException("An error occurred while updating the PunchRecord in the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while updating the PunchRecord.", ex);
            }


        }
        /// <summary>
        /// checks whether he missed the punchout or not in the database.
        /// </summary>
        /// <param name="getPunchRecordsDto">To che6ck the punchRecord with filter </param>
        /// <param name="intern">To che6ck the intern exists</param>
        public async Task<PunchRecord> IsCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto, string internId)
        {
            PunchRecord? punchRecord = await _context.PunchRecords.Where(a => (a.PunchDate.Date == getPunchRecordsDto.Punchdate.Date && a.InternId == internId))
                                                                  .Include(a => a.PunchLogTime.Where(c => c.IsPunchLog == true))
                                                                  .FirstOrDefaultAsync();

            return punchRecord;
        }


        /// <summary>
        /// checks whether he missed the punchout or not in the database.
        /// </summary>
        /// <param name="getPunchRecordsDto">To che6ck the punchRecord</param>
        /// <param name="intern">To che6ck the intern exists</param>
        public async Task<PunchRecord> GetCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto, string intern)
        {
            PunchRecord? punchRecord = await _context.PunchRecords
                                                     .Where(a => a.PunchDate.Date == getPunchRecordsDto.Punchdate.Date && a.InternId == intern)
                                                     .Include(a => a.PunchLogTime.OrderByDescending(p => p.PunchIn)).FirstOrDefaultAsync();


            return punchRecord;
        }


        /// <summary>
        /// checks whether he missed the punchout or not in the database.
        /// </summary>
        /// <param name="punchRecordId">To che6ck the punchRecord</param>
        public async Task<PunchRecord> GetPunchRecordById(string punchRecordId)
        {
            PunchRecord? punchRecord = await _context.PunchRecords
                                                     .Include(pr => pr.PunchLogTime)
                                                     .FirstOrDefaultAsync(pr => pr.Id == punchRecordId);

            return punchRecord;
        }

        /// <summary>
        /// Get all punchdetails based on startdate and enddate
        /// </summary>
        /// <param name="internId">To che6ck the punchRecord</param>
        /// <param name="startdate">To che6ck the punchlogtime</param>
        /// <param name="enddate">To che6ck the punchlogtime</param>
        public async Task<List<PunchRecord>> GetAllPunchDetails(Intern internId, DateTime startdate, DateTime enddate)
        {
            DateTime utcStartDate = DateTime.SpecifyKind(startdate, DateTimeKind.Utc);
            DateTime utcendDate = DateTime.SpecifyKind(enddate, DateTimeKind.Utc);

            List<PunchRecord>? punchRecord = await _context.PunchRecords
                                                           .Where(a => (a.InternId == internId.Id && a.PunchDate.Date >= utcStartDate.Date && a.PunchDate.Date <= utcendDate.Date && !a.IsDeleted))
                                                           .OrderByDescending(a => a.PunchDate)
                                                           .Include(b => (b.PunchLogTime).Where(p => !p.IsDeleted).OrderBy(a => a.PunchIn))
                                                           .ToListAsync();
            return punchRecord;
        }
        /// <summary>
        /// Get all requestdetails in punchrecord table
        /// </summary>
        /// <param name="internId">To che6ck the punchRecord</param>
        public async Task<List<PunchRecord>> GetAllRequestDetails(Intern internId)
        {
            List<PunchRecord> punchRecords = await _context.PunchRecords
                                                            .Where(a => (a.InternId == internId.Id && a.IsDeleted == false))
                                                            .OrderByDescending(b => b.PunchDate)
                                                 .Include(p => p.PunchLogTime.Where(p => (!p.IsDeleted)).OrderByDescending(pi => pi.PunchIn))
                                                            .ToListAsync();

            return punchRecords;
        }

        /// <summary>
        /// Retrieves a list of user IDs for admins within the same organization as the specified user.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of user IDs for admins within the same organization</returns>
        public async Task<List<string>> GetAdminsInOrganization(string userId)
        {
            Admin? admin = await _context.Admin.FirstOrDefaultAsync(i => i.UserId == userId);
            List<string> adminList = await _context.Admin
                .Where(i => i.OrganizationId == admin.OrganizationId)
                .Select(i => i.UserId).ToListAsync();
            return adminList;
        }
        /// <summary>
        /// Retrieves attendance details for interns mentored by the admin identified by the specified admin ID.
        /// </summary>
        /// <param name="adminId">The admin ID</param>
        /// <returns>A list of request applications for interns mentored by the admin</returns>
        public async Task<List<PunchRecord>> GetPunchRecordbyIntern(string adminId)
        {
            List<Internship> internships = await _context.Internship.AsNoTracking().ToListAsync();
            string techadminId = await _context.Admin.Where(i => i.UserId == adminId).Select(t => t.UserId).FirstOrDefaultAsync();
            string internId = await _context.Intern.Where(i => i.CreatedBy == techadminId).Select(t => t.Id).FirstOrDefaultAsync();
            List<string> internIds = internships
                .Where(i => i.MentorId.Split(',', StringSplitOptions.RemoveEmptyEntries).Contains(adminId))
                .Select(i => i.InternId)
                .ToList();
            List<PunchRecord> punchRecords = _context.PunchRecords
                                                 .Where(pr => (internIds.Contains(pr.InternId) || internIds.Contains(internId)) && pr.IsDeleted == false)
                                                 .Include(p => p.PunchLogTime.OrderByDescending(pn => pn.PunchIn))
                                               .ToList();
            return punchRecords;
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
        /// Retrieves punch details for the  request punch identified by the specified punch ID.
        /// </summary>
        /// <param name="punchId">The ID of the punchRecord</param>
        /// <returns>The request punch details</returns>
        public async Task<PunchRecord> GetPunchDetailsById(string punchId)
        {
            PunchRecord result = await _context.PunchRecords
                .Include(a => a.PunchLogTime)
                .FirstOrDefaultAsync(i => i.Id == punchId);
            return result;
        }
        /// <summary>
        /// Retrieves a list of user IDs for admins within the same organization as the specified user.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of user IDs for admins within the same organization</returns>
        public async Task<List<AdminPunchRequestEmailModel>> GetAdminsInInternship(string userId)
        {
            List<string> admins = new List<string>();
            string techadmin = await _context.Intern.Where(i => i.Id == userId).Select(t => t.CreatedBy).FirstOrDefaultAsync();
            List<string> adminlist = await _context.Internship.Where(i => i.InternId == userId).Select(i => i.MentorId).Distinct()
                .ToListAsync();
            foreach (string admim in adminlist)
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
            List<AdminPunchRequestEmailModel> adminList = await _userManager.Users
                                                   .Where(i => admins.Contains(i.Id)).Select(a => new AdminPunchRequestEmailModel { Id = a.Id, Email = a.Email, Name = a.FirstName + " " + a.LastName }).ToListAsync();
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
        /// Retrieves the details of an intern based on the user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern</param>
        /// <returns>The details of the intern</returns>
        public async Task<Intern> GetInternDetailsForEmail(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            try
            {
                Intern result = await _context.Intern.Where(i => i.Id == userId).FirstOrDefaultAsync();
                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while retrieving intern details.", ex);
            }
        }
        /// <summary>
        /// Retrieves leave details for a specific intern from the database.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>The list of leave applications for the intern</returns>
        public async Task<List<LeavePunchDto>> GetLeaveDetails(string internId, DateTime Statedate, DateTime EndTime)
        {

            List<LeavePunchDto> leaveApplications = await _context.LeaveApplications
                .Where(i => (i.InternId == internId && i.isDeleted == false && (i.leaveStartDate.Year == Statedate.Year || i.leaveStartDate.Year == EndTime.Year)))
                .OrderByDescending(i => i.createdDate).Select(p => new LeavePunchDto
                {
                    LeaveStartDate = p.leaveStartDate,
                    LeaveEndDate = p.leaveEndDate,
                    LeaveStatus = p.leaveStatus,
                    LeaveType = p.leaveType,
                    createdDate = p.createdDate
                }).Distinct().ToListAsync();
            return leaveApplications;
        }
        /// <summary>
        /// Updates punch log time details for a specific intern from the database.
        /// </summary>
        /// <param name="punchLogTime">The list of the punchlogtimes</param>
        /// <returns>The list of punch log times for the intern</returns>
        public async Task<List<PunchLogTime>> UpdatePunchLogTime(List<PunchLogTime> punchLogTime)
        {
            _context.PunchLogTimes.UpdateRange(punchLogTime);
            await _context.SaveChangesAsync();
            return punchLogTime;
        }
        /// <summary>
        /// Retrieves punch log time details for a specific intern from the database.
        /// </summary>
        /// <param name="punchLogTimeIds">The list of the punch log timesIds<param>
        /// <returns>The list of punch log times for the intern</returns>
        public async Task<List<PunchLogTime>> GetPunchLogTime(List<string> punchLogTimeIds)
        {
            List<PunchLogTime> punchLogTimes = await _context.PunchLogTimes.Where(i => punchLogTimeIds.Contains(i.Id)).ToListAsync();
            return punchLogTimes;
        }
        /// <summary>
        /// Insert punch record requsts details for a specific intern from the database.
        /// </summary>
        /// <param name="recordRequests">The punch record request object<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<PunchRecordRequests> AddPunchRecordRequests(PunchRecordRequests recordRequests)
        {
            if (recordRequests == null)
            {
                throw new ArgumentNullException(nameof(recordRequests), "Punch record cannot be null.");
            }

            try
            {
                await _context.PunchRecordRequests.AddAsync(recordRequests);
                await _context.SaveChangesAsync();
                return recordRequests;
            }
            catch (DbUpdateException dbEx)
            {
                throw new InvalidOperationException("An error occurred while adding the punch record request to the database.", dbEx);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while adding the punch record requests.", ex);
            }
        }
        /// <summary>
        /// Retrieves punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="internId">The intern object<param>
        /// <returns>The list of punch record requests for the intern</returns>
        public async Task<List<PunchRecordRequests>> GetAllpunchRequestDetails(Intern internId)
        {
            List<PunchRecordRequests> punchRecords = await _context.PunchRecordRequests
                                                            .Where(a => (a.InternId == internId.Id && a.IsDeleted == false))
                                                            .OrderByDescending(b => b.RequestDate).ToListAsync();


            return punchRecords;
        }
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="adminId">The admin ID<param>
        /// <returns>The list of punch record requests for the intern</returns>
        public async Task<List<PunchRecordRequests>> GetPunchAdminRecordbyIntern(string adminId)
        {
            List<Internship> internships = await _context.Internship.AsNoTracking().ToListAsync();
            List<string> internId = await _context.Intern.Where(i => i.CreatedBy == adminId).Select(t => t.Id).ToListAsync();
            List<string> internIds = internships
                .Where(i => i.MentorId.Split(',', StringSplitOptions.RemoveEmptyEntries).Contains(adminId))
                .Select(i => i.InternId)
                .ToList();
            internIds.AddRange(internId);
            List<PunchRecordRequests> punchRecords = await _context.PunchRecordRequests
                                                 .Where(pr => (internIds.Contains(pr.InternId)) && pr.IsDeleted == false).ToListAsync();

            return punchRecords;
        }
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="Id">The ID<param>
        /// <param name="InternID">The intern ID<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<PunchRecordRequests> GetPunchRequestRecordbyIntern(string Id, string InternID)
        {

            PunchRecordRequests? punchRecords = await _context.PunchRecordRequests
                                                 .FirstOrDefaultAsync(pr => (pr.Id == Id && pr.InternId == InternID));

            return punchRecords;
        }
        /// <summary>
        /// Retrieves punch record details for a specific intern from the database.
        /// </summary>
        /// <param name="InternID">The ID<param>
        /// <param name="punchDate">The intern ID<param>
        /// <returns>The punch record for the intern</returns>
        public async Task<PunchRecord> GetPunchRecordbyInternanddate(string InternID, DateTime punchDate)
        {

            PunchRecord? punchRecords = await _context.PunchRecords
                                                 .Where(pr => (pr.InternId == InternID && pr.PunchDate.Date == punchDate.Date)).Include(pl => pl.PunchLogTime.OrderBy(p => p.PunchIn)).FirstOrDefaultAsync();

            return punchRecords;
        }
        /// <summary>
        /// Updates punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="punchRecordRequests">The PunchRecordRequests object<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<PunchRecordRequests> UpdatePunchRecordRequest(PunchRecordRequests punchRecordRequests)
        {
            _context.PunchRecordRequests.Update(punchRecordRequests);
            await _context.SaveChangesAsync();
            return punchRecordRequests;
        }
        /// <summary>
        /// Retrieves punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="punchRecordId">The PunchRecordRequests object<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<PunchRecordRequests> GetPunchRecordRequestById(string punchRecordId)
        {
            PunchRecordRequests? punchRecord = await _context.PunchRecordRequests.FirstOrDefaultAsync(pr => pr.Id == punchRecordId);
            return punchRecord;
        }
        /// <summary>
        /// Retrieves punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="InternId">The PunchRecordRequests object<param>
        /// <param name="Requestdate">The PunchRecordRequests object<param>
        /// <param name="status">The PunchRecordRequests object<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<List<PunchRecordRequests>> IsPunchRecordRequestById(string InternId, DateTime Requestdate)
        {
            List<PunchRecordRequests>? punchRecordRequests = await _context.PunchRecordRequests.Where(pr => (pr.InternId == InternId && pr.RequestDate.Date == Requestdate.Date && !pr.IsDeleted)).ToListAsync();
            return punchRecordRequests;
        }

        /// <summary>
        /// Method is to get the punch request from start date to end date to show in intern attendance page.
        /// </summary>
        /// <param name="internId"> id of intern.</param>
        /// <param name="startDate"> Start date.</param>
        /// <param name="endDate">End Date.</param>
        /// <returns>List of punch record list with.</returns>
        public async Task<List<PunchRequestStartEndDateDto>> GetPunchRequestDetailsByStartEndDate(string internId, DateTime startDate, DateTime endDate)
        {
            DateTime utcStartDate = DateTime.SpecifyKind(startDate, DateTimeKind.Utc);
            DateTime utcendDate = DateTime.SpecifyKind(endDate, DateTimeKind.Utc);
            List<PunchRequestStartEndDateDto> punchRecords = await _context.PunchRecordRequests.Where(a => a.InternId == internId && !a.IsDeleted && a.RequestDate.Date >= utcStartDate.Date && a.RequestDate.Date <= utcendDate.Date).OrderByDescending(b => b.RequestDate).Select(p=> new PunchRequestStartEndDateDto
            {
                InternId = p.InternId,
                RequestDate= p.RequestDate,
                status=p.status
            }).ToListAsync();
            return punchRecords;
        }
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="PunchDate">The PunchDate<param>
        /// <param name="InternID">The intern ID<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<PunchRecordRequests> GetPunchRequestRecordbyInternPunchDate(DateTime PunchDate, string InternID)
        {

            PunchRecordRequests? punchRecords = await _context.PunchRecordRequests
                                                 .FirstOrDefaultAsync(pr => (pr.RequestDate.Date == PunchDate.Date && pr.InternId == InternID));

            return punchRecords;
        }
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="adminId">The adminId<param>
        /// <returns>The punch record requests for the intern</returns>
        public async Task<List<PunchRecordRequests>> GetPunchRecordRequestbyIntern(string adminId)
        {
            List<Internship> internships = await _context.Internship.AsNoTracking().ToListAsync();
            string techadminId = await _context.Admin.Where(i => i.UserId == adminId).Select(t => t.UserId).FirstOrDefaultAsync();
            string internId = await _context.Intern.Where(i => i.CreatedBy == techadminId).Select(t => t.Id).FirstOrDefaultAsync();
            List<string> internIds = internships
                .Where(i => i.MentorId.Split(',', StringSplitOptions.RemoveEmptyEntries).Contains(adminId))
                .Select(i => i.InternId)
                .ToList();
            List<PunchRecordRequests> punchRecords = _context.PunchRecordRequests
                                                 .Where(pr => (internIds.Contains(pr.InternId) || internIds.Contains(internId)) && pr.IsDeleted == false)
                                               .ToList();
            return punchRecords;
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
