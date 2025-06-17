using System.Collections.Generic;

namespace VirtaulAid.DTOs.AdminReport
{
    public class ResYearlyReportDto
    {
        public int TotalCount { get; set; }
        public List<ResMonthCountDto> MonthCountList { get; set; }
    }
}
