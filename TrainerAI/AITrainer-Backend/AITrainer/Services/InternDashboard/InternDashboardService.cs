using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Interdashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AITrainer.Services.InternDashboard
{
    public class InternDashboardService : IInternDashboardService
    {
        private readonly IInterndashboardRepository _interndashboardRepository;

        public InternDashboardService(IInterndashboardRepository interndashboardRepository)
        {
            _interndashboardRepository = interndashboardRepository;
        }


        /// <summary>
        /// Starts a daily task to update internship statuses at a specific time each day.
        /// </summary>
        /// <param name="update">The specific time of day to run the task</param>
        public async Task StartDailyTask(TimeSpan update)
        {
            await Task.Delay(5000); // Initial delay before starting the task

            while (true) // Run indefinitely until canceled
            {
                var cancellationTokenSource = new CancellationTokenSource();
                var cancellationToken = cancellationTokenSource.Token;

                var specificTime = update; // Specific time for the task
                var delay = GetDelayUntilNextOccurrence(specificTime);

                while (!cancellationToken.IsCancellationRequested)
                {
                    // Check and update internship statuses
                    await UpdateInternshipStatus();

                    // Delay until the next day
                    await Task.Delay(TimeSpan.FromDays(1), cancellationToken);
                }
            }
        }


        /// <summary>
        /// Updates the status of active internships based on their end dates.
        /// </summary>
        private async Task UpdateInternshipStatus()
        {
            var activeInternships = await _interndashboardRepository.getActiveInternships();
            DateTime currentDate = DateTime.UtcNow;

            foreach (var internship in activeInternships)
            {
                var workingDays = await _interndashboardRepository.GetWorkingDays(internship.InternId);
                var duration = _interndashboardRepository.Duration(internship.CourseId);
                var internLeaveDetails = (await _interndashboardRepository.GetLeaveDetails(internship.InternId)).ToList();
                var endDate = CalculateDate(internship.StartDate, duration, workingDays, internLeaveDetails);

                if (endDate.Date < currentDate.Date)
                {
                    internship.Status = false;
                    await _interndashboardRepository.UpdateInternshipStatus(internship);
                }
            }
        }


        /// <summary>
        /// Calculates the delay until the next occurrence of a specific time.
        /// </summary>
        /// <param name="specificTime">The specific time of occurrence</param>
        /// <returns>The time span representing the delay until the next occurrence</returns>
        private TimeSpan GetDelayUntilNextOccurrence(TimeSpan specificTime)
        {
            DateTime now = DateTime.Now;
            DateTime nextOccurrence = now.Date.Add(specificTime);

            if (nextOccurrence <= now)
            {
                nextOccurrence = nextOccurrence.AddDays(1); // Move to the next day
            }

            TimeSpan delay = nextOccurrence - now;
            return delay;
        }


        /// <summary>
        /// Calculates the end date based on the start date, duration, working days, and intern leave details.
        /// </summary>
        /// <param name="startDate">The start date of the internship</param>
        /// <param name="durationInDays">The duration of the internship in days</param>
        /// <param name="workingDays">The list of working days</param>
        /// <param name="internLeaveDetails">The list of leave details for the intern</param>
        /// <returns>The calculated end date of the internship</returns>
        private static DateTime CalculateDate(DateTime startDate, int durationInDays, List<string> workingDays, List<DateTime> internLeaveDetails)
        {
            DateTime endDate = startDate;

            while (durationInDays > 1)
            {
                endDate = endDate.AddDays(1);

                if (internLeaveDetails.Contains(endDate.Date))
                {
                    durationInDays++;
                }

                if (workingDays.Contains(endDate.DayOfWeek.ToString()))
                {
                    durationInDays--;
                }
            }

            return endDate;
        }
    }
}
