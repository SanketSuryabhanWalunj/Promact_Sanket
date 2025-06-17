namespace LakePulse.DTOs
{
    public class SearchLakeRequestDto
    {
        public virtual required string state { get; set; }
        public virtual string? search { get; set; }
        public virtual string? filter { get; set; }
        public virtual string? sort { get; set; }
        public virtual required int pageNumber { get; set; }
        public virtual required int pageSize { get; set; }

    }
}
