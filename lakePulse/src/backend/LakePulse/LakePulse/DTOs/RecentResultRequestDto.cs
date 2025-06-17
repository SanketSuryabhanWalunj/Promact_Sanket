namespace LakePulse.DTOs
{
    public class RecentResultRequestDto
    {
        public required string UserEmail { get; set; }
        public required string LakeId { get; set; }
        public required string FieldId { get; set; }
        public required string DataType { get; set; }
        public required string DataSource { get; set; }
        public object? PreviousValue { get; set; }
        public object? UpdatedValue { get; set; }
    }
}
