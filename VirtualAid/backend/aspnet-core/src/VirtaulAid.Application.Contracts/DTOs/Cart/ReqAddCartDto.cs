using System;
using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.Cart
{
    public class ReqAddCartDto
    {
        public Guid? CompanyId { get; set; }       
        public Guid? UserId { get; set; }
        [Required]
        public Guid CourseId { get; set; }
        public string ExamType { get; set; }
        [Required]
        public int CourseCount { get; set; }
    }
}
