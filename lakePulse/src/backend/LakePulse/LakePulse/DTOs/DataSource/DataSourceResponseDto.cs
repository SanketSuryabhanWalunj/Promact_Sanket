namespace LakePulse.DTOs.DataSource
{
    public class DataSourceResponseDto
    {
        public Guid Id { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public string? FilePath { get; set; }
        public string? DataSourceType { get; set; }
        public string? Label { get; set; }
        public string? Comment { get; set; }
        public string? LakePulseId { get; set; }
        public DateTime? ReportDate { get; set; }
        public string? UserId { get; set; }
        public string? PresignedURL { get; set; }

    }
}
