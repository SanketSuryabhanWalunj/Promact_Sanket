using System.ComponentModel.DataAnnotations;

namespace AITrainer.AITrainer.DomainModel.Models
{
    public class ChatGptInteraction
    {
        [Key]
        public int Id { get; set; }
        public string? Prompt { get; set; }
        public string? Response { get; set; }
        public int StatusCode { get; set; }
        public DateTime CreatedDate { get; set; }   
    }
}
