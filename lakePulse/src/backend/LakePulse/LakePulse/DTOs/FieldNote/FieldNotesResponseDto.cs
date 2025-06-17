namespace LakePulse.DTOs.FieldNote
{
    public class FieldNotesResponseDto
    {
        public Guid Id { get; set; }
        public string? UserId { get; set; }
        public string? LakeId { get; set; }
        public string? UserName { get; set; }
        public string? Note { get; set; }
        public bool? IsReplay { get; set; }
        public bool? IsAlert { get; set; }
        public int? AlertLevelId { get; set; }
        public int? AlertCategorieId { get; set; }
        public Guid? FieldNoteId { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
        public bool IsCurrentUserLike { get; set; }
        public int LikeCount { get; set; }
    }
}
