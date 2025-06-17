namespace AITrainer.AITrainer.Core.Dto.Intern
{
    public class InternPaginatedResponse<T>
    {
        public IEnumerable<T> Data { get; set; }
        public int TotalPages { get; set; }
    }
}
