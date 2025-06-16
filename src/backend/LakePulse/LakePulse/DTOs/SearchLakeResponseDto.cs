namespace LakePulse.DTOs
{
    public class SearchLakeResponseDto
    {
        public List<SearchLakeDto>? LakeDetailsList { get; set; }
        public int TotalCount { get; set; }
    }
}
