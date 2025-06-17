namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class PunchRequestNotificationModel
    {
        public string? AdminName { get; set; }
        public string InternFirstName { get; set; }
        public string InternLastName { get; set; }
        public DateTime PunchDate { get; set; }
        public string Punches { get; set; }
        public string Comments { get; set; }
        public DateTime RequestedOn { get; set; }
        public string? RequestStatus { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public string? URL { get; set; }
    }
    public class AdminPunchRequestEmailModel
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
    }

}
