using AITrainer.AITrainer.Core.Dto.Batches;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.Batches
{
    public interface IBatchRepository
    {
        Task<bool> CheckBatchNameExits(string batchName);
        Task<bool> CreatedAsync(Batch batch);
        Task<List<Batch>> GetBatches(string userId, int firstIndex, int lastIndex);
        Task<bool> DeleteAsync(string id);
        Task<Batch> UpdateBatch(EditBatch editBatch);
        Task<Batch> GetBatchById(string id);
        Task<int> Count(string userId);
        Task<List<Batch>> ListBatches(string userId);
        Task<Batch> GetBatchByUserId(string userId);
        Task<List<string>> GetInternsInBatchAsync(string batchId);
    }
}
