using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using VirtaulAid.Courses;
using VirtaulAid.DomainServices;
using VirtaulAid.DTOs.Exam;
using VirtaulAid.Exams;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.MultilingualObjects;
using VirtaulAid.Permissions;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Individual")]
    public class ExamService : ApplicationService, IExamService
    {
        private readonly IRepository<ExamDetail> _examDetailRepository;
        private readonly IRepository<Question> _questionRepository;
        private readonly IRepository<QuestionOption> _optionRepository;
        private readonly IRepository<ExamResult> _resultRepository;
        private readonly CourseDomainService _courseDomainService;
        private readonly IRepository<Module> _moduleRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IMapper _mapper;
        private readonly MultiLingualObjectManager _multiLingualObjectManager;

        public ExamService(IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<ExamDetail> examDetailRepository,
            IMapper mapper,
            IRepository<Question> questionRepository,
            IRepository<QuestionOption> optionRepository,
            IRepository<ExamResult> resultRepository,
            CourseDomainService courseDomainService,
            IRepository<Module> moduleRepository,
            MultiLingualObjectManager multiLingualObjectManager)
        {
            _localizer = localizer;
            _examDetailRepository = examDetailRepository;
            _mapper = mapper;
            _questionRepository = questionRepository;
            _optionRepository = optionRepository;
            _resultRepository = resultRepository;
            _courseDomainService = courseDomainService;
            _moduleRepository = moduleRepository;
            _multiLingualObjectManager = multiLingualObjectManager;
        }

        /// <summary>
        /// Method is to add the exam details.
        /// </summary>
        /// <param name="reqExamDetailModel">Exam details dto present question number and course details etc. </param>
        /// <returns>ResExamDetailDto with its id.</returns>
        /// <exception cref="UserFriendlyException">Exam Exist.</exception>
        [Authorize(VirtaulAidPermissions.Exam.Create)]
        public async Task<ResExamDetailDto> AddExamDetailsAsync(ReqExamDetailDto reqExamDetailModel)
        {
            ExamDetail examDetailCheck = await _examDetailRepository.FirstOrDefaultAsync(x => x.CourseId == reqExamDetailModel.CourseId);
            if (examDetailCheck != null)
                throw new UserFriendlyException(_localizer["ExamExist"], StatusCodes.Status403Forbidden.ToString());

            ExamDetail resExamDetail = await _examDetailRepository.InsertAsync(_mapper.Map<ExamDetail>(reqExamDetailModel), true);
            return _mapper.Map<ResExamDetailDto>(resExamDetail);
        }

        /// <summary>
        /// Method is to update the exam details. 
        /// </summary>
        /// <param name="reqExamDetailModel">ReqExamDetailDto presents updated values.</param>
        /// <returns>Task ResExamDetailDto retuen the updated value.</returns>
        /// <exception cref="UserFriendlyException">ExamNotExist.</exception>
        [Authorize(VirtaulAidPermissions.Exam.Edit)]
        public async Task<ResExamDetailDto> UpdateExamDetailsAsync(ReqExamDetailDto reqExamDetailModel)
        {
            ExamDetail examDetail = await _examDetailRepository.FirstOrDefaultAsync(x => x.CourseId == reqExamDetailModel.CourseId);
            if (examDetail == null)
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());

            examDetail.NoOfQuestions = reqExamDetailModel.NoOfQuestions;
            examDetail.DurationTime = reqExamDetailModel.DurationTime;
            examDetail.ExamName = reqExamDetailModel.ExamName;
            ExamDetail resExamDetail = await _examDetailRepository.UpdateAsync(examDetail, true);
            return _mapper.Map<ResExamDetailDto>(resExamDetail);
        }

        /// <summary>
        /// Method is for get the exam details by course.
        /// </summary>
        /// <param name="courseId">Course id.</param>
        /// <returns>Task ResExamDetailDto.</returns>
        /// <exception cref="UserFriendlyException">ExamNotExist.</exception>
        [Authorize(VirtaulAidPermissions.Exam.Default)]
        public async Task<ResExamDetailDto> GetExamDetailsAsync(Guid courseId, string culture)
        {
            ExamDetail? examDetail = (await _examDetailRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.CourseId == courseId);
            if (examDetail == null)
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());

            ResExamDetailDto examDetailDto = _mapper.Map<ResExamDetailDto>(examDetail);
            ExamDetailTranslation translationForExamDetail = await _multiLingualObjectManager.FindTranslationAsync<ExamDetail, ExamDetailTranslation>(examDetail, culture, true);
            if(translationForExamDetail != null)
            {
                examDetailDto.ExamName = translationForExamDetail.ExamName;
                examDetailDto.Language = translationForExamDetail.Language;
            }
            return examDetailDto;
        }

        /// <summary>
        /// Methid is to get the exam details with the particular codule of course.
        /// </summary>
        /// <param name="courseId">Course Id.</param>
        /// <param name="moduleId">Module id that we want to get the exam details.</param>
        /// <returns>Exam details of perticular module.</returns>
        /// <exception cref="UserFriendlyException">Exam Details not exist.</exception>
        [Authorize(VirtaulAidPermissions.Exam.Default)]
        public async Task<ResExamDetailDto> GetExamDetailsByCourseModuleAsync(Guid courseId, Guid moduleId, string culture)
        {
            ExamDetail? examDetail = (await _examDetailRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.CourseId == courseId);           
            if (examDetail == null)
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());

            ResExamDetailDto examDetailDto = _mapper.Map<ResExamDetailDto>(examDetail);

            int questionCount = await _questionRepository.CountAsync(e => e.ExamDetailId == examDetail.Id && e.ModuleId == moduleId);
            examDetailDto.NoOfQuestions = (ushort)questionCount;
            examDetailDto.DurationTime = (ushort)questionCount;

            ExamDetailTranslation translationForExamDetail = await _multiLingualObjectManager.FindTranslationAsync<ExamDetail, ExamDetailTranslation>(examDetail, culture, true);
            if (translationForExamDetail != null)
            {
                examDetailDto.ExamName = translationForExamDetail.ExamName;
                examDetailDto.Language = translationForExamDetail.Language;
            }
            return examDetailDto;
        }

        /// <summary>
        /// Method is for getting the all exam details list.
        /// </summary>
        /// <returns>Task list of ResExamDetailDto.</returns>
        [Authorize(VirtaulAidPermissions.Exam.Default)]
        public async Task<List<ResExamDetailDto>> GetExamDetailListAsync(string culture)
        {
            List<ExamDetail> examDetailList = (await _examDetailRepository.WithDetailsAsync(x => x.Translations)).ToList();
            List<ResExamDetailDto> examDetailDtoList = new();

            foreach(ExamDetail examDetail in examDetailList)
            {
                ResExamDetailDto examDetailDto = _mapper.Map<ResExamDetailDto>(examDetail);
                ExamDetailTranslation translationForExamDetail = await _multiLingualObjectManager.FindTranslationAsync<ExamDetail, ExamDetailTranslation>(examDetail, culture, true);
                if (translationForExamDetail != null)
                {
                    examDetailDto.ExamName = translationForExamDetail.ExamName;
                    examDetailDto.Language = translationForExamDetail.Language;
                }
                examDetailDtoList.Add(examDetailDto);
            }

            return examDetailDtoList;
        }

        /// <summary>
        /// Method to get exam details by exam details id.
        /// </summary>
        /// <param name="examDetailId">Id of the exam.</param>
        /// <returns>Details of the exam.</returns>
        [Authorize(VirtaulAidPermissions.Exam.Default)]
        public async Task<ResExamDetailDto> GetExamDetailsByIdAsync(int examDetailId, string culture)
        {
            ExamDetail? examDetail = (await _examDetailRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == examDetailId);
            if (examDetail == null)
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());

            ResExamDetailDto examDetailDto = _mapper.Map<ResExamDetailDto>(examDetail);

            ExamDetailTranslation translationForExamDetail = await _multiLingualObjectManager.FindTranslationAsync<ExamDetail, ExamDetailTranslation>(examDetail, culture, true);
            if (translationForExamDetail != null)
            {
                examDetailDto.ExamName = translationForExamDetail.ExamName;
                examDetailDto.Language = translationForExamDetail.Language;
            }

            return examDetailDto;
        }

        /// <summary>
        /// Method is for delete the exam details.
        /// </summary>
        /// <param name="examDetailId">examDetail Id to be deleted.</param>
        /// <returns>Task string message.</returns>
        [Authorize(VirtaulAidPermissions.Exam.Delete)]
        public async Task<string> DeleteExamDetailsAsync(int examDetailId)
        {
            await _examDetailRepository.DeleteDirectAsync(x => x.Id == examDetailId);
            return _localizer["ExamDeleted"];
        }

        /// <summary>
        /// Method is for adding the exam questions with options.
        /// </summary>
        /// <param name="reqQuestionDto">reqQuestionDto with all details.</param>
        /// <returns>Task inserted question details in ResQuestionDto.</returns>
        [Authorize]
        public async Task<ResQuestionDto> AddQuestionAsync(ReqQuestionDto reqQuestionDto)
        {
            List<QuestionOption> Optionlist = _mapper.Map<List<QuestionOption>>(reqQuestionDto.reqOptions);

            Question questionObj = new Question
            {
                QuestionText = reqQuestionDto.QuestionText,
                ExamDetailId = reqQuestionDto.ExamDetailId,
                QuestionOptions = Optionlist
            };
            Question response = await _questionRepository.InsertAsync(questionObj, true);
            ResQuestionDto result = _mapper.Map<ResQuestionDto>(response);
            return result;
        }

        /// <summary>
        /// Method is to update the question and its option.
        /// </summary>
        /// <param name="reqUpdateModel">reqUpdateModel with updated values.</param>
        /// <returns>Task string message.</returns>
        /// <exception cref="UserFriendlyException">QuestionNotExist.</exception>
        [Authorize]
        public async Task<string> UpdateQuestionAsync(ReqUpdateQuestionDto reqUpdateModel)
        {
            Question questionDetail = await _questionRepository.FirstOrDefaultAsync(q => q.Id == reqUpdateModel.Id);
            if (questionDetail == null)
                throw new UserFriendlyException(_localizer["QuestionNotExist"], StatusCodes.Status404NotFound.ToString());

            questionDetail.QuestionText = reqUpdateModel.QuestionText;
            await _questionRepository.UpdateAsync(questionDetail, true);
            List<QuestionOption> optionlist = await _optionRepository.GetListAsync(x => reqUpdateModel.reqOptions.Select(o => o.Id).Contains(x.Id));
            optionlist.ForEach(x =>
            {
                x.OptionText = (reqUpdateModel.reqOptions.First(o => o.Id == x.Id)).OptionText;
                x.IsCorrect = (reqUpdateModel.reqOptions.First(o => o.Id == x.Id)).IsCorrect;
            });
            await _optionRepository.UpdateManyAsync(optionlist, true);

            return _localizer["QuestionUpdated"];
        }

        /// <summary>
        /// Method is to get question list by examdetail id.
        /// </summary>
        /// <param name="examDetailId">exam detail id.</param>
        /// <returns>Task list of ResQuestionDto.</returns>
        [Authorize]
        public async Task<List<ResQuestionDto>> GetQuestionListAsync(int examDetailId, string culture)
        {

            List<Question> questionList = (await _questionRepository.WithDetailsAsync(x => x.Translations)).Where(e => e.ExamDetailId == examDetailId).ToList();

            if (questionList == null)
                return new List<ResQuestionDto>();


            List<QuestionOption> optionList = (await _optionRepository.WithDetailsAsync(x => x.Translations)).Where(x => questionList.Select(q => q.Id).Contains(x.QuestionId)).ToList();

            List<ResQuestionDto> questionDtoList = new();
            foreach (Question question in questionList)
            {
                ResQuestionDto questionDto = _mapper.Map<ResQuestionDto>(question);
                QuestionTranslation translationForQuestion = await _multiLingualObjectManager.FindTranslationAsync<Question, QuestionTranslation>(question, culture, true);
                if(translationForQuestion != null)
                {
                    questionDto.Language = translationForQuestion.Language;
                    questionDto.QuestionText = translationForQuestion.QuestionText;
                }

                List<QuestionOption> optionForQuestion = optionList.Where(x => x.QuestionId == question.Id).ToList();
                List<ResOptionDto> optionDtoList = new();

                foreach(QuestionOption option in optionForQuestion) 
                {
                    ResOptionDto optionDto = _mapper.Map<ResOptionDto>(option);
                    QuestionOptionTranslation translationForOption = await _multiLingualObjectManager.FindTranslationAsync<QuestionOption, QuestionOptionTranslation>(option, culture, true);
                    if(translationForOption != null)
                    {
                        optionDto.Language = translationForOption.Language;
                        optionDto.OptionText = translationForOption.OptionText;
                    }
                    optionDtoList.Add(optionDto);
                }
                questionDto.QuestionOptions = optionDtoList;
                questionDtoList.Add(questionDto);
            }

            return questionDtoList;
        }

        /// <summary>
        /// Method is to get the question with options.
        /// </summary>
        /// <param name="questionId">Question id.</param>
        /// <returns>Question details in ResQuestionDto.</returns>
        /// <exception cref="UserFriendlyException">QuestionNotExist.</exception>
        [Authorize]
        public async Task<ResQuestionDto> GetQuestionAsync(int questionId, string culture)
        {
            Question? question = (await _questionRepository.WithDetailsAsync(x => x.Translations)).FirstOrDefault(x => x.Id == questionId);
            if (question == null)
                throw new UserFriendlyException(_localizer["QuestionNotExist"], StatusCodes.Status404NotFound.ToString());

            ResQuestionDto questionDto = _mapper.Map<ResQuestionDto>(question);
            QuestionTranslation translationForQuestion = await _multiLingualObjectManager.FindTranslationAsync<Question, QuestionTranslation>(question, culture, true);
            if (translationForQuestion != null)
            {
                questionDto.Language = translationForQuestion.Language;
                questionDto.QuestionText = translationForQuestion.QuestionText;
            }


            List<QuestionOption> optionList = (await _optionRepository.WithDetailsAsync(x => x.Translations)).Where(x => x.QuestionId == questionId).ToList();
            List<ResOptionDto> optionDtoList = new();
            foreach(QuestionOption option in optionList)
            {
                ResOptionDto optionDto = _mapper.Map<ResOptionDto>(option);
                QuestionOptionTranslation translationForOption = await _multiLingualObjectManager.FindTranslationAsync<QuestionOption, QuestionOptionTranslation>(option, culture, true);
                if (translationForOption != null)
                {
                    optionDto.Language = translationForOption.Language;
                    optionDto.OptionText = translationForOption.OptionText;
                }
                optionDtoList.Add(optionDto);
            }
            questionDto.QuestionOptions = optionDtoList;
            
            return questionDto;
        }

        /// <summary>
        /// Method is to delete the question.
        /// </summary>
        /// <param name="questionId">Question id.</param>
        /// <returns>Task string message.</returns>
        /// <exception cref="UserFriendlyException">QuestionNotExist.</exception>
        [Authorize]
        public async Task<string> DeleteQuestionAsync(int questionId)
        {
            Question questiondetails = await _questionRepository.FirstOrDefaultAsync(q => q.Id == questionId);
            if (questiondetails == null)
                throw new UserFriendlyException(_localizer["QuestionNotExist"], StatusCodes.Status404NotFound.ToString());

            await _questionRepository.DeleteAsync(questiondetails, true);
            return _localizer["QuestionDeleted"];
        }

        /// <summary>
        /// Method is for start the exam.
        /// </summary>
        /// <param name="examDetailId">Exam id.</param>
        /// <param name="userId">User id.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>List of questions in ResExamQuestionDto.</returns>
        [Authorize(VirtaulAidPermissions.Exam.Edit)]
        public async Task<ResStartExamDto> StartExamAsync(int examDetailId, string userId, string examType, string culture)
        {

            ExamDetail examDetails = await _examDetailRepository.FirstOrDefaultAsync(x => x.Id == examDetailId);
            if (examDetails == null)
            {
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            UserCourseEnrollments userCourseEnrollmentDetails = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId, examDetails.CourseId.ToString(), examType);

            // This is to restrict the user from 2nd attempt.
            if (userCourseEnrollmentDetails != null)
            {
                if (userCourseEnrollmentDetails.IsExamConducted)
                {
                    throw new UserFriendlyException(_localizer["ExamConducted"], StatusCodes.Status403Forbidden.ToString());
                }
                else
                {
                    userCourseEnrollmentDetails.IsExamConducted = true;
                    userCourseEnrollmentDetails.CourseEndDate = DateTime.Now;
                    userCourseEnrollmentDetails.CertificateExpirationDate = DateTime.Now.AddMonths(12);
                    if (userCourseEnrollmentDetails.Progress > 100)
                        userCourseEnrollmentDetails.Progress = 100;

                    if (userCourseEnrollmentDetails.ExamType != "Live")
                    {
                        userCourseEnrollmentDetails.IsCompleted = true;
                        userCourseEnrollmentDetails.Progress = 100;
                    }
                }
            }

            List<Question> questionList = (await _questionRepository.WithDetailsAsync(x => x.Translations)).Where(x => x.ExamDetailId == examDetailId).ToList();
            if (questionList == null)
                return new ResStartExamDto();

            List<QuestionOption> optionList = (await _optionRepository.WithDetailsAsync(x => x.Translations)).Where(x => questionList.Select(q => q.Id).Contains(x.QuestionId)).ToList();

            List<ResExamQuestionDto> questionDtoList = new();
            foreach (Question question in questionList)
            {
                ResExamQuestionDto questionDto = _mapper.Map<ResExamQuestionDto>(question);
                QuestionTranslation translationForQuestion = await _multiLingualObjectManager.FindTranslationAsync<Question, QuestionTranslation>(question, culture, true);
                if (translationForQuestion != null)
                {
                    questionDto.QuestionText = translationForQuestion.QuestionText;
                    questionDto.Language = translationForQuestion.Language;
                }

                List<ResExamOptionDto> optionDtoList = new();
                List<QuestionOption> optionForQuestionList = optionList.Where(x => x.QuestionId == question.Id).ToList();
                foreach(QuestionOption option in optionForQuestionList) 
                {
                    ResExamOptionDto optionDto = _mapper.Map<ResExamOptionDto>(option);
                    QuestionOptionTranslation translationForOption = await _multiLingualObjectManager.FindTranslationAsync<QuestionOption, QuestionOptionTranslation>(option, culture, true);
                    if (translationForOption != null)
                    {
                        optionDto.OptionText = translationForOption.OptionText;
                        optionDto.Language = translationForOption.Language;
                    }
                    optionDtoList.Add(optionDto);
                }
                questionDto.QuestionOptions = optionDtoList;
                questionDtoList.Add(questionDto);
            }

            ResStartExamDto resStartExam = new ResStartExamDto
            {
                Questions = questionDtoList,
                ExamTime = examDetails.DurationTime
            };

            return resStartExam;
        }

        /// <summary>
        /// Method is to save the exam amswer and update the progress.
        /// </summary>
        /// <param name="reqExamResultDtos">list of answer in reqExamResultDto.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>Task.</returns>
        [Authorize(VirtaulAidPermissions.Exam.Edit)]
        public async Task SaveAnswerAsync(List<ReqExamResultDto> reqExamResultDtos, string examType)
        {
            Guid? userId = reqExamResultDtos[0].UserId;
            Question questionDetail = await _questionRepository.FirstAsync(x => x.Id == reqExamResultDtos[0].QuestionId);
            ExamDetail examDetail = await _examDetailRepository.FirstAsync(x => x.Id == questionDetail.ExamDetailId);
            Users.UserCourseEnrollments userCourseEnrollmentDetails = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId.ToString(), examDetail.CourseId.ToString(), examType);

            List<QuestionOption> optionList = await _optionRepository.GetListAsync(x => reqExamResultDtos.Select(o => o.ChosedOptionId).Contains(x.Id));
            List<ExamResult> userAnswerList = await _resultRepository.
                GetListAsync(a => a.UserId == userId && a.CourseEnrollmentId == userCourseEnrollmentDetails.Id && reqExamResultDtos.Select(q => q.QuestionId).Contains(a.QuestionId));
            if (userAnswerList.Count == 0)
            {
                List<ExamResult> result = _mapper.Map<List<ExamResult>>(reqExamResultDtos);
                result.ForEach(x =>
                {
                    x.CourseEnrollmentId = userCourseEnrollmentDetails.Id;
                    x.IsOptionCorrect = (optionList.First(o => o.Id == x.ChosedOptionId)).IsCorrect;
                });
                await _resultRepository.InsertManyAsync(result, true);
            }
            else
            {
                userAnswerList.ForEach(x =>
                {
                    x.ChosedOptionId = (reqExamResultDtos.First(m => m.QuestionId == x.QuestionId)).ChosedOptionId;
                    x.IsOptionCorrect = (optionList.First(o => o.Id == x.ChosedOptionId)).IsCorrect;
                });
                await _resultRepository.UpdateManyAsync(userAnswerList, true);
            }
        }

        /// <summary>
        /// Methos is to genrate the percentage of exam.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="examDetailId">exam id for getting details.</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>Percentage in float string.</returns>
        [Authorize(VirtaulAidPermissions.Exam.Default)]
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


        /// <summary>
        /// Method to get questions for particular module exam.
        /// </summary>
        /// <param name="moduleId">id of the module whose exam is to be conducted</param>
        /// <param name="examDetailsId">course exam details id</param>
        /// <param name="userId">id of the user</param>
        /// <param name="examType">Type of the exam.</param>
        /// <returns>object which has questions and time for the exam</returns>
        /// <exception cref="UserFriendlyException">throws exception is exam details are wrong or user id is wrong or the course is not assigned to user</exception>
        [Authorize(VirtaulAidPermissions.Exam.Edit)]
        public async Task<ResStartExamDto> GetQuestionsForParticularModuleAsync(Guid moduleId, int examDetailsId, string userId, string examType, string culture)
        {
            ExamDetail examDetails = await _examDetailRepository.FirstOrDefaultAsync(x => x.Id == examDetailsId);
            if (examDetails == null)
            {
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            Users.UserCourseEnrollments userCourseEnrollmentDetails = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId, examDetails.CourseId.ToString(), examType);


            if (userCourseEnrollmentDetails != null)
            {
                List<Guid> listOfExamConductedModules = userCourseEnrollmentDetails.ListOfExamConductedModules;
                if(listOfExamConductedModules.Contains(moduleId))
                {
                    throw new UserFriendlyException(_localizer["ExamConducted"], StatusCodes.Status403Forbidden.ToString());
                }
                else
                {
                    ResStartExamDto resStartExam = new();
                    Guid courseId = examDetails.CourseId;
                    List<Module> listOfModulesWithExams = (await _moduleRepository.GetListAsync(x => x.CourseId == courseId && x.HasExam))
                                                          .OrderByDescending(x => x.SerialNumber).ToList();
                    Guid lastModuleId = listOfModulesWithExams[0].Id;
                    if(lastModuleId == moduleId)
                    {
                        userCourseEnrollmentDetails.IsExamConducted = true;                      
                    }
                    listOfExamConductedModules.Add(moduleId);
                    userCourseEnrollmentDetails.ListOfExamConductedModules = listOfExamConductedModules;
                    await _courseDomainService.UpdateCourseEnrollmentDetailsAsync(userCourseEnrollmentDetails);

                    List<Question> questionList = (await _questionRepository.WithDetailsAsync(x => x.Translations)).Where(x => x.ExamDetailId == examDetailsId && x.ModuleId == moduleId).ToList();
                    if (questionList == null)
                        return new ResStartExamDto();

                    List<QuestionOption> optionList = (await _optionRepository.WithDetailsAsync(x => x.Translations)).Where(x => questionList.Select(q => q.Id).Contains(x.QuestionId)).ToList();

                    List<ResExamQuestionDto> questionDtoList = new();
                    foreach (Question question in questionList)
                    {
                        ResExamQuestionDto questionDto = _mapper.Map<ResExamQuestionDto>(question);
                        QuestionTranslation translationForQuestion = await _multiLingualObjectManager.FindTranslationAsync<Question, QuestionTranslation>(question, culture, true);
                        if (translationForQuestion != null)
                        {
                            questionDto.QuestionText = translationForQuestion.QuestionText;
                            questionDto.Language = translationForQuestion.Language;
                        }

                        List<ResExamOptionDto> optionDtoList = new();
                        List<QuestionOption> optionForQuestionList = optionList.Where(x => x.QuestionId == question.Id).ToList();
                        foreach (QuestionOption option in optionForQuestionList)
                        {
                            ResExamOptionDto optionDto = _mapper.Map<ResExamOptionDto>(option);
                            QuestionOptionTranslation translationForOption = await _multiLingualObjectManager.FindTranslationAsync<QuestionOption, QuestionOptionTranslation>(option, culture, true);
                            if (translationForOption != null)
                            {
                                optionDto.OptionText = translationForOption.OptionText;
                                optionDto.Language = translationForOption.Language;
                            }
                            optionDtoList.Add(optionDto);
                        }
                        questionDto.QuestionOptions = optionDtoList;
                        questionDtoList.Add(questionDto);
                    }

                    resStartExam.Questions = questionDtoList;
                    resStartExam.ExamTime = questionList.Count;
                    return resStartExam;
                }
            }
            else
            {
                throw new UserFriendlyException("User not enrolled in the course");
            }
        }
    }
}
