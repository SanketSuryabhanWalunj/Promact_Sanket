using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Course
    {
        public string Id { get; set; }

        [ForeignKey(nameof(JournalTemplate))]
        public string? JournalTemplate_Id { get; set; }
        public string Name { get; set; }
        public int Duration { get; set; }
        public string DurationType { get; set; }
        public string TrainingLevel { get; set; }
        public bool Quiz { get; set; }
        public int QuizTime { get; set; }
        public int QuizCount { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public JournalTemplate? JournalTemplate { get; set; }
    }
}
