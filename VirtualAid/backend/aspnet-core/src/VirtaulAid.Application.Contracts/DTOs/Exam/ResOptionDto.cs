using System;

namespace VirtaulAid.DTOs.Exam
{
    public class ResOptionDto
    {
        public int Id { get; set; }
        public string OptionText { get; set; }
        public bool IsCorrect { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public string Language {  get; set; }
    }
}
