using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class ProgressIntern
    {
        public List<AssignmentDetails> AssignmentDetails { get; set; }
        public List<QuizDetails> QuizDetails { get; set; }
        public List<JournalDetails> JournalDetails { get; set; }
        public List<BehaviouralScoreboard> BehaviouralScoreboard { get; set; }
    }

    public class JournalDetails
    {
        public string JournalName { get; set; }
        public double JournalScore { get; set; }
        public DateTime JournalDate { get; set; }
        public double TotalMarks { get; set; }

    }

    public class QuizDetails
    {
        public string QuizName { get; set; }
        public double QuizScore { get; set; }
        public DateTime? QuizDate { get; set; }
        public double TotalMarks { get; set; }

    }

    public class AssignmentDetails
    {
        public string? AssignmentName { get; set; }
        public double? AssignmentScore { get; set; }
        public DateTime? AssignmentDate { get; set; }
        public double TotalMarks { get; set; }

    }
}
