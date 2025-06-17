using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using LakePulse.Data;
using LakePulse.Services.User;
using LakePulse.Services.Lake;
using LakePulse.Services.Common;
using LakePulse.Middleware;
using System.Net;
using Newtonsoft.Json;
using LakePulse.Services.Characteristic;
using LakePulse.Services.Cache;
using LakePulse.Services.FieldNotes;
using Amazon.Extensions.NETCore.Setup;
using Amazon;
using LakePulse.Services.SuperAdmin;
using Amazon.CognitoIdentityProvider;
using Amazon.Runtime;
using System.Security.Claims;
using LakePulse.Services.Subscription;
using LakePulse.Services.FeatureData;
using LakePulse.Data.SeedData;
using LakePulse.Services.Toolbox;
using LakePulse.Services.Log;
using Amazon.S3;
using LakePulse.Services.AmazonS3;
using LakePulse.Services.DataSource;
using LakePulse.Services.Alert;
using LakePulse.Services.Boathouse;
using LakePulse.Boathouse.Email;
using LakePulse.Services.Email;
using Hangfire;
using LakePulse.Services.DataPartner;
using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

var parameterStorePath = builder.Configuration["ParameterStore:Path"];

if (parameterStorePath != "local" && parameterStorePath != null)
{
    builder.Configuration.AddSystemsManager(source =>
    {
        source.Path = parameterStorePath;
        source.Optional = true;
        source.ReloadAfter = TimeSpan.FromMinutes(5);
        source.AwsOptions = new AWSOptions
        {
            Region = RegionEndpoint.GetBySystemName(builder.Configuration["AWS:Region"])
        };
    });
}
else
{
    // Use appsettings.json (already loaded by default)
    builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
    builder.Configuration.AddJsonFile(string.Format("appsettings.{0}.json", builder.Environment.EnvironmentName), optional: true, reloadOnChange: true);
}

// Add cache services to the container.
builder.Services.AddMemoryCache();

// Register AWS services
builder.Services.AddAWSService<IAmazonCognitoIdentityProvider>(new Amazon.Extensions.NETCore.Setup.AWSOptions
{
    Credentials = new BasicAWSCredentials(builder.Configuration["AWS:AccessKey"], builder.Configuration["AWS:SecretKey"]),
    Region = RegionEndpoint.GetBySystemName(builder.Configuration["AWS:Region"]) // e.g., "us-east-1"
});

// Add services to the container.
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ILakeService, LakeService>();
builder.Services.AddScoped<ICommonService, CommonService>();
builder.Services.AddScoped<ICharacteristicService, CharacteristicService>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<IFieldNoteService, FieldNoteService>();
builder.Services.AddScoped<ISuperAdminService, SuperAdminService>();
builder.Services.AddScoped<ILakeSubscriptionService, LakeSubscriptionService>();
builder.Services.AddHostedService<StartupService>();
builder.Services.AddScoped<IFeaturesDataService, FeaturesDataService>();
builder.Services.AddScoped<IToolboxService, ToolboxService>();
builder.Services.AddScoped<IBoathouseService, BoathouseService>();
builder.Services.AddScoped<IDataLogService, DataLogService>();
builder.Services.AddAWSService<IAmazonS3>();
builder.Services.AddScoped<IS3Service, S3Service>();
builder.Services.AddScoped<IDataSourceService, DataSourceService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddHangfire(config => config.UseInMemoryStorage());
builder.Services.AddHangfireServer();
builder.Services.AddScoped<DataSourceAlertService>();
builder.Services.AddScoped<IDataPartnerService, DataPartnerService>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add logging configuration
builder.Logging.ClearProviders(); // Clear default providers (optional)
builder.Logging.AddConsole();     // Add Console Logger
builder.Logging.AddDebug();       // Add Debug Logger (useful during development)
builder.Logging.AddEventSourceLogger(); // For advanced diagnostics

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgresConnection")));
builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddLogging();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Adding Auth 
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        string? region = builder.Configuration["AWS:Region"];
        string? userPoolId = builder.Configuration["AWS:UserPoolId"];
        string? audience = builder.Configuration["AWS:ClientId"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = $"https://cognito-idp.{region}.amazonaws.com/{userPoolId}",
            ValidAudience = audience,
            IssuerSigningKeyResolver = (s, securityToken, identifier, parameters) =>
            {
                // get JsonWebKeySet from AWS
                var json = new WebClient().DownloadString(parameters.ValidIssuer + "/.well-known/jwks.json");
                // serialize the result
                var keys = JsonConvert.DeserializeObject<JsonWebKeySet>(json).Keys;
                // cast the result to be the type expected by IssuerSigningKeyResolver
                return (IEnumerable<SecurityKey>)keys;
            },
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                if (claimsIdentity != null)
                {
                    var roleClaim = claimsIdentity.FindFirst("role")?.Value;
                    if (!string.IsNullOrEmpty(roleClaim))
                    {
                        // Add role claims to the identity
                        claimsIdentity.AddClaim(new Claim(ClaimTypes.Role, roleClaim));
                    }
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                return Task.CompletedTask;
            }
        };
    });

// Add swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Lake Pulse API", Version = "v1", Description = "API for Lake Pulse application" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Add CORS services
string[]? allowedOrigins = builder.Configuration.GetSection("App:AllowedOrigins").Get<string[]>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins(allowedOrigins) // Use origins from configuration
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetIsOriginAllowed(origin => true)
              .AllowCredentials();
    });
});

// Add response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.AddAuthorization();

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

// Adding exception middleware for all controller.
app.UseMiddleware<ExceptionHandlingMiddleware>();

//Adding swagger UI
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Lake Pulse API v1"));

app.UseHangfireDashboard();
// Schedule Recurring Job (e.g., send email every day at 12AM)
RecurringJob.AddOrUpdate<DataSourceAlertService>(
     "daily-email-job",
    service => service.CheckAndNotifyDataSourceChangesAsync(),
    "0 0 * * *" // Cron for 12:00 AM daily
);

// Use response compression only for specific paths
app.UseWhen(context => context.Request.Path.Equals("/api/lake/all-lakes-lat-long", StringComparison.OrdinalIgnoreCase),
    appBuilder =>
    {
        appBuilder.UseResponseCompression();
    });

//app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.UseCors("AllowSpecificOrigins");

app.MapControllers();

app.Run();

