using AITrainer.AITrainer.Core.Dto.Batches;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.AITrainer.Repository.Batches
{
    public class BatchRepository : IBatchRepository
    {
        private readonly ApplicationDbContext _context;
        public BatchRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Checks if a batch name exists in the database.
        /// </summary>
        /// <param name="batchName">The name of the batch to check.</param>
        /// <returns>
        /// Returns true if the batch name exists and is not deleted, otherwise returns false.
        /// </returns>
        public async Task<bool> CheckBatchNameExits(string batchName)
        {
            var exits = await _context.Batch
                .Where(u => u.BatchName == batchName && u.IsDeleted==false)
                .FirstOrDefaultAsync();

            if(exits == null)
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Creates a new batch in the database.
        /// </summary>
        /// <param name="batch">The batch object to be created.</param>
        /// <returns>
        /// Returns true if the batch is successfully created, otherwise returns false.
        /// </returns>
        public async Task<bool> CreatedAsync(Batch batch)
        {
            await _context.Batch.AddAsync(batch);

            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Retrieves a list of batches created by users associated with the provided user ID, paginated according to the specified range.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="firstIndex">The index of the first batch to retrieve.</param>
        /// <param name="lastIndex">The index of the last batch to retrieve.</param>
        /// <returns>
        /// A list of batches created by users associated with the provided user ID, paginated according to the specified range.
        /// </returns>
        public async Task<List<Batch>> GetBatches(string userId, int firstIndex, int lastIndex)
        {
            var organiztionId = await _context.Admin
               .Where(u => u.UserId == userId)
               .Select(u => u.OrganizationId)
               .FirstOrDefaultAsync();

            var user = await _context.Admin
                .Where(u => u.OrganizationId == organiztionId)
                .Select(u => u.UserId)
                .ToListAsync();

            var batches = await _context.Batch
                .Where(u => u.IsDeleted == false  && user.Contains(u.CreatedBy))
                .OrderByDescending(u => u.CreatedDate)
                .Skip(firstIndex)
                .Take(lastIndex - firstIndex)
                .ToListAsync();

            return batches;
        }

        /// <summary>
        /// Deletes a batch with the specified ID from the database.
        /// </summary>
        /// <param name="id">The ID of the batch to be deleted.</param>
        /// <returns>
        /// A boolean value indicating whether the deletion operation was successful.
        /// </returns>
        public async Task<bool> DeleteAsync(string id)
        {
            var batch = await _context.Batch
                .FirstOrDefaultAsync(u => u.Id == id);

            if(batch == null)
            {
                return false;
            }

            batch.UpdatedDate = DateTime.UtcNow;
            batch.IsDeleted = true;
            await _context.SaveChangesAsync();

            return true;
        }

        /// <summary>
        /// Updates the details of a batch in the database.
        /// </summary>
        /// <param name="editBatch">The object containing the updated batch information.</param>
        /// <returns>
        /// The updated batch object after the changes have been saved to the database.
        /// </returns>
        public async Task<Batch> UpdateBatch(EditBatch editBatch)
        {
            var batch = await _context.Batch
                .FirstOrDefaultAsync(u => u.Id == editBatch.Id);

            batch.UpdatedDate = DateTime.UtcNow;
            batch.BatchName = editBatch.BatchName;
            batch.Description = editBatch.Description;
            batch.WeekdaysNames = editBatch.WeekdaysNames;
            batch.DailyHours=editBatch.DailyHours;

            await _context.SaveChangesAsync();

            return batch;
        }

        /// <summary>
        /// Retrieves a batch from the database based on the provided batch ID.
        /// </summary>
        /// <param name="id">The unique identifier of the batch to retrieve.</param>
        /// <returns>
        /// The batch object corresponding to the provided ID if found; otherwise, returns null.
        /// </returns>
        public async Task<Batch> GetBatchById(string id)
        {
            var batch = await _context.Batch
                .FirstOrDefaultAsync(u => u.Id == id && u.IsDeleted == false);

            return batch;
        }

        /// <summary>
        /// Counts the total number of batches in the database.
        /// </summary>
        /// <returns>
        /// An integer representing the total count of batches.
        /// </returns>
        public async Task<int> Count(string userId)
        {
            var organiztionId = await _context.Admin
               .Where(u => u.UserId == userId)
               .Select(u => u.OrganizationId)
               .FirstOrDefaultAsync();

            var user = await _context.Admin
                .Where(u => u.OrganizationId == organiztionId)
                .Select(u => u.UserId)
                .ToListAsync();

            var batch = await _context.Batch
                .Where(u => !u.IsDeleted && user.Contains(u.CreatedBy))
                .ToListAsync();

            return batch.Count();
        }

        /// <summary>
        /// Retrieves a list of batches associated with the provided user ID.
        /// </summary>
        /// <param name="userId">The user ID for which batches are to be retrieved.</param>
        /// <returns>
        /// A list of batches associated with the provided user ID.
        /// </returns>
        public async Task<List<Batch>> ListBatches(string userId)
        {

            var organiztionId = await _context.Admin
               .Where(u => u.UserId == userId)
               .Select(u => u.OrganizationId)
               .FirstOrDefaultAsync();

            var user = await _context.Admin
                .Where(u => u.OrganizationId == organiztionId)
                .Select(u => u.UserId)
                .ToListAsync();

            var batches = await _context.Batch
                .Where(u => u.IsDeleted == false)
                 .Where(i => user.Contains(i.CreatedBy))
                .OrderByDescending(u => u.CreatedDate)
                .ToListAsync();

            return batches;
        }

        /// <summary>
        /// Retrieves the batch associated with the provided user ID.
        /// </summary>
        /// <param name="userId">The user ID for which the batch is to be retrieved.</param>
        /// <returns>
        /// The batch associated with the provided user ID.
        /// </returns>
        public async Task<Batch> GetBatchByUserId(string userId)
        {
            var intern = await _context.Intern
                .Where(i => i.UserId == userId && i.IsDeleted == false)
                .Select(i => new { i.Id, i.BatchId })
                .FirstOrDefaultAsync();

            if (intern == null)
                return null;

            var batch = await _context.Batch
                .Where(b => b.Id == intern.BatchId && b.IsDeleted == false)
                .FirstOrDefaultAsync();

            return batch;
        }

        /// <summary>
        /// Retreives the First NAme and Last Name of all the interns in a batch
        /// </summary>
        /// <param name="batchId">The id of the batch </param>
        /// <returns></returns>
        public async Task<List<string>> GetInternsInBatchAsync(string batchId)
        {
          var internsInBatch = await _context.Intern.AsNoTracking()
         .Where(i => i.BatchId == batchId && i.IsDeleted == false)
         .Select(i => i.FirstName + " " + i.LastName)
         .ToListAsync();

        if (internsInBatch.Count == 0)
            return null;
        else
            return internsInBatch;
        }
    }
}
