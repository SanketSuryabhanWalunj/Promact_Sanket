using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.Exams;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Services;

namespace VirtaulAid.DomainServices
{
    public class ExamDomainService : DomainService
    {
        private readonly IRepository<ExamDetail> _examDetailRepository;
        private readonly CourseDomainService _courseDomainService;
        private readonly IRepository<ExamResult> _resultRepository;
        private readonly IRepository<Question> _questionRepository;

        public ExamDomainService(
            IRepository<ExamDetail> examDetailRepository,
            CourseDomainService courseDomainService,
            IRepository<ExamResult> resultRepository,
            IRepository<Question> questionRepository
            )
        {
            _examDetailRepository = examDetailRepository;
            _courseDomainService = courseDomainService;
            _resultRepository = resultRepository;
            _questionRepository = questionRepository;
        }

        /// <summary>
        /// Methos is to genrate the percentage of exam.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="examDetailId">exam id for question count.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>Percentage in float string.</returns>
        public async Task<string> GetExamPercentageAsync(Guid userId, int examDetailId, string examType)
        {
            ExamDetail examDetails = await _examDetailRepository.FirstAsync(x => x.Id == examDetailId);
            Users.UserCourseEnrollments userCourseEnrollmentDetails = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId.ToString(), examDetails.CourseId.ToString(), examType);

            List<Question> questionList = await _questionRepository.GetListAsync(e => e.ExamDetailId == examDetailId);
            int resultDetails = await _resultRepository.
                CountAsync(x => questionList.Select(q => q.Id).Contains(x.QuestionId) && x.UserId == userId && x.CourseEnrollmentId == userCourseEnrollmentDetails.Id && x.IsOptionCorrect);

            if (resultDetails == 0)
                return "0";

            float percentage = ((float)resultDetails / (float)examDetails.NoOfQuestions) * 100;
            return percentage <= 100 ? percentage.ToString("0.00") : "100";
        }
    }
}
