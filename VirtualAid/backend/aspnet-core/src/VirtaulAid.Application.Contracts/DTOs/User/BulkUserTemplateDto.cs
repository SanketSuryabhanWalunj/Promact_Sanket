﻿using System.ComponentModel.DataAnnotations;

namespace VirtaulAid.DTOs.User
{
    public class BulkUserTemplateDto
    {

        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string ContactNumber { get; set; }
    }
}
