using LakePulse.Data;
using LakePulse.DTOs.DataPartner;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace LakePulse.Services.DataPartner
{
    #region Service Implementation
    public class DataPartnerService : IDataPartnerService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DataPartnerService> _logger;
        private readonly IMapper _mapper;

        public DataPartnerService(ApplicationDbContext context, ILogger<DataPartnerService> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        #region Public Methods
        /// <summary>
        /// Creates a new data partner record in the system.
        /// </summary>
        /// <param name="requestDto">The data partner details to create.</param>
        /// <param name="userId">The ID of the user creating the record.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the created data partner.</returns>
        /// <exception cref="InvalidOperationException">Thrown when a data partner with the same name already exists for the lake.</exception>
        /// <exception cref="Exception">Thrown when an error occurs during the creation process.</exception>
        public async Task<DataPartnerResponseDto> CreateDataPartnerAsync(CreateDataPartnerRequestDto requestDto, string userId)
        {
            try
            {
                // Check if data partner already exists for this lake
                if (await _context.DataPartners.AnyAsync(x => x.LakePulseId == requestDto.LakePulseId && x.Name == requestDto.Name))
                {
                    throw new InvalidOperationException(StringConstant.dataPartnerAlreadyExists);
                }

                var dataPartner = _mapper.Map<Models.DataPartner>(requestDto);
                dataPartner.Id = Guid.NewGuid();
                dataPartner.CreatedBy = userId;
                dataPartner.CreatedTime = DateTime.UtcNow;
                dataPartner.LastUpdatedBy = userId;
                dataPartner.LastUpdatedTime = DateTime.UtcNow;

                _context.DataPartners.Add(dataPartner);
                await _context.SaveChangesAsync();

                return _mapper.Map<DataPartnerResponseDto>(dataPartner);
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorCreatingDataPartner);
                throw new Exception(StringConstant.errorCreatingDataPartner, ex);
            }
        }

        /// <summary>
        /// Retrieves a paginated list of data partners for a specific LakePulse ID.
        /// </summary>
        /// <param name="lakePulseId">The LakePulse ID to filter by.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the paginated list of data partners.</returns>
        /// <exception cref="Exception">Thrown when an error occurs during the retrieval process.</exception>
        public async Task<PaginatedDataPartnerResponseDto> GetDataPartnersByLakePulseIdAsync(int lakePulseId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.DataPartners.Where(x => x.LakePulseId == lakePulseId);
                var totalCount = await query.CountAsync();

                var dataPartners = await query
                    .OrderBy(x => x.Name)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return new PaginatedDataPartnerResponseDto
                {
                    DataPartners = _mapper.Map<List<DataPartnerResponseDto>>(dataPartners),
                    TotalCount = totalCount,
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorRetrievingDataPartners);
                throw new Exception(StringConstant.errorRetrievingDataPartners, ex);
            }
        }

        /// <summary>
        /// Deletes a data partner record by its ID.
        /// </summary>
        /// <param name="id">The ID of the data partner to delete.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a string message indicating the result.</returns>
        /// <exception cref="Exception">Thrown when an error occurs during the deletion process.</exception>
        public async Task<string> DeleteDataPartnerAsync(Guid id)
        {
            try
            {
                var dataPartner = await _context.DataPartners.FindAsync(id);
                if (dataPartner == null)
                {
                    return StringConstant.dataPartnerNotFound;
                }

                _context.DataPartners.Remove(dataPartner);
                await _context.SaveChangesAsync();

                return StringConstant.dataPartnerDeleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorDeletingDataPartner);
                throw new Exception(StringConstant.errorDeletingDataPartner, ex);
            }
        }

        /// <summary>
        /// Updates an existing data partner record.
        /// </summary>
        /// <param name="requestDto">The updated data partner details.</param>
        /// <param name="userId">The ID of the user updating the record.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the updated data partner.</returns>
        /// <exception cref="InvalidOperationException">Thrown when the data partner is not found or when a duplicate name exists.</exception>
        /// <exception cref="Exception">Thrown when an error occurs during the update process.</exception>
        public async Task<DataPartnerResponseDto> UpdateDataPartnerAsync(UpdateDataPartnerRequestDto requestDto, string userId)
        {
            try
            {
                var dataPartner = await _context.DataPartners.FindAsync(requestDto.Id);
                if (dataPartner == null)
                {
                    throw new InvalidOperationException(StringConstant.dataPartnerNotFound);
                }

                // Check if another data partner with the same name exists for this lake
                if (await _context.DataPartners.AnyAsync(x => 
                    x.LakePulseId == requestDto.LakePulseId && 
                    x.Name == requestDto.Name && 
                    x.Id != requestDto.Id))
                {
                    throw new InvalidOperationException(StringConstant.dataPartnerAlreadyExists);
                }

                _mapper.Map(requestDto, dataPartner);
                dataPartner.LastUpdatedBy = userId;
                dataPartner.LastUpdatedTime = DateTime.UtcNow;

                _context.DataPartners.Update(dataPartner);
                await _context.SaveChangesAsync();

                return _mapper.Map<DataPartnerResponseDto>(dataPartner);
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorUpdatingDataPartner);
                throw new Exception(StringConstant.errorUpdatingDataPartner, ex);
            }
        }
        #endregion
    }
    #endregion
} 