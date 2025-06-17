using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Exam
{
    public class ReqUpdateQuestionDto
    {
        [Required]
        public int Id { get; set; }
        [Required]
        public string QuestionText { get; set; }
        [Required]
        public List<ReqUpdateOptionDto> reqOptions { get; set; }
    }
}
