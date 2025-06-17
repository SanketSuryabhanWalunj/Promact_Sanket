using System;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.LiveExam
{
    public class ReqLiveExamDetailsDto
    {
        [Required]
        public DateTime ExamDate { get; set; }
        [Required]
        public int AllocatedSeatsCount { get; set; }
        [Required]
        public Guid CourseId { get; set; }
    }
}
