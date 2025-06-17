namespace AITrainer.AITrainer.Core.Dto.BehaviouralTemplate
{
    public class BehaviouralScoreboard
    {
        public List<BehavioralCategoryDetails> category { get; set; }
        public double TotalMarks { get; set; }
        public double? TotalReceivedMarks { get; set; }
        public DateTime? DateBehave { get; set; }


    }
    public class BehavioralCategoryDetails
    {
        public string CategoryName { get; set; }
        public double? categoryReceivedMark { get; set; }
        public double categoryTotalMark { get; set;}


    }
}
