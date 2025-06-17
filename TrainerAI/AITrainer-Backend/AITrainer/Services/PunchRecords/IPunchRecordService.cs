using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.Services.PunchRecords
{
    public interface IPunchRecordService
    {
        /// <summary>
        /// Adds punchrecord and punchlogtime when intern checkIn and checkOut
        /// </summary>
        /// <param name="punchRecord">To insert the punchRecord and punchlogtime</param>
        Task<PunchRecord> AddPunchIn(PunchRecordsDto punchRecord);
        /// <summary>
        /// Gets punchLogtime details 
        /// </summary>
        /// <param name="getPunchRecordsDto">To checks the punchLogtime is there or not</param>
        Task<GetPunchResponseDto> GetCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto);
        /// <summary>
        /// Get all Punchrequest details based on startdate and enddate
        /// </summary>
        /// <param name="startdate">get details based on startdate</param>
        /// <param name="enddate">get details based on enddate</param>
        Task<GetListPunchRecordsDto> GetAllPunchDetails(DateTime startdate, DateTime enddate);
        /// <summary>
        /// Insert record when intern missed his punchOut or punchin
        /// </summary>
        /// <param name="requestPunchDto">updates punchout in punchLogTime</param>
        Task<PunchRecord> IsRequestPunchOut(RequestPunchDto requestPunchDto);
        /// <summary>
        /// Get all Punchrequest details based on startdate and enddate
        /// </summary>
        /// <returns>List of all intern request details</returns>
        Task<List<PunchRecordRequestsDto>> GetInternsRequest();
        /// <summary>
        /// Get all intern Punchrequest details for admin
        /// </summary>
        /// <returns>List of all GetAllInternRequestHistoryForAdmin</returns>
        Task<List<AdminInternPunchRecordRequestDetailsDto>> GetAllInternRequestHistoryForAdmins();
        /// <summary>
        /// Admin can approve or reject the request punch
        /// </summary>
        /// <returns>List of all intern punch record</returns>
        Task<PunchRecord> PunchRequestApprovedOrRejected(AdminInternApprovalRequestDto adminInternApprovalRequestDto);
        /// <summary>
        /// Deletes a request application based on the provided ID.
        /// </summary>
        /// <param name="id">The ID of the request application to delete</param>
        /// <returns>True if the leave application was successfully deleted; otherwise, false</returns>
        Task<bool> DeleteRequest(DeleteRequestDto deleteRequest);
        /// <summary>
        /// Get all intern Punchrequest details for admin
        /// </summary>
        /// <returns>List of all GetAllInternRequestHistoryForAdmin</returns>
        Task<List<AdminInternRequestDetailsDto>> GetAllInternRequestHistoryForAdminsUsingFilter(string? filterword, DateTime? filterduration, string? filterstatus);
    }
}
