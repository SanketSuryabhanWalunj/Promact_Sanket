using System.Collections.Generic;

namespace VirtaulAid.DTOs.Exam
{
    public class ResExamQuestionDto
    {
        public int Id { get; set; }
        public int ExamDetailId { get; set; }
        public string QuestionText { get; set; }
        public List<ResExamOptionDto> QuestionOptions { get; set; }
        public string Language {  get; set; }
    }
}
