using System.Text;

namespace AITrainer.Services
{
    public class PasswordGenerator
    {
        private const string CapitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private const string Numbers = "0123456789";
        private const string SmallLetters = "abcdefghijklmnopqrstuvwxyz";
        private const string SpecialCharacters = "!@#$%&*?";

        /// <summary>
        /// Generates a random password.
        /// </summary>
        /// <returns>A randomly generated password.</returns>
        public static string GeneratePassword()
        {
            var random = new Random();
            var password = $"{CapitalLetters[random.Next(CapitalLetters.Length)]}{SmallLetters[random.Next(SmallLetters.Length)]}{Numbers[random.Next(Numbers.Length)]}{SpecialCharacters[random.Next(SpecialCharacters.Length)]}";

            for (int i = 4; i < 10; i++)
            {
                var characterSet = $"{CapitalLetters}{SmallLetters}{Numbers}{SpecialCharacters}";
                password += characterSet[random.Next(characterSet.Length)];
            }

            return password;
        }

        /// <summary>
        /// Encodes a password token using Base64 encoding.
        /// </summary>
        /// <param name="password">The password token to encode.</param>
        /// <returns>The Base64 encoded password token.</returns>
        public static string EncodeToken(string password)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(password);
            string encodedToken = Convert.ToBase64String(bytes);
            return encodedToken;
        }

        /// <summary>
        /// Decodes a Base64 encoded token to retrieve the original password.
        /// </summary>
        /// <param name="encodedToken">The Base64 encoded token to decode.</param>
        /// <returns>The original password.</returns>
        public static string DecodeToken(string encodedToken)
        {
            byte[] bytes = Convert.FromBase64String(encodedToken);
            string password = Encoding.UTF8.GetString(bytes);
            return password;
        }
    }
}
