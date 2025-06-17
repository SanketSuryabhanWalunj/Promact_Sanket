using AITrainer.AITrainer.DomainModel.Models;
using NPOI.POIFS.Crypt.Dsig;
using static Mysqlx.Notice.Warning.Types;
using ZstdSharp.Unsafe;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AITrainer.AITrainer.Util
{
    public static class EmailSubjects
    {
        public static string InternshipInvitationToProjectManager = "Invitation of {0} for Internship";

        public static string InternshipInvitationSubject = "Invitation to the Promact Internship Program!";

        public static string PasswordResetSubject = "Password Reset Request";

        public static string CreatePasswordSubject = "Welcome to the Promact Internship Program!";

        public static string InternshipStartSubject(string courseName)
        {
            return $"Invitation to \"{courseName}\"";
        }
        public static string InternshipEndSubjectForIntern(string courseName)
        {
            return $"Urgent: Complete \"{courseName}\" Course by Tomorrow";
        }
        public static string InternshipEndSubjectForMentors(string courseName)
        {
            return $"Urgent: Course Completion and Review Assignments for \"{courseName}\"";
        }
        public static string InternshipSubmissionSubject(string internFirstName, string courseName)
        {
            return $"Internship Submission of “{internFirstName}” for \"{courseName}\"";
        }
        public static string InternshipFeedbackSubject(string courseName)
        {
            return $"Feedback and Score Published for \" {courseName}\"";
        }
        public static string InternshipBehaviourFeedbackSubject(string courseName)
        {
            return $"Behaviour Feedback Published for \" {courseName}\"";
        }
        public static string InternshipAcknowledgementSubject(string acknowledgedByName, string courseName)
        {
            return $"Feedback from \"{acknowledgedByName}\" for \" {courseName}\"";
        }
        public static string InternshipFinalReminderSubject(string courseName)
        {
            return $"Urgent: Deadline for Assignments Reviewing for \"{courseName}\"";
        }
        public static string LeaveRequestSubject(DateTime leaveStartDate, DateTime? leaveEndDate, string internFirstName, string? internLastName)
        {
            return $"{internFirstName}{internLastName} raised a leave request for {leaveStartDate.ToString("MMM dd, yyyy")} - {leaveEndDate?.ToString("MMM dd, yyyy")}";
        }
        public static string LeaveRequestDeletionSubject(DateTime leaveStartDate, DateTime? leaveEndDate, string internFirstName, string? internLastName)
        {
            return $"{internFirstName}{internLastName} deleted a leave request for {leaveStartDate.ToString("MMM dd, yyyy")} - {leaveEndDate?.ToString("MMM dd, yyyy")}";
        }
        public static string LeaveApproveRejectSubject(DateTime leaveStartDate, DateTime? leaveEndDate, string status)
        {
            return $"Your Leave request for {leaveStartDate.ToString("MMM dd, yyyy")} - {leaveEndDate?.ToString("MMM dd, yyyy")} has been {status}.";
        }
        public static string RequestPunchSubject(string internFirstName, string internLastName, DateTime punchDate)
        {
            return $"{internFirstName}{internLastName} has requested punch for {punchDate.ToString("MMM dd, yyyy")}";
        }
        public static string RequestPunchDeletionSubject(string internFirstName, string internLastName, DateTime punchDate)
        {
            return $"{internFirstName}{internLastName} deleted a punch request for {punchDate.ToString("MMM dd, yyyy")}";
        }
        public static string RequestPunchApproveRejectSubject(string status, DateTime punchDate)
        {
            return $"Your Attendance for {punchDate.ToString("MMM dd, yyyy")} has been {status}.";
        }

    }
}
