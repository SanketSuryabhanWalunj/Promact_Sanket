using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Volo.Abp.Users;

namespace VirtaulAid.Util
{
    public class CurrentUserService : ICurrentUser
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public bool IsAuthenticated => _httpContextAccessor.HttpContext.User.Identity.IsAuthenticated;

        public Guid? Id
        {
            get
            {
                var idClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value;
                if (idClaim != null && Guid.TryParse(idClaim, out var userId))
                {
                    return userId;
                }
                return null;
            }
        }

        public string UserName => _httpContextAccessor.HttpContext?.User?.FindFirst("UserName")?.Value;

        public string Name => _httpContextAccessor.HttpContext?.User?.FindFirst("Name")?.Value;

        public string SurName => _httpContextAccessor.HttpContext?.User?.FindFirst("SurName")?.Value;

        public string PhoneNumber => _httpContextAccessor.HttpContext?.User?.FindFirst("PhoneNumber")?.Value;

        public bool PhoneNumberVerified => _httpContextAccessor.HttpContext?.User?.FindFirst("PhoneNumberVerified")?.Value == "true";

        public string Email => _httpContextAccessor.HttpContext?.User?.FindFirst("Email")?.Value;

        public bool EmailVerified => _httpContextAccessor.HttpContext?.User?.FindFirst("EmailVerified")?.Value == "true";

        public string[] Roles => _httpContextAccessor.HttpContext?.User?.Claims
            .Where(c => c.Type == ClaimTypes.Role)
            .Select(c => c.Value)
            .ToArray() ?? Array.Empty<string>();
        public Guid? TenantId => null;





        /// <summary>
        /// Method to find claim based on claim type.
        /// </summary>
        /// <param name="claimType">Claim type.</param>
        /// <returns>Claim</returns>
        public Claim FindClaim(string claimType)
        {
            var claim = _httpContextAccessor.HttpContext?.User?.Claims
                .FirstOrDefault(c => c.Type == claimType);

            return claim ?? new Claim(claimType, ""); // Return an empty claim if not found
        }

        /// <summary>
        /// Method to get the all claims based on claim type.
        /// </summary>
        /// <param name="claimType">Claim type.</param>
        /// <returns>List of claims.</returns>
        public Claim[] FindClaims(string claimType)
        {
            var claims = _httpContextAccessor.HttpContext?.User?.Claims
                .Where(c => c.Type == claimType)
                .ToArray();

            return claims ?? Array.Empty<Claim>(); // Return an empty array if not found
        }

        /// <summary>
        /// Method to get all the claims.
        /// </summary>
        /// <returns>List of the claims.</returns>
        public Claim[] GetAllClaims()
        {
            var allClaims = _httpContextAccessor.HttpContext?.User?.Claims.ToArray();

            return allClaims ?? Array.Empty<Claim>(); // Return an empty array if no claims found
        }

        /// <summary>
        /// Method to check wether the current user is in provided role or not.
        /// </summary>
        /// <param name="roleName">Name of the role.</param>
        /// <returns>True if it is in role otherwise false.</returns>
        public bool IsInRole(string roleName)
        {
            var isInRole = _httpContextAccessor.HttpContext?.User?.IsInRole(roleName);

            return isInRole ?? false; // Return false if the role check fails or HttpContext is not available
        }

        /// <summary>
        /// Method to get the loggedin user's email
        /// </summary>
        /// <returns>string</returns>
        public string GetCurrentUserEmail()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                // Handle the case when HttpContext is not available.
                return null;
            }
            var user = httpContext.User;
            var emailClaim = user.FindFirst("UserEmail");

            if (emailClaim != null)
            {
                return emailClaim.Value;
            }
            return null;
        }
    }
}
