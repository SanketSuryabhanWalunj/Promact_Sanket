using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Text;

namespace AITrainer.Services.OpenAiServices
{
    public class OpenAiService : IOpenAiService
    {
        private readonly HttpClient _httpClient = new();
        string apiUrl = "";
        private readonly IConfiguration _configuration;

        public OpenAiService(IConfiguration configuration)
        {
            _configuration = configuration;
            InitializeHttpClient();
        }

        private void InitializeHttpClient()
        {
            string apiKey = _configuration["OpenAI:ApiKey"];
            apiUrl = _configuration["OpenAI:ApiUrl"];
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
        }

        /// <summary>
        /// Gets a response from the OpenAI API.
        /// </summary>
        /// <param name="systemPrompt">The system prompt for the API request.</param>
        /// <param name="requestPrompt">The user request prompt for the API request.</param>
        /// <returns>The response from the OpenAI API.</returns>
        public async Task<string> GetOpenAiResponse(string systemPrompt, string requestPrompt)
        {
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                temperature = 0,
                messages = new[]
                {
                    new { role = "system", content = systemPrompt },
                    new { role = "user", content = requestPrompt },
                }
            };

            var jsonContent = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(apiUrl, jsonContent);
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();

            var jsonObject = JObject.Parse(responseBody);
            var assistantResponse = jsonObject["choices"][0]["message"]["content"].ToString();
            return assistantResponse;
        }
    }
}
