using System;
using System.Threading.Tasks;
using Amazon.SimpleSystemsManagement.Model;
using Amazon.SimpleSystemsManagement;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;
using Stripe;
using Amazon;
using Amazon.Extensions.NETCore.Setup;
using static Org.BouncyCastle.Math.EC.ECCurve;


namespace VirtaulAid;

public class Program
{
    public async static Task<int> Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
#if DEBUG
            .MinimumLevel.Debug()
#else
            .MinimumLevel.Information()
#endif
            .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
            .Enrich.FromLogContext()
            .WriteTo.Async(c => c.File("Logs/logs.txt"))
            .WriteTo.Async(c => c.Console())
            .CreateLogger();

        try
        {
            Log.Information("Starting VirtaulAid.HttpApi.Host.");
            var builder = WebApplication.CreateBuilder(args);

            builder.Host

             .ConfigureAppConfiguration((builder) =>
                {
                    
                    var enableSystemManager = Environment.GetEnvironmentVariable("enableSystemManager");

                    
                    if (enableSystemManager == null)
                    {
                        builder.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true).AddEnvironmentVariables();
                    }
                    else
                    {

                        builder.AddSystemsManager(configureSource =>
                        {
                            IConfiguration configuration = new ConfigurationBuilder()
                            .AddEnvironmentVariables()
                            .Build();

                            var currentRegion = Amazon.Util.EC2InstanceMetadata.Region;

                            Log.Information($"Log: Current region '{currentRegion}' ...");
                            var ssmConfig = new AmazonSimpleSystemsManagementConfig
                            {
                                RegionEndpoint = currentRegion // Replace with your region
                            };

                            configureSource.AwsOptions = new AWSOptions
                            {
                                Region = ssmConfig.RegionEndpoint
                            };

                            var runningDevEnvironment = configuration.GetValue<string>("RUNNING_ENVIRONMENT_DEV");
                            var runningStagingEnvironment = configuration.GetValue<string>("RUNNING_ENVIRONMENT_STAGING");
                            var runningProductionEnvironment = configuration.GetValue<string>("RUNNING_ENVIRONMENT_PRODUCTION");



                            if (runningDevEnvironment != null && runningStagingEnvironment == null && runningProductionEnvironment == null)
                            {
                                // Parameter Store prefix to pull configuration data from.
                                configureSource.Path = $"/{runningDevEnvironment}";
                                Console.WriteLine($"Console: Environment '{runningDevEnvironment}' is running as Dev...");
                                Log.Information($"Log: Environment '{runningDevEnvironment}' is running as Dev...");
                            }
                            else if (runningStagingEnvironment != null && runningDevEnvironment == null && runningProductionEnvironment == null)
                            {
                                // Parameter Store prefix to pull configuration data from.
                                configureSource.Path = $"/{runningStagingEnvironment}";
                                Console.WriteLine($"Console: Environment '{runningStagingEnvironment}' is running as Staging...");
                                Log.Information($"Log: Environment '{runningStagingEnvironment}' is running as Staging...");
                            }
                            else if (runningStagingEnvironment == null && runningDevEnvironment == null && runningProductionEnvironment != null)
                            {
                                // Parameter Store prefix to pull configuration data from.
                                configureSource.Path = $"/{runningProductionEnvironment}";
                                Console.WriteLine($"Console: Environment '{runningProductionEnvironment}' is running as Production...");
                                Log.Information($"Log: Environment '{runningProductionEnvironment}' is running as Production...");
                            }
                            else
                            {
                                Console.WriteLine($"Console: Neither Dev or prod, nor Staging environment is detected...");
                                Log.Information($"Log: Neither Dev or prod, nor Staging environment is detected...");
                            }


                            // Configure if the configuration data is optional.
                            configureSource.Optional = false;

                            configureSource.OnLoadException += exceptionContext =>
                            {
                                Console.WriteLine(exceptionContext.Exception.Message);
                                Log.Information($"Log: {exceptionContext.Exception.Message}");
                            };

                        });
                    }
                })
             

                .UseAutofac()
                .UseSerilog();
                builder.Services.AddHealthChecks();          

            await builder.AddApplicationAsync<VirtaulAidHttpApiHostModule>();
            StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];
            
            var app = builder.Build();
            app.MapHealthChecks("/healthz");
            await app.InitializeApplicationAsync();
            await app.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            if (ex is HostAbortedException)
            {
                throw;
            }

            Log.Fatal(ex, "Host terminated unexpectedly!");
            return 1;
        }
        finally
        {
            Log.CloseAndFlush();
        }
    }
}
