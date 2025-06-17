namespace AITrainer.AITrainer.Core.Dto.JournalTemplate
{
    public class PaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int TotalPages { get; set; }
    }
}
