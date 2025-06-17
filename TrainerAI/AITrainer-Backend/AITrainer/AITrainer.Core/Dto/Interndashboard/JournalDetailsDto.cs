using AITrainer.AITrainer.Core.Dto.JournalTemplate;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class JournalDetailsDto
    {
        public DateTime Date { get; set; }
        public List<OptionDataDto> Options { get; set; }
    }
}
