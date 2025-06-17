namespace AITrainer.AITrainer.Util
{
    public static class CalculateEndDate
    {
        public static DateTime EndDate(DateTime startDate, int durationInDays, List<string> workingDays)
        {
            DateTime endDate = startDate;

            while (durationInDays > 1)
            {
                endDate = endDate.AddDays(1);

                if (workingDays.Contains(endDate.DayOfWeek.ToString()))
                {
                    durationInDays--;
                }

            }

            return endDate;
        }

    }
}
