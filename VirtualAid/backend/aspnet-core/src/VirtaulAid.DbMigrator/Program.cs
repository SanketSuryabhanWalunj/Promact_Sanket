using System;
using System.Threading.Tasks;
using Amazon.Extensions.NETCore.Setup;
using Amazon.SimpleSystemsManagement;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;

namespace VirtaulAid.DbMigrator;

class Program
{
    static async Task Main(string[] args)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Volo.Abp", LogEventLevel.Warning)
#if DEBUG
                .MinimumLevel.Override("VirtaulAid", LogEventLevel.Debug)
#else
                .MinimumLevel.Override("VirtaulAid", LogEventLevel.Information)
#endif
                .Enrich.FromLogContext()
            .WriteTo.Async(c => c.File("Logs/logs.txt"))
            .WriteTo.Async(c => c.Console())
            .CreateLogger();

        await CreateHostBuilder(args).RunConsoleAsync();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)

             .ConfigureAppConfiguration((hostingContext, builder) =>
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
                                configureSource.Path = $"/{runningDevEnvironment}";
                                Console.WriteLine($"Console: Environment '{runningDevEnvironment}' is running as Dev...");
                                Log.Information($"Log: Environment '{runningDevEnvironment}' is running as Dev...");
                            }
                            else if (runningStagingEnvironment != null && runningDevEnvironment == null && runningProductionEnvironment == null)
                            {
                                configureSource.Path = $"/{runningStagingEnvironment}";
                                Console.WriteLine($"Console: Environment '{runningStagingEnvironment}' is running as Staging...");
                                Log.Information($"Log: Environment '{runningStagingEnvironment}' is running as Staging...");
                            }
                            else if (runningStagingEnvironment == null && runningDevEnvironment == null && runningProductionEnvironment != null)
                            {
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

            .ConfigureLogging((context, logging) => logging.ClearProviders())
            .ConfigureServices((hostContext, services) =>
            {
                services.AddHostedService<DbMigratorHostedService>();
            });
}
