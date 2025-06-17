using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class InternshipList
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CourseName { get; set; }
        public List<MentorDetails> Mentors { get; set; }
        public int Duration { get; set; }
        public DateTime StartDate { get; set; }
        public bool Status { get; set; }
        public DateTime EndTime { get; set; }
        public string BatchName { get; set; }
        public CareerPath CareerPath { get; set; }

    }

    public class InternInternship
    {
        public string CourseName { get; set; }
        public List<MentorDetails> MentorsName { get; set; }
        public int Duration { get; set; }
        public DateTime StartDate { get; set; }
        public bool Status { get; set; }
        public DateTime EndTime { get; set; }
       
    }
    public class InternInternshipResult
    {
        public List<InternInternship> Internships { get; set; }
        public int TotalPages { get; set; }
    }
}
