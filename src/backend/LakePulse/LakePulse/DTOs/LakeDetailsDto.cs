namespace LakePulse.DTOs
{
    public class LakeDetailsDto
    {
        public List<LakeCharacteristicDto>? LakeCharacteristicList { get; set; }
        public LakeOverviewDto? LakeOverview { get; set; }
        public List<SensorLocationDto>? SensorLocations { get; set; }
        public ComunityMembersDto? comunityMembersDto { get; set; } 

    }
}
