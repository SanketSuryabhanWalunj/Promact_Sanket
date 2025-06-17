using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Builder;


namespace AITrainer.AITrainer.Repository.LeavesApplication
{
    public interface ILeaveApplicationRepository
    {
        Task<Intern> GetInternDetails(string userId);
        Task<LeaveApplication> AddLeave(LeaveApplication newApplication);
        Task<List<LeaveApplication>> GetLeaveDetails(string internId);
        Task<List<string>> GetAdminsInOrganization(string userId);
        Task<List<LeaveApplication>> GetLeaveDetailsIntern(string adminId);
        Task<LeaveApplication> GetLeaveDetailsById(string leaveId);
        Task UpdateLeave(LeaveApplication leave);
        Task <int> FindTotalDays(DateTime leaveStartDate, DateTime ?leaveEndDate,string internId,string LeaveType);
        Task <string>GetInternName(string internId);
        Task<DateTime[]> GetLeaveDates(string internId);
        Task<List<AdminEmailModel>> GetAdminsInInternship(string userId);
        Task<string> GetInternEmail(string userId);
        Task<string> GetAdminName(string adminId);
    }
}
