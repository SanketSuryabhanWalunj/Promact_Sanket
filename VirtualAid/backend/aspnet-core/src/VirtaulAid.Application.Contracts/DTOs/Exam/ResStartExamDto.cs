using System.Collections.Generic;

namespace VirtaulAid.DTOs.Exam
{
    public class ResStartExamDto
    {
        public int ExamTime { get; set; }
        public List<ResExamQuestionDto> Questions { get; set; }
    }
}
