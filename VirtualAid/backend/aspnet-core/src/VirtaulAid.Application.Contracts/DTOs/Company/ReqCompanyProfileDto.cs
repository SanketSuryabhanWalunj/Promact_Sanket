using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.Company
{
    public class ReqCompanyProfileDto
    {
        public string CompanyName { get; set; }
        public string Email { get; set; }
        public string? ContactNumber { get; set; }
        public string? Slogan { get; set; }
        public string? Bio {  get; set; }
        public int? NoOfEmployees { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? Address3 { get; set; }
        public string? Country { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }
        public string? Postalcode { get; set; }
    }
}
