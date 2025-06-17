using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Exam;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Interfaces
{
    public interface IExamService : ITransientDependency
    {
        /// <summary>
        /// Method is to add the exam details.
        /// </summary>
        /// <param name="reqExamDetailModel">Exam details dto present question number and course details etc. </param>
        /// <returns>ResExamDetailDto with its id.</returns>
        /// <exception cref="UserFriendlyException">Exam Exist.</exception>
        Task<ResExamDetailDto> AddExamDetailsAsync(ReqExamDetailDto reqExamDetailModel);

        /// <summary>
        /// Method is to update the exam details. 
        /// </summary>
        /// <param name="reqExamDetailModel">ReqExamDetailDto presents updated values.</param>
        /// <returns>Task ResExamDetailDto retuen the updated value.</returns>
        /// <exception cref="UserFriendlyException">ExamNotExist.</exception>
        Task<ResExamDetailDto> UpdateExamDetailsAsync(ReqExamDetailDto reqExamDetailModel);

        /// <summary>
        /// Method is for get the exam details by course.
        /// </summary>
        /// <param name="courseId">Course id.</param>
        /// <returns>Task ResExamDetailDto.</returns>
        /// <exception cref="UserFriendlyException">ExamNotExist.</exception>
        Task<ResExamDetailDto> GetExamDetailsAsync(Guid courseId, string culture);

        /// <summary>
        /// Method to get exam details by exam details id.
        /// </summary>
        /// <param name="examDetailId">Id of the exam.</param>
        /// <returns>Details of the exam.</returns>
        Task<ResExamDetailDto> GetExamDetailsByIdAsync(int examDetailId, string culture);

        /// <summary>
        /// Methid is to get the exam details with the particular codule of course.
        /// </summary>
        /// <param name="courseId">Course Id.</param>
        /// <param name="moduleId">Module id that we want to get the exam details.</param>
        /// <returns>Exam details of perticular module.</returns>
        /// <exception cref="UserFriendlyException">Exam Details not exist.</exception>
        Task<ResExamDetailDto> GetExamDetailsByCourseModuleAsync(Guid courseId, Guid moduleId, string cuture);

        /// <summary>
        /// Method is for getting the all exam details list.
        /// </summary>
        /// <returns>Task list of ResExamDetailDto.</returns>
        Task<List<ResExamDetailDto>> GetExamDetailListAsync(string culture);

        /// <summary>
        /// Method is for delete the exam details.
        /// </summary>
        /// <param name="examDetailId">examDetail Id to be deleted.</param>
        /// <returns>Task string message.</returns>
        Task<string> DeleteExamDetailsAsync(int examDetailId);

        /// <summary>
        /// Method is for adding the exam questions with options.
        /// </summary>
        /// <param name="reqQuestionDto">reqQuestionDto with all details.</param>
        /// <returns>Task inserted question details in ResQuestionDto.</returns>
        Task<ResQuestionDto> AddQuestionAsync(ReqQuestionDto reqQuestionDto);

        /// <summary>
        /// Method is to update the question and its option.
        /// </summary>
        /// <param name="reqUpdateModel">reqUpdateModel with updated values.</param>
        /// <returns>Task string message.</returns>
        /// <exception cref="UserFriendlyException">QuestionNotExist.</exception>
        Task<string> UpdateQuestionAsync(ReqUpdateQuestionDto reqUpdateModel);

        /// <summary>
        /// Method is to get question list by examdetail id.
        /// </summary>
        /// <param name="examDetailId">exam detail id.</param>
        /// <returns>Task list of ResQuestionDto.</returns>
        Task<List<ResQuestionDto>> GetQuestionListAsync(int examDetailId, string culture);

        /// <summary>
        /// Method is to get the question with options.
        /// </summary>
        /// <param name="questionId">Question id.</param>
        /// <returns>Question details in ResQuestionDto.</returns>
        /// <exception cref="UserFriendlyException">QuestionNotExist.</exception>
        Task<ResQuestionDto> GetQuestionAsync(int questionId, string culture);

        /// <summary>
        /// Method is to delete the question.
        /// </summary>
        /// <param name="questionId">Question id.</param>
        /// <returns>Task string message.</returns>
        /// <exception cref="UserFriendlyException">QuestionNotExist.</exception>
        Task<string> DeleteQuestionAsync(int questionId);

        /// <summary>
        /// Method is for start the exam.
        /// </summary>
        /// <param name="examDetailId">Exam id.</param>
        /// <param name="userId">User id.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>List of questions in ResExamQuestionDto.</returns>
        Task<ResStartExamDto> StartExamAsync(int examDetailId, string userId, string examType, string culture);

        /// <summary>
        /// Method is to save the exam amswer and update the progress.
        /// </summary>
        /// <param name="reqExamResultDtos">list of answer in reqExamResultDto.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>Task.</returns>
        Task SaveAnswerAsync(List<ReqExamResultDto> reqExamResultDtos, string examType);

        /// <summary>
        /// Methos is to genrate the percentage of exam.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="examDetailId">Exam details id for question count.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>Percentage in float string.</returns>
        Task<string> GetExamPercentageAsync(Guid userId, int examDetailId, string examType);

        /// <summary>
        /// Method to get questions for particular module exam.
        /// </summary>
        /// <param name="moduleId">id of the module whose exam is to be conducted</param>
        /// <param name="examDetailsId">course exam details id</param>
        /// <param name="userId">id of the user</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>object which has questions and time for the exam</returns>
        /// <exception cref="UserFriendlyException">throws exception is exam details are wrong or user id is wrong or the course is not assigned to user</exception>
        Task<ResStartExamDto> GetQuestionsForParticularModuleAsync(Guid moduleId, int examDetailsId, string userId, string examType, string culture);
    }
}
