using LakePulse.DTOs.DataPartner;

namespace LakePulse.Services.DataPartner
{
    public interface IDataPartnerService
    {
        /// <summary>
        /// Creates a new data partner record.
        /// </summary>
        /// <param name="requestDto">The data partner details to create.</param>
        /// <param name="userId">The ID of the user creating the record.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the created data partner.</returns>
        Task<DataPartnerResponseDto> CreateDataPartnerAsync(CreateDataPartnerRequestDto requestDto, string userId);

        /// <summary>
        /// Gets all data partners for a specific LakePulse ID with pagination.
        /// </summary>
        /// <param name="lakePulseId">The LakePulse ID to filter by.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the paginated list of data partners.</returns>
        Task<PaginatedDataPartnerResponseDto> GetDataPartnersByLakePulseIdAsync(int lakePulseId, int pageNumber, int pageSize);

        /// <summary>
        /// Deletes a data partner record by its ID.
        /// </summary>
        /// <param name="id">The ID of the data partner to delete.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains a string message indicating the result.</returns>
        Task<string> DeleteDataPartnerAsync(Guid id);

        /// <summary>
        /// Updates an existing data partner record.
        /// </summary>
        /// <param name="requestDto">The updated data partner details.</param>
        /// <param name="userId">The ID of the user updating the record.</param>
        /// <returns>A task that represents the asynchronous operation. The task result contains the updated data partner.</returns>
        Task<DataPartnerResponseDto> UpdateDataPartnerAsync(UpdateDataPartnerRequestDto requestDto, string userId);
    }
} 