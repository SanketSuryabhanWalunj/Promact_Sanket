namespace LakePulse.DTOs
{
    public class MeasurementLocationsDto
    {
        public long LakePulseId { get; set; }
        public string? LocationIdentifier { get; set; }
        public double LocationLatitude { get; set; }
        public double LocationLongitude { get; set; }
        public string? LocationName { get; set; }
        public string? LocationState { get; set; }
    }
}
