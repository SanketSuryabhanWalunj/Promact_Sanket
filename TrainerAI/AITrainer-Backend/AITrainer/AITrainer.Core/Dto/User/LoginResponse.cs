namespace AITrainer.AITrainer.Core.Dto.User
{
    public class LoginResponse
    {
        public List<string> Token { get; set; }
        public UserProfile Profile { get; set; }
    }
}
