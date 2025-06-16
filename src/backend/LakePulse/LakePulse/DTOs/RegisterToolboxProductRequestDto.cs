namespace LakePulse.DTOs
{
    public class RegisterToolboxProductRequestDto
    {
        public required int lakePulseId { get; set; }
        public required string locationIdentifier { get; set; }
        public required string orderId { get; set; }
        public required string kId { get; set; }
        public required string userEmail { get; set; }
    }
}
