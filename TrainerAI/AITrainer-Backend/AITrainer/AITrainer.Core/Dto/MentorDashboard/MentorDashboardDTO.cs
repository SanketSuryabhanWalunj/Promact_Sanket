using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.MentorDashboard
{
    public class MentorDashboardDTO
    {
        public class InternshipRequestMentorPage
        {
            public string? BatchId { get; set; }
            public List<string>? CourseId { get; set; }
            public List<string>? MentorId { get; set; }
        }
        public class InternshipsDetailMentorPageResponse
        {
            public InternshipNumber TotalCount { get; set; }
            public List<InternshipMentorPageResponse> InternshipDetail { get; set; }
        }
        public class InternshipMentorPageResponse
        {
            public string InternshipId { get; set; }
            public string InternId { get; set; }
            public string InternName { get; set; }
            public string CourseId { get; set; }
            public string CourseName { get; set; }
            public string MentorId { get; set; }
            public string MentorName { get; set; }
            public DateTime StartDate { get; set; }

            public string Status { get; set; }
            public List<InternshipSubmissionResponse> Submissions { get; set; }
            public bool HasUnpublishedSubmission { get; set; }
            public DateTime EndDate { get; set; }
            public string BatchName { get; set; }
            public CareerPath CareerPath { get; set; }

        }
        public class InternshipSubmissionResponse
        {
            public string Id { get; set; }
            public string Name { get; set; }
            public string? SubmissionId { get; set; }
            public bool IsSubmitted { get; set; }
            public bool IsPublished { get; set; }
            public string? PublisherId { get; set; }
            public string? PublisherName { get; set; }
            public bool IsSaved { get; set; }
            public bool IsAssignment { get; set; }
        }
        public class InternshipNumber
        {
            public int InternshipCount { get; set; }
            public int SubmissionCount { get; set; }
            public int UnSubmittedCount { get; set; }
            public int PublishedCount { get; set; }
            public int UnpublishedCount { get; set; }
        }

        public class MentorListRequestDto
        {
            public List<string>? CourseIds { get; set; }
            public string? KeyWord { get; set; }
            public string? BatchId { get; set; }
        }
    }
}
