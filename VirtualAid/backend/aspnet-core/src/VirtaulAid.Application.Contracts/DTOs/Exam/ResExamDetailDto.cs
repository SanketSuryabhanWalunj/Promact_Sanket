using System;

namespace VirtaulAid.DTOs.Exam
{
    public class ResExamDetailDto
    {
        public int Id { get; set; }
        public string ExamName { get; set; }
        public ushort DurationTime { get; set; }
        public ushort NoOfQuestions { get; set; }
        public Guid CourseId { get; set; }
        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
        public string Language { get; set; }
    }
}
