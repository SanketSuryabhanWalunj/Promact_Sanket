using AITrainer.AITrainer.Core.Dto.Quizes;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Quizes;
using AITrainer.Services.QuizService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;
using System.Text;
using System.Web;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles ="Admin")]
    [Authorize]
    public class QuizController : ControllerBase
    {
        private readonly IQuizRepository _quizRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IQuizService _quizService;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public QuizController(IQuizRepository quizRepository,    IHttpClientFactory httpClientFactory, IQuizService quizService, IHttpContextAccessor httpContextAccessor)
        {
            _quizRepository = quizRepository;
            _httpClientFactory = httpClientFactory;
            _quizService = quizService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Updates an existing quiz with new details provided in the editQuiz DTO. It looks for the quiz by ID,
        /// updates its properties if found, and saves the changes.
        /// </summary>
        /// <param name="editQuiz">Data transfer object containing the new quiz details.</param>
        /// <returns>An IActionResult indicating the success of the update operation with a response DTO, or an error message if the quiz is not found.</returns>
        [HttpPut("UpdateQuiz")]
        public async Task<IActionResult> UpdateQuizAsync (QuizEditDto editQuiz)
        {
            try
            {
                var findQuiz = await _quizRepository.findQuizById(editQuiz.QuizId);
                if (findQuiz == null)
                {
                    return NotFound("Quiz Not Found");
                }
                else
                {
                    findQuiz.Title = editQuiz.Question;
                    findQuiz.Option1 = editQuiz.Option1;
                    findQuiz.Option2 = editQuiz.Option2;
                    findQuiz.Option3 = editQuiz.Option3;
                    findQuiz.Option4=editQuiz.Option4;
                    findQuiz.Answer=editQuiz.Answer;
                    findQuiz.QuizMarks = Convert.ToInt16(editQuiz.editMarks);
                    findQuiz.UpdatedDate = DateTime.UtcNow;

                    //save changes to quiz table
                    var updatedTopic = await _quizRepository.updateQuizAsync(findQuiz);

                    //response
                    var quizEdit = new QuizEditDto
                    {
                        QuizId = editQuiz.QuizId,
                        Question = editQuiz.Question,
                        Option1 = editQuiz.Option1,
                        Option2 = editQuiz.Option2,
                        Option3 = editQuiz.Option3,
                        Option4 = editQuiz.Option4,
                        Answer = editQuiz.Answer,
                        editMarks=editQuiz.editMarks
                    };
                    var response = new QuizResponseDto
                    {
                        message="Question updated successfully.",
                        quizEditDto=quizEdit
                    };

                    return Ok(response);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a quiz by marking it as deleted in the database. It looks for the quiz by ID and updates its IsDeleted property.
        /// </summary>
        /// <param name="quizId">The ID of the quiz to be deleted.</param>
        /// <returns>An IActionResult indicating the success of the delete operation, or a BadRequest if the quiz is not found.</returns>
        [HttpDelete("DeleteQuiz")]
        public async Task<IActionResult> DeleteQuizAsync(string quizId)
        {
            try
            {
                var findQuiz=await _quizRepository.findQuizById(quizId);

                if(findQuiz==null)
                {
                    return BadRequest();

                }
                else
                {
                    findQuiz.IsDeleted = true;
                    findQuiz.UpdatedDate = DateTime.UtcNow;

                    //update changes to quiz table
                    var deleteQuiz=await _quizRepository.updateQuizAsync(findQuiz);

                    //response
                    return Ok(new {message="Quiz deleted successfully"});

                }
            }
            catch (Exception ex)
            {
                return StatusCode(500,$"Internal server error :{ex.Message}");
            }
        }

        /// <summary>
        /// Adds a new quiz associated with a specific topic. Checks for existing quiz questions for the topic
        /// to prevent duplicates and creates a new quiz entry if no duplicates are found.
        /// </summary>
        /// <param name="addQuiz">Data transfer object containing details of the quiz to be added.</param>
        /// <returns>An IActionResult indicating the success of the add operation with a response DTO, or a conflict message if a duplicate exists.</returns>
        
        [HttpPost("AddQuiz")]
        public async Task<IActionResult> AddQuizForTopicAsync(AddQuizDto addQuiz)
        {
            // Check if the course already exists
            var quizExist = await _quizRepository.findQuizAsync(addQuiz.AddQuestion,addQuiz.AddAnswer,addQuiz.TopicId);
            if (quizExist != null)
            {
                return Conflict(new { error = "Question already exists for this topic" });
            }

            var quiz = new Quiz
            {
                Id=Guid.NewGuid().ToString(),
                TopicId=addQuiz.TopicId,
                Title=addQuiz.AddQuestion,
                Option1=addQuiz.AddOption1,
                Option2=addQuiz.AddOption2,
                Option3=addQuiz.AddOption3,
                Option4=addQuiz.AddOption4,
                Answer=addQuiz.AddAnswer,
                QuizMarks=Convert.ToInt16(addQuiz.AddMarks),
                CreatedDate=DateTime.UtcNow,
                UpdatedDate=DateTime.UtcNow,
                IsDeleted=false,
            };
            // Create the quiz and get the result
            var quizData = await _quizRepository.AddQuizAsync(quiz);

            if(quizData != null)
            {

                //response 
                var quizAddResponse = new QuizAddResponseDto
                {
                   quizId=quizData.Id,
                   TopicId=quizData.TopicId,
                   Question=quizData.Title,
                   Option1=quizData.Option1,
                   Option2=quizData.Option2,
                   Option3=quizData.Option3,
                   Option4=quizData.Option4,
                   Answer=quizData.Answer,
                   Marks=quizData.QuizMarks
                };
                var response = new QuizResponseForAdd
                {
                    message = "Question Added successfully.",
                    quizAddResponseDto = quizAddResponse,
                };
                return Ok(response);
            }
            else 
            { 
                return BadRequest(); 
            }
        }

        /// <summary>
        /// Retrieves quizzes related to a specific topic and formats the response for front-end display or further processing.
        /// This version does not interact with external services for link generation.
        /// </summary>
        /// <param name="TopicId">The ID of the topic for which quizzes are requested.</param>
        /// <returns>A detailed quiz object including formatted questions and answers.</returns>
        [HttpGet("GetQuiz")]
        public async Task<ActionResult<QuizQuestyDto>> GetQuizLink(string TopicId)
        {
            var generatedQuiz = await _quizRepository.FindQuizByTopic(TopicId);
           
            var quizresponse = new QuizQuestyDto();
            var questionFormatList = new List<QuestionFormat>();
            var quizresponses = new QuizQuestyDto
            {
                TestName = "Sample Test1",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now,
                Duration = 30,
                QuestionOrder = "Fixed",
                OptionOrder = "Random",
                CorrectMarks = 10,
                IncorrectMarks = 0,
                CategoryName = "FirstCategory",
                CategoryDescription = "FirstDescription",
                TimeZoneDetails = "{\"Id\":\"India Standard Time\",\"DisplayName\":\"(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi\",\"StandardName\":\"India Standard Time\",\"DaylightName\":\"India Daylight Time\",\"BaseUtcOffset\":\"05:30:00\",\"AdjustmentRules\":null,\"SupportsDaylightSavingTime\":false}",
                questionACs = new List<QuestionFormat>()
            };

            foreach (var data in generatedQuiz)
            {
                var questionFormat = new QuestionFormat
                {
                    Question = new QuestionDetails { QuestionDetail = data.Title },
                    SingleMultipleAnswerQuestion = new SingleMultipleAnswerQuestion
                    {
                        SingleMultipleAnswerQuestionOption = new List<AnswerOption>
                        {
                         new AnswerOption { Option = data.Option1, IsAnswer = (data.Answer == data.Option1) },
                         new AnswerOption { Option = data.Option2, IsAnswer = (data.Answer == data.Option2) },
                         new AnswerOption { Option = data.Option3, IsAnswer = (data.Answer == data.Option3) },
                         new AnswerOption { Option = data.Option4, IsAnswer = (data.Answer == data.Option4) }
                        }
                    }
                };
                questionFormatList.Add(questionFormat);

            }
            quizresponses.questionACs = questionFormatList;



            return quizresponses;

        }
        /// <summary>
        /// Generates a quiz link for a given topic by interacting with an external quiz service.
        /// Formats the quiz data, posts it to the external service, and updates the topic with the returned quiz link.
        /// </summary>
        /// <param name="getQuizDto">Data transfer object containing the topic ID for which the quiz link is generated.</param>
        /// <returns>An ActionResult containing the external service's response or an error message.</returns>
        [HttpPost("GetQuizLink")]
        public async Task<ActionResult> GetQuizLinkIn(GetQuizDto getQuizDto)
        {
            List<Quiz> generatedQuiz = await _quizRepository.FindQuizByTopic(getQuizDto.TopicId);
            Topic topic = await _quizRepository.FindTopic(getQuizDto.TopicId);
            Quiz quizMark = await _quizRepository.FindMark(topic.Id);          
            List<QuestionFormat> questionFormatList = new ();
            QuizQuestyDto quizresponses = new()
            {
                TestName = topic.TopicName,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddYears(10),
                Duration = topic.QuizDuration,
                QuestionOrder = "Fixed",
                OptionOrder = "Random",
                CorrectMarks = quizMark.QuizMarks,
                IncorrectMarks = 0,
                CategoryName = topic.TopicName,
                CategoryDescription = "FirstDescription",
                TimeZoneDetails = "{\"Id\":\"India Standard Time\",\"DisplayName\":\"(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi\",\"StandardName\":\"India Standard Time\",\"DaylightName\":\"India Daylight Time\",\"BaseUtcOffset\":\"05:30:00\",\"AdjustmentRules\":null,\"SupportsDaylightSavingTime\":false}",
                questionACs = new List<QuestionFormat>()
            };
            foreach (var data in generatedQuiz)
            {
                var questionFormat = new QuestionFormat
                {
                    Question = new QuestionDetails { QuestionDetail = data.Title },
                    SingleMultipleAnswerQuestion = new SingleMultipleAnswerQuestion
                    {
                        SingleMultipleAnswerQuestionOption = new List<AnswerOption>
            {
                new AnswerOption { Option = HttpUtility.HtmlEncode(data.Option1), IsAnswer = (data.Answer == data.Option1) },
                new AnswerOption { Option = HttpUtility.HtmlEncode(data.Option2), IsAnswer = (data.Answer == data.Option2) },
                new AnswerOption { Option = HttpUtility.HtmlEncode(data.Option3), IsAnswer = (data.Answer == data.Option3) },
                new AnswerOption { Option = HttpUtility.HtmlEncode(data.Option4), IsAnswer = (data.Answer == data.Option4) }
            }
                    }
                };
                questionFormatList.Add(questionFormat);
            }
            quizresponses.questionACs = questionFormatList;

            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var json = JsonConvert.SerializeObject(quizresponses);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var userName = "aiteam@yopmail.com";
                var apiUrl = $"https://app.questy.co.in/api/public/AddTestAndQuestion?userName={userName}";

                using var response = await httpClient.PostAsync(apiUrl, content);
                if (response.IsSuccessStatusCode)
                {
                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObject = JsonConvert.DeserializeObject<dynamic>(responseContent);
                    var testId = responseObject?.testId.ToString();
                    var testLink = responseObject?.testLink.ToString();
                    await _quizRepository.updateTopic(topic.Id, testId, testLink);
                return Ok(responseContent);
                }
                else
                {
                return BadRequest("Failed to add test and questions");
                }
            }
            catch (Exception ex)
            {
            return StatusCode(500, $"An error occurred: {ex.Message}");
            }



        }

        /// <summary>
        /// Retrieves quiz results for a specific topic and user from an external quiz service.
        /// Formats the request, sends it to the external service, and returns the quiz results.
        /// </summary>
        /// <param name="TopicId">The ID of the topic for which quiz results are requested.</param>
        /// <param name="username">The email/username of the quiz attendee.</param>
        /// <returns>An ActionResult containing the quiz results or an error status code.</returns>
        [HttpGet("GetQuizResult")]
        public async Task<ActionResult> GetQuizResult(string TopicId,string username)
        {
            var topic = await _quizRepository.FindTopic(TopicId);
            var httpClient = _httpClientFactory.CreateClient();
            var apiUrl = $"https://app.questy.co.in/api/public/TestResult?attendeeEmail={username}&testId={topic.QuizId}";
            using var response = await httpClient.GetAsync(apiUrl);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var quizResponseDto = JsonConvert.DeserializeObject<QuizQuestyResponseDto>(content);
                await _quizService.addResponse(quizResponseDto, TopicId, username);
                return Ok(content); 
            }
            else
            {
                return StatusCode((int)response.StatusCode); 
            }
        }

        /// <summary>
        /// Retrieves quiz results for the current intern user from an external quiz service.
        /// Automatically identifies the intern's email from the HttpContext and requests the quiz results.
        /// </summary>
        /// <param name="TopicId">The ID of the topic for which quiz results are requested.</param>
        /// <returns>An ActionResult containing the quiz results for the intern or an error status code.</returns>
        [HttpGet("GetQuizResultInter")]
        public async Task<ActionResult> GetQuizResultIntern(string TopicId)
        {
            var email = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Email)?.Value;
            var topic = await _quizRepository.FindTopic(TopicId);
            var httpClient = _httpClientFactory.CreateClient();
            var apiUrl = $"https://app.questy.co.in/api/public/TestResult?attendeeEmail={email}&testId={topic.QuizId}";
            using var response = await httpClient.GetAsync(apiUrl);
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var quizResponseDto = JsonConvert.DeserializeObject<QuizQuestyResponseDto>(content);
                await _quizService.addResponse(quizResponseDto, TopicId, email);
                return Ok(content);
            }
            else
            {
                return StatusCode((int)response.StatusCode);
            }
        }

        /// <summary>
        /// Checks the submission status of a quiz for a given topic and the current user.
        /// Determines whether the quiz has been submitted by the user to prevent multiple submissions.
        /// </summary>
        /// <param name="TopicId">The ID of the topic to check the submission status for.</param>
        /// <returns>A boolean indicating whether the quiz for the given topic has been submitted by the user.</returns>
        [HttpGet("GetStatus")]
        public  bool GetQuizSubmitionStatus(string TopicId)
        {
            if(TopicId == null || TopicId == "undefined")
            {
                return false;
            }
            else
            {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = _quizRepository.isQuizSubmitted(TopicId,userId);
            return result;
            }
        }

    }
}
