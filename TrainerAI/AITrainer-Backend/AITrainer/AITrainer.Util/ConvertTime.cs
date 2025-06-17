using static System.Net.Mime.MediaTypeNames;

namespace AITrainer.AITrainer.Util
{
    public static class ConvertTime
    {
        public static DateTime LocalToUtc(DateTime date)
        {
            DateTime utcStartDate = TimeZoneInfo.ConvertTimeToUtc(date);
            return utcStartDate;
        }

        public static DateTime AddTimeZone(DateTime date)
        {
            string timeZoneId = "Eastern Standard Time";

            // 2. Get the TimeZoneInfo object for the desired time zone
            TimeZoneInfo timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            // 3. Create a DateTime in the desired time zone
            DateTime dateTimeInTimeZone = TimeZoneInfo.ConvertTime(date, timeZone);
            return dateTimeInTimeZone;
        }

        public static DateTime UtcToLocal (DateTime date)
        {
            DateTime localStartDate = TimeZoneInfo.ConvertTimeFromUtc(date, TimeZoneInfo.Local);
            return localStartDate;
        }

    }
}
