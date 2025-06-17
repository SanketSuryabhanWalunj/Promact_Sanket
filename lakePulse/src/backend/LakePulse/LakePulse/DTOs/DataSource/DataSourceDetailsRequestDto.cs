namespace LakePulse.DTOs
{
    public class DataSourceDetailsRequestDto
    {
        public required string lakePulseId { get; set; }
        public required string dataSourceType { get; set; }
        public string? searchTerm { get; set; } = null;
        public DateTime? fromDate { get; set; } = null;
        public DateTime? toDate { get; set; } = null;
        public string? sortBy { get; set; } = null;
        public string? sortDirection { get; set; } = "asc";
        public required int pageNumber { get; set; } = 1;
        public required int pageSize { get; set; } = 10;
    }
}
