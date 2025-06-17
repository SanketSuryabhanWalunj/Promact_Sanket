using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.TechStacks
{
    public class TechStackRepository : ITechStackRepository
    {
        private readonly ApplicationDbContext _context;
        public TechStackRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all technology stacks from the database.
        /// </summary>
        /// <returns>A list of TechStack objects.</returns>
        public async Task<List<TechStack>> GetAllTechStacksAsync()
        {
            return await _context.TechStacks.Where(ts => !ts.IsDeleted).ToListAsync();
        }

        /// <summary>
        /// Adds a new technology stack to the database.
        /// </summary>
        /// <param name="techStack">The TechStack object to be added.</param>
        /// <returns>The added TechStack object, including its generated ID.</returns>
        public async Task<TechStack> CreateTechStackAsync(TechStack techStack)
        {
            techStack.CreatedDate = DateTime.UtcNow;
            techStack.LastUpdatedDate = DateTime.UtcNow;
            _context.TechStacks.Add(techStack);
            await _context.SaveChangesAsync();
            return techStack;
        }

        /// <summary>
        /// Deletes a technology stack from the database based on its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the technology stack to be deleted.</param>
        public async Task DeleteAsync(string id)
        {
            var techStack = await _context.TechStacks.FindAsync(id);
            if(techStack != null)
            {
                techStack.IsDeleted = true;
                techStack.LastUpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
