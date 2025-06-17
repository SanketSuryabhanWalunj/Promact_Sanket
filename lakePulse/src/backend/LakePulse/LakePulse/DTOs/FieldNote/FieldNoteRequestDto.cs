namespace LakePulse.DTOs.FieldNote
{
    public class FieldNoteRequestDto
    {
        public required string UserId { get; set; }
        public required string UserName { get; set; }
        public required string LakeId { get; set; }
        public required string Note { get; set; }
        public bool? IsReplay { get; set; }
        public Guid? FieldNoteId { get; set; }
    }
}
