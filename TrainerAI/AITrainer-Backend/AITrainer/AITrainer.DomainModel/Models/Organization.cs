namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Organization
    {
        public string Id { get; set; }
        public string OrganizationName { get; set; }
        public string OrganizationContactNo { get; set; }
        public bool isDeleted { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdatedDate { get; set; }
    }
}
