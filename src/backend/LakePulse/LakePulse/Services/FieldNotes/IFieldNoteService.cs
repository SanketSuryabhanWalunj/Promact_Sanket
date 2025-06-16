using LakePulse.DTOs.FieldNote;

namespace LakePulse.Services.FieldNotes
{
    public interface IFieldNoteService
    {
        /// <summary>
        /// Retrieves a list of field notes for a specific lake by its ID.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="userId">The ID of the user requesting the field notes.</param>
        /// <returns>A list of field notes with additional information about likes.</returns>
        Task<List<FieldNotesResponseDto>> GetFieldNoteByLakeIdAsync(string lakeId, int pageNumber, int pageSize, string userId);

        /// <summary>
        /// Adds a new field note.
        /// </summary>
        /// <param name="fieldNote">The field note to add.</param>
        /// <returns>The ID of the newly added field note.</returns>
        Task<string> AddFieldNoteAsync(FieldNoteRequestDto fieldNote);

        /// <summary>
        /// Updates an existing field note.
        /// </summary>
        /// <param name="userId">The ID of the user making the update.</param>
        /// <param name="fieldNoteId">The ID of the field note to update.</param>
        /// <param name="note">The updated note content.</param>
        /// <returns>The ID of the updated field note.</returns>
        Task<string> UpdateFieldNoteAsync(string userId, Guid fieldNoteId, string note);

        /// <summary>
        /// Deletes a field note.
        /// </summary>
        /// <param name="fieldNoteId">The ID of the field note to delete.</param>
        /// <param name="userId">The ID of the user making the deletion.</param>
        /// <returns>The ID of the deleted field note.</returns>
        Task<string> DeleteFieldNoteAsync(Guid fieldNoteId, string userId);

        /// <summary>
        /// Likes or dislikes a field note asynchronously.
        /// </summary>
        /// <param name="fieldNoteId">The ID of the field note to like or dislike.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <returns>The total count of likes for the field note.</returns>
        Task<int> LikeDislikeFieldNoteAsync(Guid fieldNoteId, string userId);
    }
}
