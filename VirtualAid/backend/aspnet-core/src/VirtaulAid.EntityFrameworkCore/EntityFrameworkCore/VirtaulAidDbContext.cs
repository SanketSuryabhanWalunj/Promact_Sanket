using Microsoft.EntityFrameworkCore;
using VirtaulAid.Carts;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.Employee;
using VirtaulAid.Exams;
using VirtaulAid.Otps;
using VirtaulAid.Purchases;
using VirtaulAid.Roles;
using VirtaulAid.Users;
using VirtaulAid.Feedbacks;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace VirtaulAid.EntityFrameworkCore;

[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ConnectionStringName("Default")]
public class VirtaulAidDbContext :
    AbpDbContext<VirtaulAidDbContext>,
    IIdentityDbContext,
    ITenantManagementDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }

    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    // VirtualAid Module.
    public DbSet<UserDetail> UserDetails { get; set; }
    public DbSet<Role> RoleDetails { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<CourseTranslation> CourseTranslations { get; set; }
    public DbSet<UserCourseCompanyMapping> UserCourseCompanyMappings { get; set; }
    public DbSet<UserDetailRoleMapping> UserDetailRoleMappings { get; set; }
    public DbSet<Otp> Otps { get; set; }
    public DbSet<Module> Modules { get; set; }
    public DbSet<ModuleTranslation> ModuleTranslations { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<LessonTranslation> LessonTranslations { get; set; }
    public DbSet<Content> Contents { get; set; }
    public DbSet<ContentTranslation> ContentTranslations { get; set; }
    public DbSet<Section> Sections { get; set; }
    public DbSet<SectionTranslation> SectionTranslations { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CourseTypePrice> CourseTypePrices { get; set; }
    public DbSet<PurchaseDetail> PurchaseDetails { get; set; }
    public DbSet<TerminatedEmployee> TerminatedEmployees { get; set; }
    public DbSet<CourseSubscriptionMapping> CourseSubscriptionMappings { get; set; }
    public DbSet<UserCourseEnrollments> UserCourseEnrollments { get; set; }
    public DbSet<ExamDetail> ExamDetails { get; set; }
    public DbSet<ExamDetailTranslation> ExamDetailTranslations { get; set; }

    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionTranslation> QuestionTranslations { get; set; }
    public DbSet<QuestionOption> QuestionOptions { get; set; }
    public DbSet<QuestionOptionTranslation> QuestionOptionTranslations { get; set; }
    public DbSet<ExamResult> ExamResults { get; set; }
    public DbSet<LoggedInUser> LoggedInUsers { get; set; }
    public DbSet<CustomCourseRequest> CustomCourseRequests { get; set; }
    public DbSet<LiveExamDetails> LiveExamDetails { get; set; }
    public DbSet<Feedback> Feedbacks { get; set; }

    #endregion

    public VirtaulAidDbContext(DbContextOptions<VirtaulAidDbContext> options)
        : base(options)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        /* Configure your own tables/entities inside here */

        //builder.Entity<YourEntity>(b =>
        //{
        //    b.ToTable(VirtaulAidConsts.DbTablePrefix + "YourEntities", VirtaulAidConsts.DbSchema);
        //    b.ConfigureByConvention(); //auto configure for the base class props
        //    //...
        //});

        builder.Entity<CourseTranslation>(b =>
        {
            b.ToTable("CourseTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.CourseId, x.Language });
        });

        builder.Entity<ModuleTranslation>(b =>
        {
            b.ToTable("ModuleTranslations"); 
            b.ConfigureByConvention();
            b.HasKey(x => new { x.ModuleId, x.Language });
        });

        builder.Entity<LessonTranslation>(b =>
        {
            b.ToTable("LessonTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.LessonId, x.Language });
        });

        builder.Entity<ContentTranslation>(b =>
        {
            b.ToTable("ContentTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.ContentId, x.Language });
        });

        builder.Entity<SectionTranslation>(b =>
        {
            b.ToTable("SectionTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.SectionId, x.Language });
        });

        builder.Entity<ExamDetailTranslation>(b =>
        {
            b.ToTable("ExamDetailTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.ExamDetailId, x.Language });
        });

        builder.Entity<QuestionTranslation>(b =>
        {
            b.ToTable("QuestionTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.QuestionId, x.Language });
        });

        builder.Entity<QuestionOptionTranslation>(b =>
        {
            b.ToTable("QuestionOptionTranslations");
            b.ConfigureByConvention();
            b.HasKey(x => new { x.QuestionOptionId, x.Language });
        });
    }
}
