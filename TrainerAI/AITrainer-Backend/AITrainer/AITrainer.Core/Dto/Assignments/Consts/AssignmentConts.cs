namespace AITrainer.AITrainer.Core.Dto.Assignments.Consts;

public static class AssignmentConts
{
    public static string createCourseAssignmentPrompt(string courseName, double days, double marks, string topics)
    {
        return $"I need assistance in generating an assignment for {courseName} course the assignment " +
               $"duration should be for {days} days and {marks} marks. We are currently focusing on the topic of {topics}" +
               $" and I want to create an evidence-based assignment for our trainees. " +
               "Please generate an assignment in the following format:\r\n{\r\n\t\"AssignmentTitle\": \"\",\r\n\t\"" +
               "Course\": \"\",\r\n\t\"Topic\": \"\",\r\n\t\"Objective\": \"\",\r\n\t\"Instructions\":" +
               " [\r\n\t\t{\r\n\t\t\tpart:0,\r\n\t\t\tnote:\"\"\r\n\t\t}\r\n\t],\r\n\t\"GradingCriteria\": " +
               "[\r\n\t\t{\r\n\t\t\tpart:0,\r\n\t\t\tpercentage:10%\r\n\t\t}\r\n\t]\r\n}\r\n" +
               "The assignment should be designed to help our trainees gain a practical understanding " +
               "of the topic and encourage active learning and the application of knowledge. It " +
               "should include clear objectives, step-by-step instructions, and grading criteria " +
               "for evaluating their performance. Your help in creating a well-structured assignment would be " +
               "greatly appreciated. Thank you!";
    }
    public static string createAssignmentPrompt(string courseName, double days, double marks, string topics)
    {
        return $"I need assistance in generating an assignment for {courseName} course the assignment " +
               $"duration should be for {days} days and {marks} marks. We are currently focusing on the topic of {topics}" +
               $"and I want to create one evidence-based assignment for our trainees while implementing the assignment all the topic should be covered." +
               "Please generate an assignment in the following format:\r\n{\r\n\t\"AssignmentTitle\": \"\",\r\n\t\"" +
               "Course\": \"\",\r\n\t\"Topic\": \"\",\r\n\t\"Objective\": \"\",\r\n\t\"Instructions\":" +
               " [\r\n\t\t{\r\n\t\t\tpart:0,\r\n\t\t\tnote:\"\"\r\n\t\t}\r\n\t],\r\n\t\"GradingCriteria\": " +
               "[\r\n\t\t{\r\n\t\t\tpart:0,\r\n\t\t\tpercentage:10%\r\n\t\t}\r\n\t]\r\n}\r\n" +
               "The assignment should be designed to help our trainees gain a practical understanding " +
               "of the topic and encourage active learning and the application of knowledge. It " +
               "should include clear objectives, step-by-step instructions, and grading criteria " +
               "for evaluating their performance. Your help in creating a well-structured assignment would be " +
               "greatly appreciated. Thank you!";
    }

    public static string systemPrompt(string courseName)
    {
        return $"You are Course generator AI, and you have to generate the assignment content for {courseName} course";
    }
}
