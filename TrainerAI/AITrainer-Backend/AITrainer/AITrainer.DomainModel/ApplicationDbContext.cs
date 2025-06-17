using AITrainer.AITrainer.DomainModel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace AITrainer.AITrainer.DomainModel
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) :
            base(options)
        {

        }
        public DbSet<Intern> Intern { get; set; }
        public DbSet<Internship> Internship { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Quiz> Quiz { get; set; }
        public DbSet<Topic> Topics { get; set; }
        public DbSet<Journal> Journals { get; set; }
        public DbSet<JournalTemplate> JournalTemplate { get; set; }
        public DbSet<ChatGptInteraction> chatGptInteractions { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<Admin> Admin { get; set; }
        public DbSet<AssignmentSubmission> AssignmentSubmissions { get; set; }
        public DbSet<JournalFeedback> JournalFeedbacks { get; set; }
        public DbSet<Batch> Batch { get; set; }
        public DbSet<AssignmentFeedback> AssignmentFeedbacks { get; set; }
        public DbSet<LeaveApplication> LeaveApplications { get; set; }
        public DbSet<QuizSubmission> QuizSubmissions { get; set; }
        public DbSet<GeneralInternshipFeedback> GeneralInternshipFeedbacks { get; set; }
        public DbSet<BehaviourTemplate> BehaviourTemplates { get; set; }
        public DbSet<BehaviourCategory> BehaviourCategories { get; set; }
        public DbSet<TechStack> TechStacks { get; set; }
        public DbSet<CareerPath> CareerPaths { get; set; }
        public DbSet<OverallFeedback> OverallFeedbacks { get; set; }
        public DbSet<DocumentAttachment> Attachments { get; set; }
        public DbSet<BugsFeedback> BugsFeedbacks { get; set; }
        public DbSet<LeaveDocumentAttachment> LeaveAttachments { get; set; }
        public DbSet<PunchRecord> PunchRecords { get; set; }
        public DbSet<PunchLogTime> PunchLogTimes { get; set; }
        public DbSet<PunchRecordRequests> PunchRecordRequests { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<ApplicationUser>()
                .Property(e => e.FirstName)
                .HasMaxLength(250);

            builder.Entity<ApplicationUser>()
                .Property(e => e.LastName)
                .HasMaxLength(250);

            builder.Entity<ApplicationUser>()
                 .Property(e => e.isDeleted)
                 .HasMaxLength(10);

            builder.Entity<ApplicationUser>()
                 .Property(e => e.CreatedDate)
                 .HasMaxLength(100);

            builder.Entity<Intern>().ToTable("Intern");
            builder.Entity<Course>().ToTable("Course");
            builder.Entity<Internship>().ToTable("Internship");
            builder.Entity<Topic>().ToTable("Topic");
            builder.Entity<Quiz>().ToTable("Quiz");
            builder.Entity<Journal>().ToTable("Journal");
            builder.Entity<JournalTemplate>().ToTable("JournalTemplate");
            builder.Entity<Assignment>().ToTable("Assignment");
            builder.Entity<Organization>().ToTable("Organization");
            builder.Entity<Admin>().ToTable("Admin");
            builder.Entity<AssignmentSubmission>().ToTable("AssignmentSubmissions");
            builder.Entity<Batch>().ToTable("Batch");
            builder.Entity<AssignmentFeedback>().ToTable("AssignmentFeedback");
            builder.Entity<LeaveApplication>().ToTable("LeaveApplications");
            builder.Entity<QuizSubmission>().ToTable("QuizSubmissions");
            builder.Entity<BehaviourTemplate>().ToTable("BehaviourTemplates");
            builder.Entity<BehaviourCategory>().ToTable("BehaviourCategories");

            builder.Entity<Intern>()
            .HasOne(i => i.User)
            .WithMany()
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Course>()
            .HasOne(i => i.JournalTemplate)
            .WithMany()
            .HasForeignKey(i => i.JournalTemplate_Id)
            .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Topic>()
                .HasOne(i => i.Course)
                .WithMany()
                .HasForeignKey(i => i.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Quiz>()
               .HasOne(i => i.Topic)
               .WithMany()
               .HasForeignKey(i => i.TopicId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Journal>()
                .HasOne(i => i.Internship)
                .WithMany()
                .HasForeignKey(i => i.Internship_Id)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Journal>()
              .HasOne(i => i.Intern)
              .WithMany()
              .HasForeignKey(i => i.Intern_Id)
              .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Journal>()
              .HasOne(i => i.Topic)
              .WithMany()
              .HasForeignKey(i => i.Topic_Id)
              .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Assignment>()
                .HasOne(i => i.Topic)
                .WithMany()
                .HasForeignKey(i => i.TopicId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AssignmentSubmission>()
                .HasOne(i => i.Assignment)
                .WithMany()
                .HasForeignKey(i => i.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AssignmentSubmission>()
                .HasOne(i => i.Internship)
                .WithMany()
                .HasForeignKey(i => i.InternshipId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AssignmentSubmission>()
                .HasOne(i => i.Topic)
                .WithMany()
                .HasForeignKey(i => i.TopicId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Admin>()
                  .HasOne(i => i.User)
                  .WithMany()
                  .HasForeignKey(i => i.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Admin>()
               .HasOne(i => i.Organization)
               .WithMany()
               .HasForeignKey(i => i.OrganizationId)
               .OnDelete(DeleteBehavior.Cascade);


            //builder.Entity<Internship>()
            //    .HasOne(i => i.Mentor)
            //    .WithMany()
            //    .HasForeignKey(i => i.MentorId)
            //    .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AssignmentFeedback>()
                .HasOne(i => i.Reviewer)
                .WithMany()
                .HasForeignKey(i => i.ReviewerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AssignmentFeedback>()
                .HasOne(i => i.AssignmentSubmission)
                .WithMany()
                .HasForeignKey(i => i.SubmitedAssgnimentId)
                .OnDelete(DeleteBehavior.Cascade);

           builder.Entity<Admin>()
            .HasMany(a => a.ProjectManagers)
            .WithMany() 
            .UsingEntity(j => j.ToTable("AdminProjectManagers"));

            builder.Entity<Admin>()
                .HasOne(a => a.CareerPath)
                .WithMany()
                .HasForeignKey(a => a.CareerPathId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<DocumentAttachment>()
                .HasOne(a => a.BugsFeedback)
                .WithMany(b => b.Attachments)
                .HasForeignKey(a => a.BugsFeedbackId);

            builder.Entity<LeaveDocumentAttachment>()
                .HasOne(a => a.leaveApplication)
                .WithMany(b => b.Attachments)
                .HasForeignKey(a => a.LeaveApplicationId);

            builder.Entity<Intern>()
                .HasOne(i => i.CareerPath)
                .WithMany()
                .HasForeignKey(i => i.CareerPathId)
                .OnDelete(DeleteBehavior.SetNull);

            base.OnModelCreating(builder);


        }

    }
}
