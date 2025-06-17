namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class InternshipEditInfoDto
    {
        public string Id { get; set; }
        public List<MentorDetails> Mentors { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
