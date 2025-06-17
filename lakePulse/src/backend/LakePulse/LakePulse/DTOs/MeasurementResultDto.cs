namespace LakePulse.DTOs
{
    public class MeasurementResultDto
    {
        public float? activity_depth_height_measure { get; set; }
        public DateTime activity_start_date { get; set; }
        public string? activity_start_time { get; set; }
        public string? lake_county { get; set; }
        public string? lake_name { get; set; }      
        public string? lake_state { get; set; }
        public int? lakepulse_id { get; set; }
        public string? location_identifier { get; set; }
        public float? location_latitude { get; set; }
        public float? location_longitude { get; set; }
        public string? location_name { get; set; }
        public string? location_state { get; set; }
        public string? result_characteristic { get; set; }
        public float? result_measure { get; set; }
        public string? result_month { get; set; }
        public string? result_month_year { get; set; }
        public string? result_year { get; set; }
        public string? result_measure_unit { get; set; }
        public string? measurement_source { get; set; }
    }
}