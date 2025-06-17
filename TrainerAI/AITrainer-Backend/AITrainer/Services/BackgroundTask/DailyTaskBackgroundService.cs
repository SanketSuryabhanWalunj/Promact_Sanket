using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Interdashboard;
using AITrainer.Services.InternDashboard;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AITrainer.Services.BackgroundTask
{
    public class DailyTaskBackgroundService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly IServiceProvider _services;
        private bool isTaskRunning = false;

        public DailyTaskBackgroundService(IServiceProvider services)
        {
            _services = services;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // Resolve the scoped service within the context of a scope
                using (var scope = _services.CreateScope())
                {
                    var scopedService = scope.ServiceProvider.GetRequiredService<IInternDashboardService>();
                    //var updationTime = DateTime.Now.TimeOfDay;
                    DateTime now = DateTime.Now;
                    Console.WriteLine(now);
                    DateTime currentTime = new DateTime(now.Year, now.Month, now.Day, now.Hour, now.Minute, now.Second).ToLocalTime();
                    //TimeSpan updationTime = new TimeSpan(12, 0, 0);
                    TimeSpan updationTime = new TimeSpan(18, 03, 0); // 3:30 PM

                    Console.WriteLine(updationTime);

                    try
                    {
                        // Await the StartDailyTask method
                        await scopedService.StartDailyTask(updationTime);
                    }
                    catch (Exception ex)
                    {
                        // Handle any exceptions that might occur
                        Console.WriteLine($"Error in DailyTaskBackgroundService: {ex.Message}");
                    }
                }

                // Wait for 5 minutes before starting the task again
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}
