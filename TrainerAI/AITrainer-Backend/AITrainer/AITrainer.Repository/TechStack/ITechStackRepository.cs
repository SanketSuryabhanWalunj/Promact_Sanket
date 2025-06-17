using AITrainer.AITrainer.DomainModel.Models;
namespace AITrainer.AITrainer.Repository.TechStacks
{
    public interface ITechStackRepository
    {
        Task<List<TechStack>> GetAllTechStacksAsync();
        Task<TechStack> CreateTechStackAsync(TechStack techStack);
        Task DeleteAsync(string id);
    }
}
