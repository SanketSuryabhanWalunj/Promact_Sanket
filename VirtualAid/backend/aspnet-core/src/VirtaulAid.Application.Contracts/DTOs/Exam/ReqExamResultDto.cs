using System;

namespace VirtaulAid.DTOs.Exam
{
    public class ReqExamResultDto
    {
        public int ChosedOptionId { get; set; }      
        public int QuestionId { get; set; }    
        public Guid? UserId { get; set; }
    }
}
