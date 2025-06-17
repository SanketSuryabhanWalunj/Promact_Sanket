using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.User;

namespace VirtaulAid.DTOs.LiveExam
{
    public class ResLiveExamPendingReqDto
    {
        public UserCourseEnrollmentDto UserCourseEnrollments { get; set; }
        public ResCourseDetailDto CourseDetail { get; set; }
    }
}
