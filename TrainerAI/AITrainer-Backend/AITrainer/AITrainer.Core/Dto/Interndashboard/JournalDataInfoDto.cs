using AITrainer.AITrainer.Core.Dto.Journal;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class JournalDataInfoDto
    {
        public string Id { get; set; }
        public List<OptionData>? Data { get; set; }
        public DateTime Date { get; set; }
    }
}
