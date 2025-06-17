using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.Services.LeaveApplications
{
    public interface ILeaveApplicationService
    {
        Task<LeaveApplication> ApplyLeave(LeaveApplicationDto request);
        Task<List<LeaveApplicationsDto>> GetInternsLeave(string? filter);
        Task<List<AdminLeaveView>> GetInternsLeaveHistory(string? filter, string? filterName, int? filterduration);
        Task<LeaveApplication> GiveResponse(LeaveResponseDto response);
        Task<bool> DeleteLeave(string id);
        Task<DateTime[]> GetLeaveDates();
        Task<List<AdminLeaveView>> GetAllInternsLeaveHistory();
       
    }
}
