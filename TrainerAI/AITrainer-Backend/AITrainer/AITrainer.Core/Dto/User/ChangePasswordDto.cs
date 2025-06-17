namespace AITrainer.AITrainer.Core.Dto.User
{
    public class ChangePasswordDto
    {
        public string id { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
    }
    public class CreatePasswordDto
    {
        public string ResetToken { get; set; }
        public string Id { get; set; }
        public string NewPassword { get; set; }
    }
}
