using AutoMapper;
using LakePulse.Data;
using LakePulse.DTOs.FieldNote;
using LakePulse.Models;
using Microsoft.EntityFrameworkCore;

namespace LakePulse.Services.FieldNotes
{
    public class FieldNoteService : IFieldNoteService
    {
        private readonly ILogger<FieldNoteService> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public FieldNoteService(ILogger<FieldNoteService> logger,
            ApplicationDbContext context,
            IMapper mapper)
        {
            _logger = logger;
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Adds a new field note asynchronously.
        /// </summary>
        /// <param name="fieldNote">The field note request DTO containing the details of the field note to add.</param>
        /// <returns>A string indicating the result of the operation.</returns>
        public async Task<string> AddFieldNoteAsync(FieldNoteRequestDto fieldNote)
        {
            try
            {
                FieldNote fieldNoteEntity = _mapper.Map<FieldNote>(fieldNote);
                fieldNoteEntity.IsAlert = false;
                _context.FieldNotes.Add(fieldNoteEntity);
                await _context.SaveChangesAsync();
                return StringConstant.fieldNoteAdded;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorAddFieldNote);
                throw;
            }
        }

        /// <summary>
        /// Deletes a field note asynchronously.
        /// </summary>
        /// <param name="fieldNoteId">The ID of the field note to delete.</param>
        /// <param name="userId">The ID of the user who owns the field note.</param>
        /// <returns>A string indicating the result of the operation.</returns>
        public async Task<string> DeleteFieldNoteAsync(Guid fieldNoteId, string userId)
        {
            try
            {
                FieldNote? note = await _context.FieldNotes.FirstOrDefaultAsync(x => x.Id == fieldNoteId && x.UserId == userId);
                if (note == null)
                {
                    return StringConstant.fieldNoteNotFound;
                }
                else
                {
                    _context.FieldNotes.Remove(note);
                    await _context.SaveChangesAsync();
                    return StringConstant.fieldNoteRemoved;
                }
            }
            catch (Exception ex)
            {

                _logger.LogError(ex, StringConstant.errorGetFieldNote);
                throw;
            }
        }


        /// <summary>
        /// Retrieves a list of field notes for a specific lake by its ID.
        /// </summary>
        /// <param name="lakeId">The ID of the lake.</param>
        /// <param name="pageNumber">The page number for pagination.</param>
        /// <param name="pageSize">The number of items per page.</param>
        /// <param name="userId">The ID of the user requesting the field notes.</param>
        /// <returns>A list of field notes with additional information about likes.</returns>
        public async Task<List<FieldNotesResponseDto>> GetFieldNoteByLakeIdAsync(string lakeId, int pageNumber, int pageSize, string userId)
        {
            try
            {
                List<FieldNote> notes = await _context.FieldNotes
                    .Where(x => x.LakeId == lakeId && x.IsReplay != true)
                    .OrderByDescending(x => x.CreatedTime)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                List<FieldNote> subNotes = await _context.FieldNotes
                    .Where(x => x.FieldNoteId.HasValue && notes.Select(m => m.Id).Contains(x.FieldNoteId.Value))
                    .ToListAsync();

                notes.AddRange(subNotes);
                List<FieldNoteLike> likes = await _context.FieldNoteLikes
                    .Where(x => x.FieldNoteId.HasValue && notes.Select(m => m.Id).Contains(x.FieldNoteId.Value))
                    .ToListAsync();
                List<FieldNotesResponseDto> fieldNotesDto = _mapper.Map<List<FieldNotesResponseDto>>(notes);
                fieldNotesDto.ForEach(x =>
                {
                    x.IsCurrentUserLike = likes.Any(y => y.FieldNoteId == x.Id && y.UserId == userId);
                    x.LikeCount = likes.Count(y => y.FieldNoteId == x.Id);
                });

                return fieldNotesDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorGetFieldNote);
                throw;
            }
        }

        /// <summary>
        /// Updates a field note asynchronously.
        /// </summary>
        /// <param name="userId">The ID of the user who owns the field note.</param>
        /// <param name="fieldNoteId">The ID of the field note to update.</param>
        /// <param name="note">The new note content.</param>
        /// <returns>A string indicating the result of the operation.</returns>
        public async Task<string> UpdateFieldNoteAsync(string userId, Guid fieldNoteId, string note)
        {
            try
            {

                FieldNote? noteObj = await _context.FieldNotes.FirstOrDefaultAsync(x => x.Id == fieldNoteId && x.UserId == userId);
                if (noteObj == null)
                {
                    return StringConstant.fieldNoteNotFound;
                }
                else
                {
                    noteObj.Note = note;
                    noteObj.LastUpdatedBy = userId;
                    noteObj.LastUpdatedTime = DateTime.UtcNow;
                    _context.FieldNotes.Update(noteObj);
                    _context.SaveChanges();
                    return StringConstant.fieldNoteUpdated;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorUpdateFieldNote);
                throw;
            }
        }

        /// <summary>
        /// Likes or dislikes a field note asynchronously.
        /// </summary>
        /// <param name="fieldNoteId">The ID of the field note to like or dislike.</param>
        /// <param name="userId">The ID of the user performing the action.</param>
        /// <returns>The total count of likes for the field note.</returns>
        public async Task<int> LikeDislikeFieldNoteAsync(Guid fieldNoteId, string userId)
        {
            try
            {
                FieldNoteLike? noteLike = await _context.FieldNoteLikes.FirstOrDefaultAsync(x => x.FieldNoteId == fieldNoteId && x.UserId == userId);
                if (noteLike == null)
                {

                    FieldNote? noteObj = await _context.FieldNotes.FirstOrDefaultAsync(x => x.Id == fieldNoteId);
                    if (noteObj == null)
                    {
                        throw new ArgumentException(StringConstant.fieldNoteNotFound);
                    }

                    FieldNoteLike fieldNoteLike = new FieldNoteLike
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        FieldNoteId = fieldNoteId,
                        CreatedTime = DateTime.UtcNow,
                        CreatedBy = userId
                    };
                    _context.FieldNoteLikes.Add(fieldNoteLike);
                }
                else
                {
                    _context.FieldNoteLikes.Remove(noteLike);     
                }

                await _context.SaveChangesAsync();
                return await _context.FieldNoteLikes.CountAsync(x => x.FieldNoteId == fieldNoteId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, StringConstant.errorLikeDislikeFieldNote);
                throw;
            }
        }
    }
}
