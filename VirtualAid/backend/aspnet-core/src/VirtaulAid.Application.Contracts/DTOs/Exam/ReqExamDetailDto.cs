using System;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Exam
{
    public class ReqExamDetailDto
    {
        [Required]
        public string ExamName { get; set; }
        [Required]
        public ushort DurationTime { get; set; }
        [Required]
        public ushort NoOfQuestions { get; set; }
        [Required]
        public Guid CourseId { get; set; }
    }
}
