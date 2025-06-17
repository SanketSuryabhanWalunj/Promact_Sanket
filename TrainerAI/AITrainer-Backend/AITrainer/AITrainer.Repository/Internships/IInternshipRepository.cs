using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Repository.Internships
{
    public interface IInternshipRepository
    {
        Task<Internship> CreateInternshipAsync(InternshipDetails internship);
        Task<bool> UpdateInternshipAsync(UpdateInternship internship);
        Task<IEnumerable<InternshipList>> GetInternshipListAsync(string? searchWord, string userId, string? filterWord, string? batchFilter, string? statusFilter, string? courseNameFilter, string? careerPathFilter);
        Task<string> GetUserName(string userId);
        Task<List<OverallFeedbackResponse>> GetOverallFeedback(string internshipId);
        Task<OverallFeedbackResponse> CreateGeneralFeedback(GeneralInternshipFeedback feedback);
        Task<List<string>> GetInternshipId(string internId);
        Task<InternOverallFeedback> GetTopicName(OverallFeedbackResponse feedback);
        Task<Intern> GetInternName(string internId);
        Task<BatchwiseInternshipInfo> GetRequiredOverallFeedback(List<string> internshipIds, Intern intern, string? batchName, List<string>? courseName, List<string>? careerPaths, List<string>? reviewer);
        Task<bool> CreateBehaviourFeedback(BehaviourFeedbackRequest request, string userId);
        Task<BehaviourFeedbackResponse> GetBehaviourFeedback(string templateId, string internshipId);
        Task<bool> DeleteBehaviourFeedback(UpdateBehviourFeedbackRequest request, string userId);
        Task<BehaviourFeedbackResponse> UpdateBehaviourFeedback(UpdateBehviourFeedbackRequest request, string userId);
        Task<bool> PublishBehaviourFeedback(UpdateBehviourFeedbackRequest request, string userId);
        Task<GeneralInternshipFeedback> IsBehaviourFeedbackExist(string internshipId);
        List<MentorDetails> GetMentors(string mentorId);
        Task<CourseInfo> GetCourseName(string courseId);
        Task<InternDetailsDto> GetInternDetails(string internshipId);
        Task<CourseDetailsDto> GetCourseDetails(string internshipId);
        Task<List<string>> GetInternshipByBatchId(string batchId);
        Task<Internship> GetInternshipDetails(string internshipId);
        Task<InternshipEditInfoDto> EditInternshipDetails(Internship internship);
        Task<AssignmentFeedback> GetAssignmentFeedbackById(string assignmentFeedbackId);
        Task<OverallFeedbackResponse> EditAssignmentFeedback(AssignmentFeedback feedback);
        Task<JournalFeedback> GetJournalFeedbackById(string journalFeedbackId);
        Task<OverallFeedbackResponse> EditJournalFeedback(JournalFeedback feedback);
        Task<GeneralInternshipFeedback> GetGeneralFeedbackById(string generalFeedbackId);
        Task<OverallFeedbackResponse> EditGeneralFeedback(GeneralInternshipFeedback feedback);
        Task<OverallFeedbackResponse> DeleteGeneralFeedback(GeneralInternshipFeedback feedback);


    }
}
