using System.Text;

namespace AITrainer.AITrainer.Core.Dto.Internship.Const
{
    public class InternshipFeedbackConst
    {
        public static string systemOverallPrompt()
        {
            return "We are an organization actively hiring interns after examining their internship performance. We have certain parameters based on which we will finalize the intern who is performing as per our expectations. We will provide feedback on assignment performance, daily journal reports, improvement areas, intern acknowledgments, final mentor feedback after a certain interval, and behavioural feedback." +
                "\r\n\r\nHere is the explanation of the provided data:  " +
                "\r\n\r\nAssignment feedback: We provide courses on a tech stack with assignments and quizzes. This feedback evaluates those assignments.  " +
                "\r\n\r\nDaily report journal feedback and improvement areas: The daily journal tracks the intern's course progress. Interns fill out a daily update, which we evaluate using OpenAI. We provide feedback on the journal and areas for improvement, along with a rating. " +
                "\r\n\r\nIntern acknowledgment: After receiving feedback, we expect acknowledgment from the intern. Active communication with the mentor is a good practice. Note (Check whether the intern acknowledged all feedback or not).  " +
                "\r\n\r\nFinal mentor feedback after a certain interval: After an interval, a senior mentor evaluates feedback from previous assignments and provides feedback. Note (This is important feedback that should be carefully considered when creating the overall feedback) (This feedback will come from a general type).  " +
                "\r\n\r\nBehavioural feedback: We have developed a set of questions for analyzing intern behaviour, along with marks and any additional feedback.  " +
                "\r\n\r\nWe are an organization that believes the individuals we hire should demonstrate good professionalism, acknowledgment, and behaviour. Interns should effectively understand the tech and not pass evaluations through cheating or any other means.   " +
                "\r\n\r\nBased on the data provided to you generate the overall feedback of intern and give response in the JSON format, JSON format will be like below:\n" +
                "\r\n{\\r\\n\\\"BehaviourPerformance\\\": \\\"\"\\r\\n,\\r\\n \\\"TechnicalPerformance\\\": \\\"\"\\r\\n,\\r\\n \\\"RightFit\\\": \\\"Yes/No and reason\"\\r\\n,\\r\\n \\\"DetailedFeedback\\\": \\\"\"\\r\\n \\r\\n} \r\n " +
                "\r\n\r\nHere is the explanation of Above output: " +
                "\r\n\r\nBehavioural Performance: Evaluate the intern's behaviour throughout the entire internship process in detail.  " +
                "\r\n\r\nTechnical Performance: Evaluate the intern's technical skills throughout the entire internship process in detail. " +
                "\r\n\r\nRight fit:Assess whether the intern is a suitable fit for the organization, mentioning reasons for suitability or lack thereof.  " +
                "\r\n\r\nDetailed Overall Feedback: Provide detailed feedback for the intern based on the evaluations mentioned above. \r\n\r\n ";
        }

        public static string generateOverallFeedbackPrompt(List<InternOverallFeedback> feedbackList)
        {
            StringBuilder formattedEntries = new StringBuilder();
            foreach (var feedback in feedbackList)
            {
                if (feedback.Type == "Assignment")
                {
                    string temp = $"Here is the feedback of {feedback.Type} for {feedback.CourseName} for {feedback.TopicName} topic:" +
                        $"{feedback.Feedback}\n" +
                        $"Score: {feedback.AssignmentReceivedMarks} / {feedback.AssignmentTotalMarks}";
                    formattedEntries.Append(temp);
                    formattedEntries.Append("\n");
                }
                else if (feedback.Type == "Journal")
                {
                    string temp = $"Here is the feedback of {feedback.Type} for {feedback.CourseName} for {feedback.TopicName} topic:" +
                        $"{feedback.Feedback}" +
                        $"Here is improvement area:" +
                        $"{feedback.ImprovementArea}\n" +
                        $"Rating:{feedback.JournalRating} / 10";
                    formattedEntries.Append(temp);
                    formattedEntries.Append("\n");
                }
                else if (feedback.Type == "General")
                {
                    string temp = $"Here is the acknowledgement or feedback for {feedback.CourseName} for {feedback.TopicName} topic" +
                        $"{feedback.Comment}";
                    formattedEntries.Append(temp);
                    formattedEntries.Append("\n");
                }
                else
                {

                    string temp = $"Here is the  behaviour feedback for {feedback.CourseName} for {feedback.TopicName} topic" +
                        $"Behaviour Feedback: {feedback.Feedback}" +
                        $"Marks: {feedback.BehaviouralScore} / {feedback.BehaviouralTotalScore}" +
                        $"Note:(ignore the @# %$)";
                    formattedEntries.Append(temp);
                    formattedEntries.Append("\n");
                }

            }
            return $"Here is the detail feedback an intern: {formattedEntries}";
        }
    }
}
