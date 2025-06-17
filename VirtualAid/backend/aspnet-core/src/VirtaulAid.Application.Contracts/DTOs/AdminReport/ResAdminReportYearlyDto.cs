using System.Collections.Generic;

namespace VirtaulAid.DTOs.AdminReport
{
    public class ResAdminReportYearlyDto
    {
        public ResUserPermissionDto UserPermission { get; set; }
        public ResYearlyReportDto UserList { get; set; }
        public ResYearlyReportDto CertifiedList { get; set; }
        public List<ResMonthCountDto> PurchaseList { get; set; }
    }
}
