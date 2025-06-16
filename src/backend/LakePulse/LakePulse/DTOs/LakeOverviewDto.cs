namespace LakePulse.DTOs
{
    public class LakeOverviewDto
    {
        public int LakePulseId { get; set; }
        public string? LakeName { get; set; }
        public string? LakeCounty { get; set; }
        public string? LakeState { get; set; }
        public double LakeLatitude { get; set; }
        public double LakeLongitude { get; set; }
        public double LakeAreaAcres { get; set; }
        public double LakeWaterAreaAcres { get; set; }

    }
}
