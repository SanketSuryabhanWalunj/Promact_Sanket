using System.Collections.Generic;

namespace VirtaulAid.DTOs.AdminReport
{
    public class ResAdminReportdto
    {
        public List<ResMonthCountDto> CertifiedEmployee { get ; set; }
        public List<ResMonthCountDto> CoursePurchased { get ; set; }
        public List<ResMonthCountDto> EmployeeHistoryList{ get ; set; }
    }
}
