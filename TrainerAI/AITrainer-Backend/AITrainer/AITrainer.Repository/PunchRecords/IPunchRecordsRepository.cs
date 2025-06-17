using AITrainer.AITrainer.Core.Dto;
using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.PunchRecords
{
    public interface IPunchRecordsRepository
    {
        /// <summary>
        /// Adds a new punchdate time to the database.
        /// </summary>
        /// <param name="punchRecord">The punchin time to be added</param>
        Task<PunchRecord> AddPunchIn(PunchRecord punchRecord);
        /// <summary>
        /// Updates a old punchDate time to the database.
        /// </summary>
        /// <param name="punchRecord">The punchrecord to be added</param>
        Task UpdatePunchIn(PunchRecord punchRecord);
        /// <summary>
        /// Retrieves the details of an intern based on the user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern</param>
        /// <returns>The details of the intern</returns>
        Task<Intern> GetInternDetails(string userId);
        /// <summary>
        /// Adds a new punchIn and punchout time to the database.
        /// </summary>
        /// <param name="punchLogTime">The punchin time to be added</param>
        Task<PunchLogTime> AddPunchInLogTime(PunchLogTime punchLogTime);
        /// <summary>
        /// checks whether he missed the punchout or not in the database.
        /// </summary>
        /// <param name="getPunchRecordsDto">To che6ck the punchRecord</param>
        /// <param name="intern">To che6ck the intern exists</param>
        Task<PunchRecord> GetCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto, string intern);
        /// <summary>
        /// checks whether he missed the punchout or not in the database.
        /// </summary>
        /// <param name="getPunchRecordsDto">To che6ck the punchRecord with filter </param>
        /// <param name="intern">To che6ck the intern exists</param>
        Task<PunchRecord> IsCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto, string intern);
        /// <summary>
        /// Updates a old punchIn and punchout time to the database.
        /// </summary>
        /// <param name="punchLogTime">The punchLogTime to be updated</param>
        Task UpdatePunchLogOut(PunchLogTime punchLogTime);
        /// <summary>
        /// Updates a old punchrecord isrequest to the database.
        /// </summary>
        /// <param name="punchRecord">The punchRecord to be updated</param>
        Task<PunchRecord> UpdatePunchRecordForRequest(PunchRecord punchRecord);
        /// <summary>
        /// checks whether he missed the punchout or not in the database.
        /// </summary>
        /// <param name="punchRecordId">To che6ck the punchRecord</param>
        Task<PunchRecord> GetPunchRecordById(string punchRecordId);
        /// <summary>
        /// Get all punchdetails based on startdate and enddate
        /// </summary>
        /// <param name="internId">To che6ck the punchRecord</param>
        /// <param name="startdate">To che6ck the punchlogtime</param>
        /// <param name="enddate">To che6ck the punchlogtime</param>
        Task<List<PunchRecord>> GetAllPunchDetails(Intern internId, DateTime startdate, DateTime enddate);
        /// <summary>
        /// Get all requestdetails in punchrecord table
        /// </summary>
        /// <param name="internId">To che6ck the punchRecord</param>
        Task<List<PunchRecord>> GetAllRequestDetails(Intern internId);
        /// <summary>
        /// Retrieves a list of user IDs for admins within the same organization as the specified user.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of user IDs for admins within the same organization</returns>
        Task<List<string>> GetAdminsInOrganization(string userId);
        /// <summary>
        /// Retrieves attendance details for interns mentored by the admin identified by the specified admin ID.
        /// </summary>
        /// <param name="adminId">The admin ID</param>
        /// <returns>A list of request applications for interns mentored by the admin</returns>
        Task<List<PunchRecord>> GetPunchRecordbyIntern(string adminId);
        /// <summary>
        /// Retrieves the full name of an intern based on their ID.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>The full name of the intern</returns>
        Task<string> GetInternName(string internId);
        /// <summary>
        /// Retrieves punch details for the  request punch identified by the specified punch ID.
        /// </summary>
        /// <param name="punchId">The ID of the punchRecord</param>
        /// <returns>The request punch details</returns>
        Task<PunchRecord> GetPunchDetailsById(string punchId);
        /// <summary>
        /// Retrieves a list of user IDs for admins within the same organization as the specified user.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A list of user IDs for admins within the same organization</returns>
        Task<List<AdminPunchRequestEmailModel>> GetAdminsInInternship(string userId);
        /// <summary>
        /// Retrieves a user email.
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>A user ID email.</returns>
        Task<string> GetInternEmail(string userId);
        /// <summary>
        /// Retrieves the details of an intern based on the user ID.
        /// </summary>
        /// <param name="userId">The user ID of the intern</param>
        /// <returns>The details of the intern</returns>
        Task<Intern> GetInternDetailsForEmail(string userId);
        /// <summary>
        /// Retrieves leave details for a specific intern from the database.
        /// </summary>
        /// <param name="internId">The ID of the intern</param>
        /// <returns>The list of leave applications for the intern</returns>
        Task<List<LeavePunchDto>> GetLeaveDetails(string internId, DateTime Statedate, DateTime EndTime);
        /// <summary>
        /// Updates punch log time details for a specific intern from the database.
        /// </summary>
        /// <param name="punchLogTime">The list of the punch log times</param>
        /// <returns>The list of punch log times for the intern</returns>
        Task<List<PunchLogTime>> UpdatePunchLogTime(List<PunchLogTime> punchLogTime);
        /// <summary>
        /// Retrieves punch log time details for a specific intern from the database.
        /// </summary>
        /// <param name="punchLogTimeIds">The list of the punch log timesIds<param>
        /// <returns>The list of punch log times for the intern</returns>
        Task<List<PunchLogTime>> GetPunchLogTime(List<string> punchLogTimeIds);
        /// <summary>
        /// Insert punch record requsts details for a specific intern from the database.
        /// </summary>
        /// <param name="recordRequests">The punch record request object<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<PunchRecordRequests> AddPunchRecordRequests(PunchRecordRequests recordRequests);
        /// <summary>
        /// Retrieves punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="internId">The intern object<param>
        /// <returns>The list of punch record requests for the intern</returns>
        Task<List<PunchRecordRequests>> GetAllpunchRequestDetails(Intern internId);
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="adminId">The admin ID<param>
        /// <returns>The list of punch record requests for the intern</returns>
        Task<List<PunchRecordRequests>> GetPunchAdminRecordbyIntern(string adminId);
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="Id">The ID<param>
        /// <param name="InternID">The intern ID<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<PunchRecordRequests> GetPunchRequestRecordbyIntern(string Id, string InternID);
        /// <summary>
        /// Retrieves punch record details for a specific intern from the database.
        /// </summary>
        /// <param name="InternID">The ID<param>
        /// <param name="punchDate">The intern ID<param>
        /// <returns>The punch record for the intern</returns>
        Task<PunchRecord> GetPunchRecordbyInternanddate(string InternID, DateTime punchDate);
        /// <summary>
        /// Updates punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="punchRecordRequests">The PunchRecordRequests object<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<PunchRecordRequests> UpdatePunchRecordRequest(PunchRecordRequests punchRecordRequests);
        /// <summary>
        /// Retrieves punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="punchRecordId">The PunchRecordRequests object<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<PunchRecordRequests> GetPunchRecordRequestById(string punchRecordId);
        /// <summary>
        /// Retrieves punch record request details for a specific intern from the database.
        /// </summary>
        /// <param name="InternId">The PunchRecordRequests object<param>
        /// <param name="Requestdate">The PunchRecordRequests object<param>
        /// <param name="status">The PunchRecordRequests object<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<List<PunchRecordRequests>> IsPunchRecordRequestById(string InternId, DateTime Requestdate);

        /// <summary>
        /// Method is to get the punch request from start date to end date to show in intern attendance page.
        /// </summary>
        /// <param name="internId"> id of intern.</param>
        /// <param name="startDate"> Start date.</param>
        /// <param name="endDate">End Date.</param>
        /// <returns>List of punch record list with.</returns>
        Task<List<PunchRequestStartEndDateDto>> GetPunchRequestDetailsByStartEndDate(string internId, DateTime startDate, DateTime endDate);
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="PunchDate">The PunchDate<param>
        /// <param name="InternID">The intern ID<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<PunchRecordRequests> GetPunchRequestRecordbyInternPunchDate(DateTime PunchDate, string InternID);
        /// <summary>
        /// Retrieves punch record request details for a specific admin from the database.
        /// </summary>
        /// <param name="adminId">The adminId<param>
        /// <returns>The punch record requests for the intern</returns>
        Task<List<PunchRecordRequests>> GetPunchRecordRequestbyIntern(string adminId);
        /// <summary>
        /// Retrieves the full name of an admin based on their ID.
        /// </summary>
        /// <param name="adminId">The ID of the admin</param>
        /// <returns>The full name of the admin</returns>
        Task<string> GetAdminName(string adminId);
    }
}
