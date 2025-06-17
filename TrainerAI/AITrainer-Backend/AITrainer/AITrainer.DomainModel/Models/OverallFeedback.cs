namespace AITrainer.AITrainer.DomainModel.Models
{
    public class OverallFeedback
    {
        public required string Id { get; set; }
        public required string InternId { get; set; }
        public string BehaviourPerformance { get; set; }
        public string TechnicalPerformance { get; set; }
        public string RightFit { get; set; }
        public string DetailedFeedback { get; set; }
        public string CreatedById { get; set; }
        public string CreatedByName { get; set; }
        public string UpdatedById { get; set; }
        public string UpdatedByName { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsPublished { get; set; }
        public bool IsNotified { get; set; }
    }
}
