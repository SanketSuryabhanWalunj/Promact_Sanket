namespace LakePulse.DTOs
{
    public class SearchLakeDto
    {
        public long lakePulseId { get; set; }
        public string? lakeName { get; set; }
        public string? lakeState { get; set; }
        public string? lakeCounty { get; set; }
        public string? recentDataCollection { get; set; }
        public int totalSamples { get; set; }
        public int totalStations { get; set; }
        public int spanYears { get; set; }
        public double? latitude { get; set; }
        public double? longitude { get; set; }
        public int communityAdmin { get; set; }
        public int communityUsers { get; set; }
        public int communitySubscriber { get; set; }
    }
}
