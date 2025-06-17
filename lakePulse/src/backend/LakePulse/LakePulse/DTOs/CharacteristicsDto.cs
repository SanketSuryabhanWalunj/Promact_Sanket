namespace LakePulse.DTOs
{
    public class CharacteristicsDto
    {
        public string? CharacteristicId { get; set; }
        public string? CharacteristicName { get; set; }
        public string? CharacteristicDescription { get; set; }
        public string? CharacteristicUnits { get; set; }
        public string? BoundType { get; set; }
        public float? LowerBound { get; set; }
        public float? UpperBound { get; set; }
    }
}
