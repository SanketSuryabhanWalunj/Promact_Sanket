using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Companies;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.DTOs.User;
using VirtaulAid.Localization;
using VirtaulAid.Otps;
using VirtaulAid.Roles;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class OtpService : DomainService
    {
        private readonly IRepository<Otp> _otpRepository;
        private readonly IRepository<Company> _companyRepository;
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IRepository<UserDetailRoleMapping> _userRoleRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IMapper _mapper;
        private readonly AppAppsettings _appAppsettings;
        private readonly IRepository<Role> _roleRepository;

        public OtpService(IRepository<Otp> otpRepository,
            IRepository<Company> companyRepository,
            IRepository<UserDetail> userRepository,
            IRepository<UserDetailRoleMapping> userRoleRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IOptions<AppAppsettings> options,
            IMapper mapper,
            IRepository<Role> roleRepository
            )
        {
            _otpRepository = otpRepository;
            _companyRepository = companyRepository;
            _userRepository = userRepository;
            _userRoleRepository = userRoleRepository;
            _localizer = localizer;
            _mapper = mapper;
            _appAppsettings = options.Value;
            _roleRepository = roleRepository;
        }

        /// <summary>
        /// Method to store otp with registred email and time;
        /// </summary>
        /// <param name="email">Registred Email.</param>
        /// <param name="SendedOtp">Sended Otp.</param>
        /// <returns>Task Otp Model.</returns>
        public async Task<Otp> AddOtpAsync(string email, string SendedOtp)
        {
            // Encryption of Otp
            byte[] bytesToEncode = Encoding.UTF8.GetBytes(SendedOtp);
            string base64EncodedString = Convert.ToBase64String(bytesToEncode);
            SendedOtp = base64EncodedString;
            
            // Check record is already present or not
            var otpDetails = await _otpRepository.FirstOrDefaultAsync(x=>x.EmailId==email);
            Otp result;
            if (otpDetails == null) {
                Otp otpModel = new Otp
                {
                    EmailId = email,
                    OtpCode = SendedOtp,
                };
                 result = await _otpRepository.InsertAsync(otpModel,true);
            }
            else
            {
                otpDetails.OtpCode = SendedOtp;
                otpDetails.CreationTime = DateTime.Now;
                result = await _otpRepository.UpdateAsync(otpDetails, true);
            }
            return result;
        }

        /// <summary>
        /// Method to store virtual reality otp with registred email and time;
        /// </summary>
        /// <param name="email">Registred Email.</param>
        /// <param name="SendedOtp">Sended Otp.</param>
        /// <returns>Task Otp Model.</returns>
        public async Task<Otp> AddVirtualRealityOtpAsync(string email, string SendedOtp)
        {
            // Check record is already present or not
            var otpDetails = await _otpRepository.FirstOrDefaultAsync(x=>x.EmailId==email);
            Otp result;
            if (otpDetails == null) {
                Otp otpModel = new Otp
                {
                    EmailId = email,
                    VirtualRealityOtpCode = SendedOtp,
                    VirtualRealityOtpCodeCreationTime = DateTime.Now,
                };
                 result = await _otpRepository.InsertAsync(otpModel,true);
            }
            else
            {
                otpDetails.VirtualRealityOtpCode = SendedOtp;
                otpDetails.VirtualRealityOtpCodeCreationTime = DateTime.Now;
                result = await _otpRepository.UpdateAsync(otpDetails, true);
            }
            return result;
        }

        /// <summary>
        /// Method to add bulk otp with new user's email.
        /// </summary>
        /// <param name="otps">Details of user email with otp.</param>
        /// <returns>Task.</returns>
        public async Task AddOtpRangeAsync(IEnumerable<Otp> otps)
        {
            if( otps != null && otps.Count() > 0)
            {
                // These are all new entity.
                await _otpRepository.InsertManyAsync(otps, true);
            }
        }

        /// <summary>
        /// Method is to get the otp by email.
        /// </summary>
        /// <param name="emailId">registred mail id.</param>
        /// <returns>Task Otp.</returns>
        public async Task<string?> GetOtpAsync(string emailId)
        {
            var otpDetails = await _otpRepository.FirstOrDefaultAsync(x => x.EmailId == emailId);
            if (otpDetails == null)
            {
                return null; // Otp is not present for this mailid.
            }
            DateTime currentDateTime = DateTime.Now;
            DateTime CompareTime = currentDateTime.AddMinutes(-5);
            if (CompareTime < (otpDetails.CreationTime))
            {
                byte[] decodedBytes = Convert.FromBase64String(otpDetails.OtpCode);
                string decodedPassword = Encoding.UTF8.GetString(decodedBytes);
                return decodedPassword;
            }
            else
            {
                 return null;  //Otp time expired.
            }
        }

        /// <summary>
        /// Method is to get verified virtual reality otp by entered otp
        /// </summary>
        /// <param name="token">Entered otp.</param>
        /// <returns>Task.</returns>
        public async Task<string?> GetVerifiedVirtualRealityOtpAsync(string token)
        {
            var otpDetails = await _otpRepository.FirstOrDefaultAsync(x => x.VirtualRealityOtpCode != null && x.VirtualRealityOtpCode.Equals(token.ToUpper()));
            if (otpDetails == null)
            {
                return null; // Otp is not present for this mailid.
            }
            DateTime generatedDateTime = (DateTime)otpDetails.VirtualRealityOtpCodeCreationTime;
            DateTime CompareTime = generatedDateTime.AddMinutes(_appAppsettings.VirtualAidOtpExpirationInMins);
            if (DateTime.Now < CompareTime)
            {
                return otpDetails.VirtualRealityOtpCode;
            }
            else
            {
                 return null;  //Otp time expired.
            }
        }

        /// <summary>
        /// Method is to get virtual reality otp by emailId.
        /// </summary>
        /// <param name="emailId">EmailId</param>
        /// <returns>Task.</returns>
        public async Task<string?> GetVirtualRealityOtpByEmailIdAsync(string emailId)
        {
            var otpDetails = await _otpRepository.FirstOrDefaultAsync(x => x.EmailId.Equals(emailId) && x.VirtualRealityOtpCode != null);
            if (otpDetails == null)
            {
                return null; // Otp is not present for this mailid.
            }
            DateTime generatedDateTime = (DateTime)otpDetails.VirtualRealityOtpCodeCreationTime;
            DateTime CompareTime = generatedDateTime.AddMinutes(_appAppsettings.VirtualAidOtpExpirationInMins);
            if (DateTime.Now < CompareTime)
            {
                return otpDetails.VirtualRealityOtpCode;
            }
            else
            {
                 return null;  //Otp time expired.
            }
        }
        
        /// <summary>
        /// Method to get details of the user from virtual reality token.
        /// </summary>
        /// <param name="token">Virtual reality token.</param>
        /// <returns>User details.</returns>
        public async Task<UserDetailsDto?> GetVirtualRealityUserDetailsByTokenAsync(string token)
        {
            Otp otpDetails = await _otpRepository.FirstOrDefaultAsync(x => x.VirtualRealityOtpCode != null && x.VirtualRealityOtpCode.Equals(token));
            if (otpDetails == null)
            {
                return null; // Otp is not present for this mailid.
            }
            DateTime generatedDateTime = (DateTime)otpDetails.VirtualRealityOtpCodeCreationTime;
            DateTime CompareTime = generatedDateTime.AddMinutes(_appAppsettings.VirtualAidOtpExpirationInMins);
            if (DateTime.Now < CompareTime)
            {
                UserDetail userDetails = await _userRepository.FirstOrDefaultAsync(x => x.Email == otpDetails.EmailId);
                if (userDetails == null)
                {
                    throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
                }
                return _mapper.Map<UserDetailsDto>(userDetails);
            }
            else
            {
                 return null;  //Otp time expired.
            }
        }

        /// <summary>
        /// Method to generate alphanumberic otp
        /// </summary>
        /// <returns>otp.</returns>
        public async Task<string> GenerateAlphanumericOtp()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            StringBuilder stringBuilder = new StringBuilder();
            Random random = new Random();
            for (int i = 0; i < 6; i++)
            {
                stringBuilder.Append(chars[random.Next(chars.Length)]);
            }
            return stringBuilder.ToString().ToUpper();
        }

        /// <summary>
        /// Method to hash the otp.
        /// </summary>
        /// <param name="otp">Otp.</param>
        /// <returns>Hashed otp.</returns>
        public async Task<string> HashOtpAsync(string otp)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(otp));
                StringBuilder stringBuilder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    stringBuilder.Append(bytes[i].ToString("x2"));
                }
                return stringBuilder.ToString();
            }
        }

        /// <summary>
        /// Method to verify hashed otp.
        /// </summary>
        /// <param name="enteredOtp">Entered otp.</param>
        /// <param name="hashedOtp">Hashed otp.</param>
        /// <returns>True, if matched otherwise false.</returns>
        public async Task<bool> VerifyEnteredOtp(string enteredOtp, string hashedOtp)
        {
            string hashedEnteredOtp = await HashOtpAsync(enteredOtp); // Hash the entered OTP
            return hashedEnteredOtp.Equals(hashedOtp, StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Method is to get the role by email id.
        /// </summary>
        /// <param name="Email">Email.</param> 
        /// <returns>Task. Role.</returns>
        public async Task<string?> GetRoleByEmailAsync(string Email)
        {
            Company companyDetails= await _companyRepository.FirstOrDefaultAsync(x => x.Email == Email);
            UserDetail userDetils = await _userRepository.FirstOrDefaultAsync(x => x.Email == Email);
            if (companyDetails == null && userDetils == null) {
                throw new UserFriendlyException(_localizer["EamilIdNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            if (companyDetails != null && (!companyDetails.IsLocked))
            {
                return "Company";
            }
            else
            {
                
                if(userDetils != null && (!userDetils.IsLocked))
                {
                    UserDetailRoleMapping userRoleDestails = await _userRoleRepository.FirstOrDefaultAsync(x => x.UserId == userDetils.Id); 
                    Role roledetails = await _roleRepository.FirstOrDefaultAsync(x => x.Id == userRoleDestails.RoleId);
                    if(roledetails!=null)
                        return roledetails.Name;
                }
            }
            return null; //Acount is Lock.
        }

    }
}
