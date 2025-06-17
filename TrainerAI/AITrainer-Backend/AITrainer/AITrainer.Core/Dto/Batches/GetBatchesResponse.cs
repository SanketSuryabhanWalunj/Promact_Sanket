using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Batches
{
    public class GetBatchesResponse
    {
        public List<Batch> Batch { get; set; }
        public int TotalPages { get; set; }
    }
}
