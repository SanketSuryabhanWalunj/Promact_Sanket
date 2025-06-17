using System;
using System.Collections.Generic;
using System.Text;

namespace VirtaulAid.DTOs.User
{
    public class ResUserProfileDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Bio { get; set; }
        public string Designation { get; set; }
        public string ContactNumber { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string Address3 { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string City { get; set; }
        public string Postalcode { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool PublishData { get; set; }
        public string BannerImage { get; set; }
        public string ProfileImage { get; set; }
    }
}
