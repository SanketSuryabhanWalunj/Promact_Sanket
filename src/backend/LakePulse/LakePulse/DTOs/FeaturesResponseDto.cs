namespace LakePulse.DTOs
{
    public class FeaturesResponseDto
    {
        public string? FeatureId { get; set; }
        public string? Category { get; set; }
        public int? OrderInCategory { get; set; }
        public string? Label { get; set; }
        public string? Units { get; set; }
        public string? DataType { get; set; }        
        public string? DataSource { get; set; }
        public string? FieldId { get; set; }
        public int? Editable { get; set; }
        public double? LowerBound { get; set; }
        public double? UpperBound { get; set; }
        public string? AllowedCategories { get; set; }
        public int? DecimalRounding { get; set; }
        public string? Description { get; set; }
        public string? RecentResult { get; set; }
    }
}
