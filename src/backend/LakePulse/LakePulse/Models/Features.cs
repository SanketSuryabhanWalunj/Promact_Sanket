using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LakePulse.Models
{
    [Table("features")]
    public class Features
    {
        [Key]
        public string feature_id { get; set; }
        public string? category { get; set; }
        public int? order_in_category { get; set; }
        public string? label { get; set; }
        public string? units { get; set; }
        public string? data_type { get; set; }
        public string? data_source { get; set; }
        public string? measurement_characteristic_id { get; set; }
        public string? field_id { get; set; }
        public int? editable { get; set; }
        public double? lower_limit { get; set; }
        public double? upper_limit { get; set; }
        public char? bound_type { get; set; }
        public double? lower_bound { get; set; }
        public double? upper_bound { get; set; }
        public string? allowed_categories { get; set; }
        public int? text_max_length { get; set; }
        public int? decimal_rounding { get; set; }
        public string? description { get; set; }

    }
}
