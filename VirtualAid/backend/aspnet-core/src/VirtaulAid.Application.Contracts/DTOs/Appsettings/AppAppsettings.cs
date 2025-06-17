namespace VirtaulAid.DTOs.Appsettings
{
    public class AppAppsettings
    {
        public string SelfUrl { get; set; }
        public string ClientUrl { get; set; }
        public string CorsOrigins { get; set; }
        public string RedirectAllowedUrls { get; set; }
        public int CourseExpirationInYears { get; set; }
        public int TokenExpirationInDays { get; set; }
        public int AdminReportInMonth { get; set; }
        public string PdfDownloadServerUrl { get; set; }
        public int VirtualAidOtpExpirationInMins { get; set; }
        public string VirtualRealitySystemLink { get; set; }
    }
}
