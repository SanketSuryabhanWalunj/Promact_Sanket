namespace AITrainer.Services.OpenAiServices
{
    public interface IOpenAiService
    {
        Task<string> GetOpenAiResponse(string systemPrompt,string requestPrompt);
    }
}
