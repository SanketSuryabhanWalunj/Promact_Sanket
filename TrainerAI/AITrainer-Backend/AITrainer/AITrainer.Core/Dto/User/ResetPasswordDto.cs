namespace AITrainer.AITrainer.Core.Dto.User
{
    public class ResetPasswordDto
    {
        public string ResetToken { get; set; }
        public string Id { get; set; }
        public string NewPassword { get; set; }
    }
}
