using LakePulse.DTOs.FieldNote;
using LakePulse.Services.FieldNotes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{
    [Authorize]
    [Route("api/fieldNote")]
    [ApiController]
    public class FieldNoteController : ControllerBase
    {
        private readonly IFieldNoteService _fieldNoteService;
        public FieldNoteController(IFieldNoteService fieldNoteService)
        {
            _fieldNoteService = fieldNoteService;
        }


        /// <summary>
        /// Retrieves a list of field notes for a specific lake by its ID.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="userId">The ID of the user requesting the field notes.</param>
        /// <returns>A list of field notes with additional information about likes.</returns>
        [HttpGet("field-note-by-lake-id")]
        public async Task<ActionResult> GetFieldNoteByLakeIdAsync([Required] string lakeId, [Required] int pageNumber, [Required] int pageSize, [Required] string userId)
        {
            List<FieldNotesResponseDto> fieldNoteDetails = await _fieldNoteService.GetFieldNoteByLakeIdAsync(lakeId, pageNumber, pageSize, userId);
            return Ok(fieldNoteDetails);
        }

        /// <summary>
        /// Adds a new field note.
        /// </summary>
        /// <param name="fieldNote">The field note details to add.</param>
        /// <returns>An ActionResult containing the result of the add operation.</returns>
        [HttpPost("field-note")]
        public async Task<ActionResult> AddFieldNoteAsync([Required] FieldNoteRequestDto fieldNote)
        {
            string result = await _fieldNoteService.AddFieldNoteAsync(fieldNote);
            return Ok(result);
        }

        /// <summary>
        /// Updates a field note with the specified details.
        /// </summary>
        /// <param name="userId">The ID of the user updating the note.</param>
        /// <param name="note">The updated note content.</param>
        /// <param name="fieldNoteId">The ID of the field note to update.</param>
        /// <returns>An ActionResult containing the result of the update operation.</returns>
        [HttpPut("field-note")]
        public async Task<ActionResult> UpdateFieldNoteAsync([Required] string userId, [Required] string note, [Required] Guid fieldNoteId)
        {
            string fieldNoteDetails = await _fieldNoteService.UpdateFieldNoteAsync(userId, fieldNoteId, note);
            return Ok(fieldNoteDetails);
        }

        /// <summary>
        /// Deletes a field note by its ID and the user ID.
        /// </summary>
        /// <param name="fieldNoteId">The ID of the field note to delete.</param>
        /// <param name="userId">The ID of the user requesting the deletion.</param>
        /// <returns>An ActionResult containing the result of the deletion operation.</returns>
        [HttpDelete("field-note")]
        public async Task<ActionResult> DeleteFieldNoteAsync([Required] Guid fieldNoteId, [Required] string userId)
        {
            string result = await _fieldNoteService.DeleteFieldNoteAsync(fieldNoteId, userId);
            return Ok(result);
        }

        /// <summary>
        /// Likes or dislikes a field note.
        /// </summary>
        /// <param name="fieldNoteId">The ID of the field note to like or dislike.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <returns>An ActionResult containing the total count of likes for the field note.</returns>
        [HttpPost("like-dislike")]
        public async Task<ActionResult> LikeDislikeFieldNoteAsync([Required] Guid fieldNoteId, [Required] string userId)
        {
            int result = await _fieldNoteService.LikeDislikeFieldNoteAsync(fieldNoteId, userId);
            return Ok(result);
        }
    }
}
