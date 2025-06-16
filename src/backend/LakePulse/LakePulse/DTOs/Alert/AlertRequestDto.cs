namespace LakePulse.DTOs.Alert
{
    public class AlertRequestDto
    {
        public int? AlertLevelId { get; set; }
        public int? AlertCategorieId { get; set; }
        public bool IsFieldNoteSelected { get; set; }
        public string? AlertText { get; set; }
        public string? UserId { get; set; }
        public string? LakeId { get; set; }
        public string? UserName { get; set; }
    }
}
