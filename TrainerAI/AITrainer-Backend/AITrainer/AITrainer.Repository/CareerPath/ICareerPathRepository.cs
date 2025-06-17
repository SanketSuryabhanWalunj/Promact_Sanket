using AITrainer.AITrainer.Core.Dto.CareerPaths;
using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Repository.CareerPaths
{
    public interface ICareerPathRepository
    {
        Task<List<CareerPath>> GetAllCareerPathsAsync();
        Task<CareerPath> CreateCareerPathAsync(string careerPathName);
        Task<CareerPath> EditCareerPathAsync(EditCareerPathDto editCareerPath);
        Task<CareerPath> DeleteCareerPathAsync(string careerPathId);
        Task<CareerPath> GetCareerPathByIdAsync(string careerPathId);
    }
}
