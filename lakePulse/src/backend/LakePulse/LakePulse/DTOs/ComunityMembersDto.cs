namespace LakePulse.DTOs
{
    public class ComunityMembersDto
    {
        public string LakePulseId { get; set; } = string.Empty;
        public int UserCount { get; set; }
        public int SubscriberCount { get; set; }
        public int AdminCount { get; set; }
        public List<string> UserNames { get; set; } = new List<string>();
        public List<string> SubscriberNames { get; set; } = new List<string>();
        public List<string> AdminNames { get; set; } = new List<string>();
    }
}
