using NPOI.OpenXmlFormats.Wordprocessing;

namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class EditInternshipRequestDto
    {
        public string InternshipId { get; set; }
        public DateTime StartDate { get; set; }
        public List<string> MentorIds { get; set; }

    }
}
