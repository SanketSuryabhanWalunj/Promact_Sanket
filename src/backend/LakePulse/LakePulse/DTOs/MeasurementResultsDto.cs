using System.ComponentModel.DataAnnotations;

namespace LakePulse.DTOs
{
    public class MeasurementResultsDto
    {
        [Required]
        public int lakeId { get; set; }
        [Required]
        public int pageNumber { get; set; }
        [Required]
        public int pageSize { get; set; }
        public List<KeyValueDto<string>>? filters { get; set; }
        public List<KeyValueDto<string>>? sortColumns { get; set; }

    }
}
