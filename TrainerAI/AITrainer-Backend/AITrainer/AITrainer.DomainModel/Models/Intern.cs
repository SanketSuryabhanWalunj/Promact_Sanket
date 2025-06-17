using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class Intern
    {
        [Key]
        public string Id { get; set; } // Auto-incremented primary key
        public string UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string CreatedBy { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Zip { get; set; }
        public string? MobileNumber { get; set; }
        public string? CollegeName { get; set; }
        public string? CareerPathId { get; set; }
        public CareerPath? CareerPath {  get; set; }   
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedDate { get; set; }
        public bool IsDeleted { get; set; }
        public ApplicationUser User { get; set; }
        public string? BatchId { get; set; }
        public Batch Batch { get; set; }
    }
}
