namespace LakePulse.DTOs.Alert
{
    public class PreferencesRequestDto
    {
        public string UserId { get; set; }
        public List<PreferencesIdValue>? LevelPreferences { get; set; }
        public List<PreferencesIdValue>? CategoriePreferences { get; set; }
        public bool IsSMSSelected { get; set; }
        public bool IsEmailSelected { get; set; } 
    }

    public class PreferencesIdValue
    {
        public int Id { get; set; }
        public bool IsSelected { get; set; } 
    }

}
