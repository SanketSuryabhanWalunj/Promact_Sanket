using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using AITrainer.AITrainer.DomainModel.Models;
using System.Numerics;
using System.Reflection.Metadata;
using System.Text.Json;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AITrainer.AITrainer.Core.Dto.JournalFeedbacks.Consts
{
    public class JournalFeedbackConst
    {
        public static string generateJournalFeedbackPrompt(string internFeedback, string Topic)
        {
            var formattedEntries = new List<string>();

            var jsonData = JsonSerializer.Deserialize<List<OptionDataDto>>(internFeedback);

           var formattedStrings = new List<string>();
            var formattedOutputs = new List<string>();

            for (int i = 0; i < jsonData.Count; i++)
            {
                string formattedString = $"{i + 1}.{jsonData[i].TopicName} = {jsonData[i].Description}";
                formattedStrings.Add(formattedString);
            }


            for (int i = 0; i < jsonData.Count; i++)
            {
                string formattedOutput = $"{i + 1}.{jsonData[i].TopicName} = {jsonData[i].Notes}";
                formattedOutputs.Add(formattedOutput);
            }

            string formattedDescription = string.Join(",\n", formattedStrings);
            string formattedNotes = string.Join(",\n", formattedOutputs);

            return $"Please provide a detailed evaluation for the intern's journal on the topics ${Topic} Rate each topic out of 10, and identify areas for improvement. The submitted journal contains the following tasks:\n" +
                   $"{formattedDescription}\n" +
                   "And intern submited below journal\n" +
                   $"{formattedNotes}\n" +
                   "Intern must have submitted valid contains\n" +
                   "You need Provide strictly feedback, improvements and rating based on the submitted journal if journal is not valid still you have to provide related evaluation and give response in the JSON format, JSON format will be like below.\n" +
                   "\\r\\n{\\r\\n\\\"topicList\\\": [\\r\\n{\\r\\n\\\"topic\\\": \\\"\\\",\\r\\n      \\\"rate\\\": 0.0\\r\\n    }\\r\\n  ],\\r\\n  \\\"feedback\\\": \\\"\"\\r\\n,\\r\\n  \\\"improvements\\\": \\\"\"\\r\\n,\\r\\n  \\\"rating\\\": 0\\r\\n}\r\n" +
                   "Do not include '`' in the response";
        }
        public static string systemPrompt()
        {
            return "You are mentor and you can evaluate interns";
        }
    }
}
