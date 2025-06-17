using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Quizes
{
    public class QuizQuestyDto
    {
        public string TestName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? Duration { get; set; }
        public string QuestionOrder { get; set; }
        public string OptionOrder { get; set; }
        public double CorrectMarks { get; set; }
        public double IncorrectMarks { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; }
        public string TimeZoneDetails { get; set; }
        public List<QuestionFormat> questionACs { get; set; }
    }
    public class QuestionFormat
    {
        public QuestionDetails Question { get; set; }
        public SingleMultipleAnswerQuestion SingleMultipleAnswerQuestion { get; set; }
    }

    public class QuestionDetails
    {
        public string QuestionDetail { get; set; }
    }


    public class SingleMultipleAnswerQuestion
    {
        public List<AnswerOption> SingleMultipleAnswerQuestionOption { get; set; }
    }

    public class AnswerOption
    {
        public string Option { get; set; }
        public bool IsAnswer { get; set; }
    }
    public class GetQuizDto
    {
        public string TopicId { get; set; }
    }
    public class QuizQuestyResponseDto
    {
        public double scoreAchieved { get; set; }
        public double percentage { get; set; }
        public List<SingleMultipleQuestionAC> singleMultipleQuestionACs { get; set; }
        public List<answeredOptionACs> answeredOptionACs { get; set; }
    }

    public class answeredOptionACs
    {
        public string answeredOption { get; set; }
        public string questionId { get; set; }
    }

    public class SingleMultipleQuestionAC
    {
        public string questionDetail { get; set; }
        public List<SingleMultipleAnswerQuestionOption> singleMultipleAnswerQuestionOption { get; set; }
    }
    public class SingleMultipleAnswerQuestionOption
    {
        public string singleMultipleAnswerQuestionID { get; set; }
        public string option { get; set; }
        public bool isAnswer { get; set; }
        public string id { get; set; } 

    }
    public class QuizResponsewithLink
    {
        public string link { get; set; }
        public string topics { get; set; }
    }
}
