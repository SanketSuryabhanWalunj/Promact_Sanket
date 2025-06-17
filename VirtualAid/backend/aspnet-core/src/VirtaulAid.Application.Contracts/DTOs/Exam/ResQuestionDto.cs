using System;
using System.Collections.Generic;

namespace VirtaulAid.DTOs.Exam
{
    public class ResQuestionDto
    {
        public int Id { get; set; }
        public int ExamDetailId { get; set; }
        public string QuestionText { get; set; }       
        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public List<ResOptionDto> QuestionOptions { get; set; }
        public string Language { get; set; }
    }
}
