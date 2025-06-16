using System.ComponentModel.DataAnnotations;

namespace LakePulse.DTOs.DataPartner
{
    #region Request DTOs
    /// <summary>
    /// DTO for creating a new data partner.
    /// </summary>
    public class CreateDataPartnerRequestDto
    {
        [Required]
        public int LakePulseId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? Participation { get; set; }
    }

    /// <summary>
    /// DTO for updating an existing data partner.
    /// </summary>
    public class UpdateDataPartnerRequestDto
    {
        [Required]
        public Guid Id { get; set; }
        [Required]
        public int LakePulseId { get; set; }
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? Participation { get; set; }
    }
    #endregion

    #region Response DTOs
    /// <summary>
    /// DTO for data partner response.
    /// </summary>
    public class DataPartnerResponseDto
    {
        public Guid Id { get; set; }
        public int LakePulseId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? Participation { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedTime { get; set; }
        public string LastUpdatedBy { get; set; } = string.Empty;
        public DateTime? LastUpdatedTime { get; set; }
    }

    /// <summary>
    /// DTO for paginated data partner response.
    /// </summary>
    public class PaginatedDataPartnerResponseDto
    {
        public List<DataPartnerResponseDto> DataPartners { get; set; } = new();
        public int TotalCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
    #endregion
} 