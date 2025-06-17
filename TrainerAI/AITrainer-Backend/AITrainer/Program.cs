using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.SuperAdmin;
using AITrainer.AITrainer.Repository.Courses;
using AITrainer.AITrainer.Repository.Interns;
using AITrainer.AITrainer.Repository.Quizes;
using AITrainer.AITrainer.Repository.Topics;
using AITrainer.AITrainer.Repository.User;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Filters;
using System.Text;
using AITrainer.AITrainer.Repository.Internships;
using AITrainer.AITrainer.Repository.Journals;
using AITrainer.AITrainer.Repository.JournalTemplates;
using AITrainer.AITrainer.Repository.Assignments;
using AITrainer.Services.Assignements;
using AITrainer.AITrainer.Repository.Organizations;
using AITrainer.AITrainer.Repository.Interdashboard;
using AITrainer.AITrainer.Repository.JournalFeedbacks;
using AITrainer.Services.JournalFeedbacks;
using AITrainer.Services.OpenAiServices;
using AITrainer.AITrainer.Repository.Batches;
using AITrainer.AITrainer.Repository.AssignmentFeedbacks;
using AITrainer.Services.LeaveApplications;
using AITrainer.AITrainer.Repository.LeavesApplication;
using AITrainer.AITrainer.Repository.LeaveApplications;
using AITrainer.Services.InternDashboard;
using AITrainer.Services.BackgroundTask;
using AITrainer.Services.QuizService;
using System.IO.Compression;
using AITrainer.Services.BehaviouralTemplate;
using AITrainer.AITrainer.Repository.BehaviouralTemplate;
using AITrainer.Services.MentorDashboard;
using AITrainer.AITrainer.Repository.MentorDashboard;
using AITrainer.Services;
using AITrainer.AITrainer.Repository.TechStacks;
using AITrainer.AITrainer.Repository.CareerPaths;
using AITrainer.Services.BugsAndFeedback;
using AITrainer.AITrainer.Repository.BugsAndFeedback;
using AITrainer.AITrainer.Repository.Feedbacks;
using AITrainer.Services.Feedbacks;
using AITrainer.AITrainer.Util;
using AITrainer.AITrainer.Repository.PunchRecords;
using AITrainer.Services.PunchRecords;
using AITrainer.AITrainer.Repository.Holidays;
using AITrainer.Services.Holidays;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISuperAdminRepository, SuperAdminRepository>();
builder.Services.AddScoped<IInternRepository, InternRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<ITopicRepository, TopicRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<IInternshipRepository, InternshipRepository>();
builder.Services.AddScoped<IJournalRepository, JournalRepository>();
builder.Services.AddScoped<IJournalTemplateRepository, JournalTemplateRepository>();
builder.Services.AddScoped<ITopicRepository, TopicRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<IJournalFeedbackRepository, JournalFeedbackRepository>();
builder.Services.AddScoped<IJournalFeedbackAppService,JournalFeedbackAppService>();
builder.Services.AddScoped<IOpenAiService, OpenAiService>();
builder.Services.AddScoped<IAssignmentRepository, AssignmentRepository>();
builder.Services.AddScoped<IAssignmentAppService, AssignmentAppService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IInterndashboardRepository, InterndashboardRepository>();
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<IBatchRepository , BatchRepository>();
builder.Services.AddScoped<IAssignmentFeedbackRepository, AssignmentFeedbackRepository>();
builder.Services.AddScoped<ILeaveApplicationService, LeaveApplicationServices>();
builder.Services.AddScoped<ILeaveApplicationRepository, LeaveApplicationRepository>();
builder.Services.AddScoped<IInternDashboardService, InternDashboardService>();
builder.Services.AddScoped<IBehaviouralTemplateService, BehaviouralTemplateService>();
builder.Services.AddScoped<IBehaviouralTemplateRepository, BehaviouralTemplateRepository>();
builder.Services.AddScoped<IMentorDashboardService, MentorDashboardService>();
builder.Services.AddScoped<IMentorDashboardRepository, MentorDashboardRepository>();
builder.Services.AddScoped<ITechStackRepository, TechStackRepository>();
builder.Services.AddScoped<ICareerPathRepository, CareerPathRepository>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IBugsFeedbacksService, BugsFeedbacksService>();
builder.Services.AddScoped<IBugsFeedbacksRepository, BugsFeedbacksRepository>();
builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHostedService<NotificationService>();
builder.Services.AddHttpClient();
builder.Services.AddAutoMapper(typeof(Program));
builder.Services.AddScoped<IPunchRecordsRepository,PunchRecordsRepository>();
builder.Services.AddScoped<IPunchRecordService, PunchRecordService>();
builder.Services.AddScoped<IHolidaysRepository,HolidaysRepository>();
builder.Services.AddScoped<IHolidaysService, HolidaysService>();
builder.Services.AddScoped<SeedDatabase>();


builder.Services.Configure<DataProtectionTokenProviderOptions>(opt =>
   opt.TokenLifespan = TimeSpan.FromHours(2));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
        
});

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
}).AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://aitrainer.promactinfo.xyz", "https://dev-aitrainer.promactinfo.xyz", "http://109.122.200.16:8080")
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Description = "Doing Standard Authorization header using the Bearer Scheme (\"bearer{token}\")",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey

    });
    options.OperationFilter<SecurityRequirementsOperationFilter>();
});

builder.Services.AddHostedService<DailyTaskBackgroundService>();
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var serviceProvider = scope.ServiceProvider;
    try
    {
        var dbContext = serviceProvider.GetRequiredService<ApplicationDbContext>();
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error applying migrations: {ex.Message}");
    }
}

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<ApplicationDbContext>();
    var seedDatabase = services.GetRequiredService<SeedDatabase>();
    //Creating and Managing Roles
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    var roles = new[]
    {
        "SuperAdmin",
        "Admin",
        "Intern"
    };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
    }
    UserManager<ApplicationUser> userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
    string email = builder.Configuration["SuperAdmin:superAdminEmail"];
    string password = builder.Configuration["SuperAdmin:devPassword"];
    if (await userManager.FindByEmailAsync(email) == null)
    {
        ApplicationUser user = new ApplicationUser();
        user.UserName = email;
        user.Email = email;
        user.isDeleted = false;
        user.CreatedDate = DateTime.UtcNow;
        await userManager.CreateAsync(user, password);
        await userManager.AddToRoleAsync(user, "SuperAdmin");
    }
    await seedDatabase.Seed();
}
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseCors("AllowAll"); // Added for deployment purpose

app.MapControllers();

app.Run();
