using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using VirtaulAid.Courses;
using Volo.Abp.Domain.Entities.Auditing;

namespace VirtaulAid.Users
{
    public class UserCourseEnrollments : AuditedAggregateRoot<int>
    {
        public Guid UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual UserDetail User { get; set; }
        public int CourseSubscriptionId { get; set; }
        [ForeignKey("CourseSubscriptionId")]
        public virtual CourseSubscriptionMapping CourseSubscriptionMapping { get; set; }
        public DateTime EnrolledDate { get; set; }
        public DateTime CourseStartDate { get; set; }
        public DateTime CourseEndDate { get; set; }
        public List<Guid> ListOfExamConductedModules { get; set; } = new List<Guid>();
        public bool Expired { get; set; } = false;

        // It include progress with all previous module and current module progress.
        public double Progress { get; set; } = 0;
        public Guid? CurrentModuleId { get; set; }

        // It will include all previous lessons progress excluding current lesson. 
        public double CurrentModulePorgress { get; set; }
        public Guid? CurrentLessonId { get; set; }

        /// <summary>
        /// This status is for the online exam, True = online exam is done by user.
        /// </summary>
        public bool IsExamConducted { get; set; }

        /// <summary>
        /// This staus is for online course completed status true or false.
        /// </summary>
        public bool IsCompleted { get; set; }

        /// <summary>
        /// This is purchased course type i.e. Online, VR, Live.
        /// </summary>
        public string? ExamType { get; set; }

        /// <summary>
        /// This is the Live exam date proposed by user.
        /// </summary>
        public DateTime? LiveExamDate { get; set; }

        /// <summary>
        /// This is for Live exam date (proposed by user) is accepted by admin or not.
        /// </summary>
        public bool? IsLiveExamDateApproved { get; set; }

        /// <summary>
        /// This is to store the live exam date approved date for history purpose.
        /// </summary>
        public DateTime? LiveExamDateApprovedDate { get; set; }

        /// <summary>
        /// This is live exam markes.
        /// </summary>
        public double? LiveExamMarkes { get; set; }

        /// <summary>
        /// This is shows the live exam is completed or not.
        /// </summary>
        public bool? IsLiveExamCompleted { get; set; }

        /// <summary>
        /// This is course expire date for the history purpose.
        /// </summary>
        public DateTime ExpirationDate { get; set; }

        /// <summary>
        /// Certificate expire date for the validity of certificate.
        /// </summary>
        public DateTime? CertificateExpirationDate { get; set; }
    }
}
