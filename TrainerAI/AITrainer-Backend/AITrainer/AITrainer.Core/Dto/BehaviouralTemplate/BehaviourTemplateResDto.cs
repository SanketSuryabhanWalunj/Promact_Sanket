using AITrainer.AITrainer.DomainModel.Models;
using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.Core.Dto.BehaviouralTemplate
{
    public class BehaviourTemplateResDto
    {
    
        public string Id { get; set; }
        public string TemplateName { get; set; }
        public string? Description { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsPublished {  get; set; }
        public List<BehaviourCategory> Options { get; set; }
    }
    public class BehaviourCategoryResDto
    {
      
        public string Id { get; set; }
        public string BehaviourTemplateId { get; set; }
        public BehaviourTemplate? BehaviourTemplate { get; set; }
        public string CategoryName { get; set; }
        public double TotalMarks { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool? IsPublished {  get; set; }
        public bool IsDeleted { get; set; }
    }



}
