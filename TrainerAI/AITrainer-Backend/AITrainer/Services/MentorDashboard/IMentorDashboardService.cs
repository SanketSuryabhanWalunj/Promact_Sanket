using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.Core.Dto.SuperAdmin;
using AITrainer.AITrainer.DomainModel.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using static AITrainer.AITrainer.Core.Dto.MentorDashboard.MentorDashboardDTO;

namespace AITrainer.Services.MentorDashboard
{
    public interface IMentorDashboardService
    {
        Task<InternshipsDetailMentorPageResponse> GetInternships(InternshipRequestMentorPage internshipInfo);
        Task<List<Batch>> GetMentorBatch();
        Task<List<MentorDTO>> GetMentors(List<string>? courseIds, string? keyWord, string? BatchId);
        Task<List<CourseInfoDto>> GetCourses(string? batchId, string? keyWord);
        Task<ListAdmin> GetAdminProfiles(string? searchWord, List<ApplicationUser> Adminuser, int totalPages, int firstIndex, int lastIndex);
    }
}
