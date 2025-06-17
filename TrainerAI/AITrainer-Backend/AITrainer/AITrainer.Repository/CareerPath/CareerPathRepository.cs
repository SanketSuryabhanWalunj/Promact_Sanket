using AITrainer.AITrainer.Core.Dto.CareerPaths;
using AITrainer.AITrainer.Core.Dto.Organization;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.Formula.Functions;

namespace AITrainer.AITrainer.Repository.CareerPaths
{
    public class CareerPathRepository:ICareerPathRepository
    {
        private readonly ApplicationDbContext _context;

        public CareerPathRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all career paths from the database.
        /// </summary>
        /// <returns>A list of CareerPath objects.</returns>
        public async Task<List<CareerPath>> GetAllCareerPathsAsync()
        {
            return await _context.CareerPaths.Where(cp => !cp.IsDeleted).OrderByDescending(cp => cp.CreatedDate).ToListAsync();
        }

        /// <summary>
        /// Adds a new career path to the database.
        /// </summary>
        /// <param name="careerPathName">The CareerPath name to be added.</param>
        /// <returns>The added CareerPath object, including its generated ID.</returns>
        public async Task<CareerPath> CreateCareerPathAsync(string careerPathName)
        {
            CareerPath careerPath = new()
            {
                Id = Guid.NewGuid().ToString(),
                Name = careerPathName,
                CreatedDate = DateTime.UtcNow,
                LastUpdatedDate = DateTime.UtcNow,
                IsDeleted = false,
            };

            _context.CareerPaths.Add(careerPath);
            await _context.SaveChangesAsync();
            return careerPath;
        }


        /// <summary>
        /// Edits an existing career path to the database.
        /// </summary>
        /// <param name="editCareerPath">The CareerPathDTO which is to be edited.</param>
        /// <returns>The updated career path</returns>
        public async Task<CareerPath> EditCareerPathAsync(EditCareerPathDto editCareerPath)
        {
            CareerPath careerPath = _context.CareerPaths.FirstOrDefault(cp => cp.Id == editCareerPath.CareerPathId);
            
            careerPath.LastUpdatedDate = DateTime.UtcNow;
            careerPath.Name = editCareerPath.CareerPathName;

            _context.CareerPaths.Update(careerPath);
            await _context.SaveChangesAsync();
            return careerPath;
        }

        /// <summary>
        /// Deletes a career path from the database based on its unique identifier.
        /// </summary>
        /// <param name="careerPathId">The unique identifier of the career path to be deleted.</param>
        /// <returns>The deleted career path.</returns>
        public async Task<CareerPath> DeleteCareerPathAsync(string careerPathId)
        {
            CareerPath careerPath = await _context.CareerPaths.FindAsync(careerPathId);
            if (careerPath != null)
            {
                careerPath.IsDeleted = true;
                careerPath.LastUpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return careerPath;
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// Retrieves career path by Id.
        /// </summary>
        /// <param name="careerPathId">The unique identifier of the career path to be deleted.</param>
        /// <returns>The career path.</returns>
        public async Task<CareerPath> GetCareerPathByIdAsync(string careerPathId)
        {
            CareerPath careerPath = await _context.CareerPaths.FindAsync(careerPathId);
            if (careerPath != null)
            {
                return careerPath;
            }
            else
            {
                return null;
            }
        }
    }
}
