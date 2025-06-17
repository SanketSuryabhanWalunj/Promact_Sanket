using System;

namespace VirtaulAid.DTOs.LiveExam
{
    public class ResLiveExamDetailsDto
    {
        public int Id { get; set; }
        public DateTime ExamDate { get; set; }
        public int AllocatedSeatsCount { get; set; }
        public int RemaningSeatsCount { get; set; }
        public Guid CourseId { get; set; }
        public DateTime CreationTime { get; set; }
    }
}
