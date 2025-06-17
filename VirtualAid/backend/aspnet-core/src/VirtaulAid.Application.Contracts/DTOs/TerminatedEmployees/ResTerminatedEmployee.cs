using System;

namespace VirtaulAid.DTOs.TerminatedEmployees
{
    public class ResTerminatedEmployee
    {
        public Guid Id { get; set; }
        public Guid CompanyId { get; set; }
        public Guid UserId { get; set; }
        public DateTime TerminationDate { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeEmail { get; set; }
    }
}
