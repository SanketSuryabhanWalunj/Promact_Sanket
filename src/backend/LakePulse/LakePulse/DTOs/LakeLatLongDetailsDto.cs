using LakePulse.Data;

namespace LakePulse.DTOs
{
    public class LakeLatLongDetailsDto
    {
        public string A { get; set; } = StringConstant.lakePulseId;
        public string B { get; set; } = StringConstant.latitude;
        public string C { get; set; } = StringConstant.longitude;
        public string D { get; set; } = StringConstant.name;
        public int TotalLakeCount { get; set; }
        public List<LakeLatLongDto>? LakeDetailsList { get; set; }
    }

    public class LakeLatLongDto
    {
        public long A { get; set; } // a is represent for lakePulseId
        public double? B { get; set; } // b is represent for latitude
        public double? C { get; set; } // c is represent for longitude
        public string? D { get; set; } // D is represent for Name
    }

}
