namespace LakePulse.DTOs
{
    public class SensorLocationDto
    {
        public double SensorLatitude { get; set; }
        public double SensorLongitude { get; set; }
        public string? LocationName { get; set; }
        public string? LocationIdentifier { get; set; }
        public string? maxActivityStartDate { get; set; }
    }
}