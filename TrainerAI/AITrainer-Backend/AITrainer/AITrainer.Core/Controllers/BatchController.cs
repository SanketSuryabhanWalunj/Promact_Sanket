using AITrainer.AITrainer.Core.Dto.Batches;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Batches;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BatchController: ControllerBase
    {
        private readonly IBatchRepository _batchRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BatchController(IBatchRepository batchRepository, IHttpContextAccessor httpContextAccessor) 
        {
            _batchRepository = batchRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Creates a new batch with the provided details
        /// </summary>
        /// <param name="create">The data representing the new batch to be created</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the batch creation</returns>
        [HttpPost("CreateBatch")]
        public async Task<ActionResult> CreateBatch(CreateBatch create)
        {
            var batchName = await _batchRepository.CheckBatchNameExits(create.BatchName);

            if(batchName == true)
            {
                return BadRequest(new { message = "Batch Name Already exits" });
            }

            var batch = new Batch
            {
                Id = Guid.NewGuid().ToString(),
                BatchName = create.BatchName,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false,
                Description = create.Description,
                WeekdaysNames= create.WeekdaysNames,
                DailyHours =create.DailyHours,
                CreatedBy = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            };

            var batchCreate = await _batchRepository.CreatedAsync(batch);

            if(batchCreate == true)
            {
                return Ok(batch);
            }

            return BadRequest(new { message = "Batch not created! Please try again" });
        }

        /// <summary>
        /// Retrieves a list of batches based on pagination parameters
        /// </summary>
        /// <param name="currentPage">The current page number</param>
        /// <param name="defualtList">The default number of items per page</param>
        /// <returns>Returns an ActionResult with the list of batches and pagination information</returns>
        [HttpGet("GetBatch")]
        public async Task<ActionResult> GetBatches(int currentPage, int defualtList) 
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var count = await _batchRepository.Count(userId);

            var pageNumber = (int)Math.Ceiling((double)count / defualtList);

            var lastIndex = defualtList * currentPage;

            var firstIndex = lastIndex - defualtList;

            

            var batch = await _batchRepository.GetBatches(userId, firstIndex, lastIndex);

            if(batch == null)
            {
                return NotFound(new { message = "Not found any batches" });
            }

            var result = new GetBatchesResponse
            {
                Batch = batch,
                TotalPages = pageNumber
            };

            return Ok(result);
        }

        /// <summary>
        /// Deletes a batch with the specified ID
        /// </summary>
        /// <param name="id">The ID of the batch to be deleted</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the batch deletion</returns>
        [HttpDelete("DeleteBatch")]
        public async Task<ActionResult> DeleteBatch(string id)
        {
            var batch = await _batchRepository.DeleteAsync(id);

            if(batch == false)
            {
                return NotFound(new { message = "Not Fond any Batch"});
            }

            return Ok(new { message = "Batch Deleted Successfully" });
        }

        /// <summary>
        /// Updates an existing batch with the provided details
        /// </summary>
        /// <param name="editBatch">The data representing the edited batch</param>
        /// <returns>Returns an ActionResult with the updated batch information</returns>
        [HttpPut("UpdateBatch")]
        public async Task<ActionResult> UpdateBatch(EditBatch editBatch)
        {
            var batch = await _batchRepository.UpdateBatch(editBatch);

            return Ok(batch);
        }

        /// <summary>
        /// Retrieves a batch with the specified ID
        /// </summary>
        /// <param name="id">The ID of the batch to be retrieved</param>
        /// <returns>Returns an ActionResult with the batch information if found, otherwise returns a not found message</returns>
        [HttpGet("GetBatchById")]
        public async Task<ActionResult> GetBatchById(string id)
        {
            var batch = await _batchRepository.GetBatchById(id);

            if(batch == null)
            {
                return NotFound(new { message = "Not Fond any Batch" });
            }

            return Ok(batch);
        }

        /// <summary>
        /// Retrieves a list of batches associated with the current user
        /// </summary>
        /// <returns>Returns an ActionResult with the list of batches</returns>
        [HttpGet("ListBatch")]
        public async Task<ActionResult> ListBatch()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var batch = await _batchRepository.ListBatches(userId);

            return Ok(batch);
        }

        /// <summary>
        /// Retrieves the batch associated with a specific user ID
        /// </summary>
        /// <param name="id">The ID of the user for which the batch is to be retrieved</param>
        /// <returns>Returns an ActionResult with the batch information</returns>
        [HttpGet("InternBatch")]
        public async Task<ActionResult> GetBatchByUserId(string id)
        {
            var batch = await _batchRepository.GetBatchByUserId(id);
            return Ok(batch);
        }
        /// <summary>
        /// Retrieves the names of all interns in a batch
        /// </summary>
        /// <param name="batchId">The Id of the batch from which Interns need to be fetched</param>
        /// <returns></returns>
        [HttpGet("InternsInBatch")]
        public async Task<ActionResult> GetInternsOfBatch(string batchId)
        {
            var result = await _batchRepository.GetInternsInBatchAsync(batchId);
            if (result == null)
            {
                return NotFound(new { message = "No Interns Found in Batch" });
            }
            return Ok(result);
        }
    }
}
