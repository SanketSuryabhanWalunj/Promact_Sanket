namespace AITrainer.AITrainer.Core.Dto.OpenAiApi
{
    public class OpenAiDto
    {
        public class userModel
        {
            public string role { get; set; }
            public string content { get; set; }
        }
        public class request
        {
            public string model { get; set; }
            public List<userModel> messages { get; set; }
            public double temperature { get; set; }
            public int max_tokens { get; set; }
        }

        public class GeneratedTopicsDto
        {
            public string courseTitle { get; set; }
            public List<GeneratedTopicDto> list { get; set; }
        }

        public class GeneratedTopicDto
        {
            public int? week { get; set; } // Make it nullable to handle both day and week responses
            public int? day { get; set; } // Make it nullable to handle both day and week responses
            public List<string> topic_list { get; set; }
        }

        public class QuizResponseDto
        {
            public List<QuizDto> quiz { get; set; }
        }

        public class QuizDto
        {
            public string question { get; set; }
            public string option1 { get; set; }
            public string option2 { get; set; }
            public string option3 { get; set; }
            public string option4 { get; set; }
            public string answer { get; set; }
        }
    }
}
