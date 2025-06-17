using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Exam
{
    public class ReqQuestionDto
    {
        [Required]
        public int ExamDetailId { get; set; }
        [Required]
        public string QuestionText { get; set; }
        [Required]
        public List<ReqOptionDto> reqOptions { get; set; }
    }
}
