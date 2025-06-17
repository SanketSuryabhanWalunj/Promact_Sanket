using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Services
{
    public class VirtualRealityService: ApplicationService
    {
        private readonly VirtualRealityDomainService _virtualRealityDomainService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public VirtualRealityService(VirtualRealityDomainService virtualRealityDomainService, IHttpContextAccessor httpContextAccessor)
        {
            _virtualRealityDomainService = virtualRealityDomainService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Method to get auth info based on token.
        /// </summary>
        /// <returns>Details of available VR sections/lessons.</returns>
        [HttpGet("api/vr/auth")]
        public async Task<VRAuthInfoDto> GetVirtualRealityAuthInfoAsync()
        {

            // Get the token from the request header
            string token = _httpContextAccessor.HttpContext.Request.Headers["Authorization"];

            VRAuthInfoDto vrAuthInfoDto = await _virtualRealityDomainService.GetAuthenticationInfoAsync(token);
            return vrAuthInfoDto;
        }
        
        /// <summary>
        /// Method to update complete VR section details.
        /// </summary>
        /// <param name="completeVRSectionDto">VR section details.</param>
        /// <returns>Task.</returns>
        [HttpPost("api/vr/complete")]
        public async Task CompleteVRSectionAsync(VirtualRealityCompletedModuleDto completeVRSectionDto)
        {

            // Get the token from the request header
            string token = _httpContextAccessor.HttpContext.Request.Headers["Authorization"];

            await _virtualRealityDomainService.CompleteVirtualRealityModuleAsync(completeVRSectionDto, token);
        }
    }
}
