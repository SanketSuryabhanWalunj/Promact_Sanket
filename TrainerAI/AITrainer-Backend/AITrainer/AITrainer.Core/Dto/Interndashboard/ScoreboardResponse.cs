using AITrainer.AITrainer.Core.Dto.BehaviouralTemplate;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class ScoreboardResponse
    {
        public string id { get; set; }
        public string userId { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public double? Percentage { get; set; }
        public List<string> Course { get; set; }
        public Dictionary<string, BehaviouralScoreboard> behaviourScoreboard { get; set; }
    }
}
