using System;
using Volo.Abp.Application.Dtos;

namespace VirtaulAid.DTOs.Company
{
    public class CompanyDto : AuditedEntityDto<Guid>
    {
        public string CompanyName { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string Postalcode { get; set; }
        public bool IsVerified { get; set; }
        public bool IsLocked { get; set; }
        public bool IsDeleted { get; set; }
        public string? ProfileImage { get; set; }
        public string? BannerImage { get; set; }
        public string? Slogan { get; set; }
        public string? Bio { get; set; }
        public int? NoOfEmployees { get; set; }
        public bool? PublishData { get; set; }
    }
}
