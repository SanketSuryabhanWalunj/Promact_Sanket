namespace AITrainer.Services.InternDashboard
{
    public interface IInternDashboardService
    {
        Task StartDailyTask(TimeSpan update);
    }
}
