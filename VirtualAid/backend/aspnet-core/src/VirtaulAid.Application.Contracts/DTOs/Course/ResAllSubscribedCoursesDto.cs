namespace VirtaulAid.DTOs.Course
{
    public class ResAllSubscribedCoursesDto
    {
        public string Name { get; set; }
        public int TotalNoOfHours { get; set; }
        public int NoOfModules { get; set; }
        public string ShortDescription { get; set; }
        public double Price { get; set; }
        public string PurchaseDate { get; set; }
        public string ExpirationDate { get; set; }
    }
}
