using Microsoft.AspNetCore.Identity;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Journal
    {
        public string Id { get; set; }
        public string Internship_Id { get; set; }
        public string Intern_Id { get; set; }
        public string Topic_Id { get; set; }
        public string Data { get; set; }
        public Internship Internship { get; set; }
        public Intern Intern { get; set; }
        public Topic Topic { get; set; }
        public DateTime UpdatedDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsNotified { get; set; }

    }
}
