using AITrainer.AITrainer.Core.Dto;
using AITrainer.AITrainer.Core.Dto.User;
using AITrainer.AITrainer.Repository.User;
using AITrainer.AITrainer.Util;
using AITrainer.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static AITrainer.AITrainer.Core.Dto.OpenAiApi.OpenAiDto;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly EmailService _emailService;

        IConfiguration _configuration;
        public UserController(IConfiguration configuration, IUserRepository userRepository, IHttpContextAccessor httpContextAccessor)
        {
            _configuration = configuration;
            _userRepository = userRepository;
            _httpContextAccessor = httpContextAccessor;
            _emailService = new EmailService(configuration);
        }

        /// <summary>
        /// Authenticates a user and generates JWT tokens for each role associated with the user. 
        /// Validates the user's credentials and returns a login response with tokens and user profile information.
        /// </summary>
        /// <param name="login">The login details containing email and password.</param>
        /// <returns>An ActionResult with the login response, including JWT tokens and user profile, or an error message.</returns>
        [HttpPost("login")]
        public async Task<ActionResult<Login>> Login(Login login)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Login failed due to validation errors." });
            }

            var tokens = new List<string>();

            var user = await _userRepository.FindByEmailAsync(login.Email);

            if (user == null)
            {
                return NotFound(new { message = "Login failed due to incorrect credentials" });
            }

            if (user.isDeleted)
            {
                return NotFound(new { message = "Login failed due to incorrect credentials" });
            }

            var signInResult = await _userRepository.CheckPasswordAsync(user, login.Password);

            if (!signInResult)
            {
                return NotFound(new { message = "Login failed due to incorrect credentials" });
            }

            var userRole = await _userRepository.GetRolesAsync(user);

            foreach (var roleName in userRole)
            {
                var role = await _userRepository.FindByNameAsync(roleName);

                string token;

                if (Convert.ToString(role) == "SuperAdmin")
                {
                    token = getToken(user.Id, "SuperAdmin", user.Email, Convert.ToString(role));
                }
                else
                {
                    token = getToken(user.Id, user.FirstName, user.Email, Convert.ToString(role));
                }

                tokens.Add(token);
            }

            var loginResponse = new LoginResponse
            {
                Token = tokens,
                Profile = new UserProfile
                {
                    Id = user.Id,
                    Name = user.UserName,
                    Email = user.Email
                }
            };
            return Ok(loginResponse);
        }

        /// <summary>
        /// Initiates the password reset process by validating the user's email, generating a reset password token,
        /// and sending a password reset link via email.
        /// </summary>
        /// <param name="request">The request containing the user's email for password reset.</param>
        /// <returns>An ActionResult indicating whether the password reset link was sent successfully.</returns>
        [HttpPost("forgot")]

        public async Task<ActionResult> ForgotPassword(ForgotRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Login failed due to validation errors." });
            }

            var user = await _userRepository.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            var resetPasswordToken = await _userRepository.GenratePasswordToken(user);
            resetPasswordToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(resetPasswordToken));
            // Generate the password reset link.
            var forgotPasswordLink = GenerateResetPasswordLink(resetPasswordToken, user.Id);
            string subject = EmailSubjects.PasswordResetSubject;
            string emailBody = EmailTemplates.GenerateResetPasswordEmail(user.FirstName, user.LastName, forgotPasswordLink);

            await _emailService.SendEmailAsync(user.Email, subject, emailBody);


            return Ok(new { message = "Reset Password link sent on your registered email address successfully" });
        }

        /// <summary>
        /// Resets the user's password using a reset token and the new password provided in the request.
        /// Validates the request, finds the user by ID, and attempts to reset the password.
        /// </summary>
        /// <param name="request">The reset password request containing user ID, reset token, and new password.</param>
        /// <returns>An ActionResult indicating the success or failure of the password reset operation.</returns>
        [HttpPut("reset")]
        public async Task<ActionResult> ResetPassword(ResetPasswordDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Login failed due to validation errors." });
            }



            var user = await _userRepository.FindByIdAsync(request.Id);

            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            request.ResetToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.ResetToken));
            var result = await _userRepository.ResetPasswordAsync(user, request.ResetToken, request.NewPassword);

            if (result)
            {
                return Ok(new { message = "Password reset successful." });
            }
            else
            {
                // Password reset failed
                return BadRequest(new { message = "Password reset failed." });
            }
        }

        /// <summary>
        /// Generates a JWT token for a user based on their roles and claims. 
        /// This is a helper method used within the login process.
        /// </summary>
        /// <param name="id">User ID.</param>
        /// <param name="name">User name or role-based identifier.</param>
        /// <param name="email">User email.</param>
        /// <param name="role">User role.</param>
        /// <returns>A JWT token as a string.</returns>
        private string getToken(string id, string name, string email, string role)
        {
            var claims = new[] {
                        new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                        new Claim(ClaimTypes.Name, name),
                        new Claim(ClaimTypes.Email, email),
                        new Claim(ClaimTypes.Role, role),
                    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var signIn = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: signIn);


            string Token = new JwtSecurityTokenHandler().WriteToken(token);

            return Token;
        }

        /// <summary>
        /// Generates a reset password link incorporating the reset password token and user ID.
        /// This is a helper method used in the forgot password process.
        /// </summary>
        /// <param name="resetPasswordToken">The reset password token.</param>
        /// <param name="id">The user's ID.</param>
        /// <returns>A complete reset password link as a string.</returns>
        private string GenerateResetPasswordLink(string resetPasswordToken, string id)
        {
            string? frontendAppUrl = _configuration["Urls:frontendUrl"];
            var resetPageUrl = $"{frontendAppUrl}/#/reset-password";
            var resetPasswordLink = $"{resetPageUrl}?token={resetPasswordToken}&Id={id}";

            return resetPasswordLink;
        }

        /// <summary>
        /// Allows a user to change their password by validating the old password and setting a new one.
        /// Validates the request, finds the user by ID, and attempts to change the password.
        /// </summary>
        /// <param name="passwords">The change password request containing user ID, old password, and new password.</param>
        /// <returns>An ActionResult indicating the success or failure of the change password operation.</returns>
        
        [HttpPut("changePassword")]
        public async Task<ActionResult> ChangePaswordAsync(ChangePasswordDto passwords)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Change password failed due to validation errors." });
            }
            var user = await _userRepository.FindByIdAsync(passwords.id);

            var result = await _userRepository.ChangePasswordAsync(user, passwords.OldPassword, passwords.NewPassword);

            if (result)
            {
                return Ok(new { message = "Change password successful." });
            }
            else
            {
                return BadRequest(new { message = "Change password failed." });
            }
        }

        /// <summary>
        /// Allows a new user to create a password for their account using a one-time token. 
        /// Validates the request, decodes the token, and sets the new password.
        /// </summary>
        /// <param name="passwords">The create password request containing user ID, reset token, and new password.</param>
        /// <returns>An ActionResult indicating the success of the password creation or an error message.</returns>
       
        [HttpPut("createPassword")]
        public async Task<ActionResult> CreatePaswordAsync(CreatePasswordDto passwords)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Password creation failed due to validation errors." });
            }
            var user = await _userRepository.FindByIdAsync(passwords.Id);
            var Token = PasswordGenerator.DecodeToken(passwords.ResetToken);

            var result = await _userRepository.ChangePasswordAsync(user, Token, passwords.NewPassword);
            string? frontendAppUrl = _configuration["Urls:frontendUrl"];
            if (result)
            {
                string subject = EmailSubjects.CreatePasswordSubject;
                string emailBody = EmailTemplates.GenerateCreatePasswordEmail(user.FirstName, user.LastName, frontendAppUrl);
                await _emailService.SendEmailAsync(user.Email, subject, emailBody);
                    
                return Ok(new { message = "Password created successfully" });
            }
            else
            {
                return BadRequest(new { message = "Failed to create password" });
            }
        }
    }
}
