using Amazon.Runtime;
using Amazon.S3;
using Amazon.SimpleEmail;
using DinkToPdf;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Text;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.EntityFrameworkCore;
using VirtaulAid.MultiTenancy;
using VirtaulAid.Permissions;
using VirtaulAid.Util;
using Volo.Abp;
using Volo.Abp.Account;
using Volo.Abp.Account.Web;
using Volo.Abp.AspNetCore.MultiTenancy;
using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.AspNetCore.Mvc.UI.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Basic;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Basic.Bundling;
using Volo.Abp.AspNetCore.Mvc.UI.Theme.Shared;
using Volo.Abp.AspNetCore.Serilog;
using Volo.Abp.Autofac;
using Volo.Abp.Localization;
using Volo.Abp.Modularity;
using Volo.Abp.Swashbuckle;
using Volo.Abp.UI.Navigation.Urls;
using Volo.Abp.Users;
using Volo.Abp.VirtualFileSystem;

namespace VirtaulAid;

[DependsOn(
    typeof(VirtaulAidHttpApiModule),
    typeof(AbpAutofacModule),
    typeof(AbpAspNetCoreMultiTenancyModule),
    typeof(VirtaulAidApplicationModule),
    typeof(VirtaulAidEntityFrameworkCoreModule),
    typeof(AbpAspNetCoreMvcUiBasicThemeModule),
    typeof(AbpAccountWebOpenIddictModule),
    typeof(AbpAspNetCoreSerilogModule),
    typeof(AbpSwashbuckleModule)
)]
public class VirtaulAidHttpApiHostModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        PreConfigure<OpenIddictBuilder>(builder =>
        {
            builder.AddValidation(options =>
            {
                options.AddAudiences("VirtaulAid");
                options.UseLocalServer();
                options.UseAspNetCore();
            });
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        context.Services.AddTransient<IConverter>(provider =>
        {
            // Create and return a new instance of SynchronizedConverter with PdfTools
            return new SynchronizedConverter(new PdfTools());
        });

        // First, remove the existing registration
        var existingDescriptor = context.Services.SingleOrDefault(
            d => d.ServiceType == typeof(ICurrentUser)
        );

        if (existingDescriptor != null)
        {
            context.Services.Remove(existingDescriptor);
        }

        // Then, register your custom service
        context.Services.AddTransient<ICurrentUser, CurrentUserService>();

        // configure services
        context.Services.Configure<AwsAppsettings>(configuration.GetSection("AWS"));
        context.Services.Configure<AppAppsettings>(configuration.GetSection("App"));
        context.Services.Configure<MailSettingsAppsettings>(configuration.GetSection("MailSettings"));
        context.Services.Configure<StripeAppsettings>(configuration.GetSection("Stripe"));
        // Load AWS credentials from appsettings.json.
        var awsOptions = configuration.GetAWSOptions("AWS");
        awsOptions.Credentials = new BasicAWSCredentials(configuration["AWS:AccessKey"], configuration["AWS:SecretKey"]);
        context.Services.AddDefaultAWSOptions(awsOptions);

        // Initialize the AWS client with your credentials.
        context.Services.AddAWSService<IAmazonSimpleEmailService>();
        // Register the Amazon S3 client implementation
        context.Services.AddAWSService<IAmazonS3>();

        ConfigureAuthentication(context);
        ConfigurePolicies(context);
        ConfigureBundles();
        ConfigureUrls(configuration);
        ConfigureConventionalControllers();
        ConfigureVirtualFileSystem(context);
        ConfigureCors(context, configuration);
        ConfigureSwaggerServices(context, configuration);
        ConfigureLocalization();
    }

    private void ConfigureAuthentication(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();

        //// Retrieve the JWT signing key from your configuration.
        var jwtKey = configuration["ApiAccessToken:ApiAccessTokenKey"];
        var issuer = configuration["ApiAccessToken:ApiAccessTokenIssuer"];
        var audience = configuration["ApiAccessToken:ApiAccessTokenAudience"];

        context.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false; // In a production environment, this should be true.
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // Configure the key used to validate the token's signature.
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF32.GetBytes(jwtKey)),
                    ValidateIssuer = true,
                    ValidIssuer = issuer, // Replace with the actual issuer.
                    ValidateAudience = true,
                    ValidAudience = audience, // Replace with the actual audience.
                    ValidateLifetime = true,
                    RoleClaimType = ClaimTypes.Role
                };
            });
    }
    private void ConfigurePolicies(ServiceConfigurationContext context)
    {
        context.Services.AddAuthorization(options =>
        {
            // User module policies
            options.AddPolicy(VirtaulAidPermissions.User.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin", "Governor");
            });
            options.AddPolicy(VirtaulAidPermissions.User.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.User.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.User.Delete, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Admin", "Super Admin");
            });

            // Company module policies
            options.AddPolicy(VirtaulAidPermissions.Company.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company","Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Company.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Company.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Company.Delete, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Admin", "Super Admin");
            });

            // Course module policies
            options.AddPolicy(VirtaulAidPermissions.Course.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin", "Governor");
            });
            options.AddPolicy(VirtaulAidPermissions.Course.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Course.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Course.Delete, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Admin", "Super Admin");
            });

            // Employee module policies
            options.AddPolicy(VirtaulAidPermissions.Employee.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Employee.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Employee.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Employee.Delete, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Admin", "Super Admin");
            });

            // Exam module policies
            options.AddPolicy(VirtaulAidPermissions.Exam.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual");
            });
            options.AddPolicy(VirtaulAidPermissions.Exam.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual");
            });
            options.AddPolicy(VirtaulAidPermissions.Exam.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual");
            });

            // Purchase module policies
            options.AddPolicy(VirtaulAidPermissions.Purchase.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Purchase.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin");
            });

            // Otp module policies
            options.AddPolicy(VirtaulAidPermissions.Otp.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin", "Governor");
            });
            options.AddPolicy(VirtaulAidPermissions.Otp.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin", "Governor");
            });

            // Cart module policies
            options.AddPolicy(VirtaulAidPermissions.Cart.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Cart.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Cart.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.Cart.Delete, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Company", "Individual", "Admin", "Super Admin");
            });

            // User enrollment module policies
            options.AddPolicy(VirtaulAidPermissions.UserEnrollment.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.UserEnrollment.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.UserEnrollment.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual");
            });

            // Course subscription module policies
            options.AddPolicy(VirtaulAidPermissions.CourseSubscription.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.CourseSubscription.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Company", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.CourseSubscription.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Admin", "Super Admin");
            });

            // Live Exam module policies
            options.AddPolicy(VirtaulAidPermissions.LiveExam.Default, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.LiveExam.Create, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.LiveExam.Edit, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Admin", "Super Admin");
            });
            options.AddPolicy(VirtaulAidPermissions.LiveExam.Delete, policy =>
            {
                policy.RequireClaim(ClaimTypes.Role, "Individual", "Admin", "Super Admin");
            });

        });

    }

    private void ConfigureBundles()
    {
        Configure<AbpBundlingOptions>(options =>
        {
            options.StyleBundles.Configure(
                BasicThemeBundles.Styles.Global,
                bundle =>
                {
                    bundle.AddFiles("/global-styles.css");
                }
            );
        });
    }

    private void ConfigureUrls(IConfiguration configuration)
    {
        Configure<AppUrlOptions>(options =>
        {
            options.Applications["MVC"].RootUrl = configuration["App:SelfUrl"];
            options.RedirectAllowedUrls.AddRange(configuration["App:RedirectAllowedUrls"]?.Split(',') ?? Array.Empty<string>());

            options.Applications["Angular"].RootUrl = configuration["App:ClientUrl"];
            options.Applications["Angular"].Urls[AccountUrlNames.PasswordReset] = "account/reset-password";
        });
    }

    private void ConfigureVirtualFileSystem(ServiceConfigurationContext context)
    {
        var hostingEnvironment = context.Services.GetHostingEnvironment();

        if (hostingEnvironment.IsDevelopment())
        {
            Configure<AbpVirtualFileSystemOptions>(options =>
            {
                options.FileSets.ReplaceEmbeddedByPhysical<VirtaulAidDomainSharedModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}VirtaulAid.Domain.Shared"));
                options.FileSets.ReplaceEmbeddedByPhysical<VirtaulAidDomainModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}VirtaulAid.Domain"));
                options.FileSets.ReplaceEmbeddedByPhysical<VirtaulAidApplicationContractsModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}VirtaulAid.Application.Contracts"));
                options.FileSets.ReplaceEmbeddedByPhysical<VirtaulAidApplicationModule>(
                    Path.Combine(hostingEnvironment.ContentRootPath,
                        $"..{Path.DirectorySeparatorChar}VirtaulAid.Application"));
            });
        }
    }

    private void ConfigureConventionalControllers()
    {
        Configure<AbpAspNetCoreMvcOptions>(options =>
        {
            options.ConventionalControllers.Create(typeof(VirtaulAidApplicationModule).Assembly);
        });
    }

    private static void ConfigureSwaggerServices(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddAbpSwaggerGen(
            options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "VirtaulAid API", Version = "v1" });

                options.DocInclusionPredicate((docName, description) => true);
                options.CustomSchemaIds(type => type.FullName);

                // This will hide default apis in swagger UI.
                options.HideAbpEndpoints();
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please insert token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "bearer"
                });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {    new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type= ReferenceType.SecurityScheme,
                                Id = "Bearer",

                            }
                        },
                        new String[]{}
                    }
                });
            });
    }

    private void ConfigureCors(ServiceConfigurationContext context, IConfiguration configuration)
    {
        context.Services.AddCors(options =>
        {
            options.AddDefaultPolicy(builder =>
            {
                builder
                    .WithOrigins(configuration["App:CorsOrigins"]?
                        .Split(",", StringSplitOptions.RemoveEmptyEntries)
                        .Select(o => o.RemovePostFix("/"))
                        .ToArray() ?? Array.Empty<string>())
                    .WithAbpExposedHeaders()
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });
    }

    private void ConfigureLocalization()
    {
        Configure<AbpLocalizationOptions>(options =>
        {
            options.Languages.Add(new LanguageInfo("ar", "ar", "العربية"));
            options.Languages.Add(new LanguageInfo("cs", "cs", "Čeština"));
            options.Languages.Add(new LanguageInfo("en", "en", "English"));
            options.Languages.Add(new LanguageInfo("en-GB", "en-GB", "English (UK)"));
            options.Languages.Add(new LanguageInfo("fi", "fi", "Finnish"));
            options.Languages.Add(new LanguageInfo("fr", "fr", "Français"));
            options.Languages.Add(new LanguageInfo("hi", "hi", "Hindi", "in"));
            options.Languages.Add(new LanguageInfo("is", "is", "Icelandic", "is"));
            options.Languages.Add(new LanguageInfo("it", "it", "Italiano", "it"));
            options.Languages.Add(new LanguageInfo("ro-RO", "ro-RO", "Română"));
            options.Languages.Add(new LanguageInfo("hu", "hu", "Magyar"));
            options.Languages.Add(new LanguageInfo("pt-BR", "pt-BR", "Português"));
            options.Languages.Add(new LanguageInfo("ru", "ru", "Русский"));
            options.Languages.Add(new LanguageInfo("sk", "sk", "Slovak"));
            options.Languages.Add(new LanguageInfo("tr", "tr", "Türkçe"));
            options.Languages.Add(new LanguageInfo("zh-Hans", "zh-Hans", "简体中文"));
            options.Languages.Add(new LanguageInfo("zh-Hant", "zh-Hant", "繁體中文"));
            options.Languages.Add(new LanguageInfo("de-DE", "de-DE", "Deutsch", "de"));
            options.Languages.Add(new LanguageInfo("de", "de", "German"));
            options.Languages.Add(new LanguageInfo("es", "es", "Español", "es"));
            options.Languages.Add(new LanguageInfo("he", "he", "עִברִית"));
            options.Languages.Add(new LanguageInfo("uk", "uk", "українська"));
            options.Languages.Add(new LanguageInfo("nl", "nl", "Dutch"));
        });
    }

    public override void OnApplicationInitialization(ApplicationInitializationContext context)
    {
        var app = context.GetApplicationBuilder();
        var env = context.GetEnvironment();

        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }

        app.UseAbpRequestLocalization();

        if (!env.IsDevelopment())
        {
            app.UseErrorPage();
        }

        app.UseCorrelationId();
        app.UseStaticFiles();
        app.UseRouting();
        app.UseCors();
        app.UseAuthentication();
        app.UseAbpOpenIddictValidation();

        if (MultiTenancyConsts.IsEnabled)
        {
            app.UseMultiTenancy();
        }

        app.UseUnitOfWork();
        app.UseAuthorization();

        app.UseSwagger();
        app.UseAbpSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "VirtaulAid API");

        });

        app.UseAuditing();
        app.UseAbpSerilogEnrichers();
        app.UseConfiguredEndpoints();
    }
}
