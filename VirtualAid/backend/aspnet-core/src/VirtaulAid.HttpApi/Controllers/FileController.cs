using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using VirtaulAid.DTOs.User;
using Volo.Abp.AspNetCore.Mvc;
using DinkToPdf.Contracts;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Interfaces;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Domain.Repositories;
using VirtaulAid.DomainServices;
using VirtaulAid.Exams;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using VirtaulAid.Localization;
using PuppeteerSharp;
using PuppeteerSharp.Media;
using Serilog;
using Microsoft.Extensions.Options;
using VirtaulAid.DTOs.Appsettings;
using Newtonsoft.Json;
using System.Net.WebSockets;
using System.Threading;
using VirtaulAid.DTOs.Feedback;
using VirtaulAid.Feedbacks;
using AutoMapper;
using DocumentFormat.OpenXml.Vml;
using DocumentFormat.OpenXml.EMMA;
using Amazon.SimpleEmail.Model;
using VirtaulAid.Courses;
using VirtaulAid.MultilingualObjects;

namespace VirtaulAid.Controllers
{
    public class FileController : AbpController
    {
        private readonly IConverter _pdfConverter;
        private readonly ITemplateAppService _templateAppService;
        private readonly CourseDomainService _courseDomainService;
        private readonly IRepository<ExamDetail> _examDetailRepository;
        private readonly IRepository<Question> _questionRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IRepository<ExamResult> _resultRepository;
        private AppAppsettings _appOptions;
        private readonly IRepository<Feedback> _feedbackRepository;
        private readonly IMapper _mapper;
        private readonly MultiLingualObjectManager _multiLingualObjectManager;

        public FileController(IConverter pdfConverter, ITemplateAppService templateAppService,
            CourseDomainService courseDomainService,
            IRepository<ExamDetail> examDetailRepository,
            IRepository<Question> questionRepository,
            IOptions<AppAppsettings> appOptions,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<ExamResult> resultRepository, IRepository<Feedback> feedbackRepository, IMapper mapper, MultiLingualObjectManager multiLingualObjectManager)
        {
            _pdfConverter = pdfConverter;
            _templateAppService = templateAppService;
            _courseDomainService = courseDomainService;
            _examDetailRepository = examDetailRepository;
            _questionRepository = questionRepository;
            _appOptions = appOptions.Value;
            _localizer = localizer;
            _resultRepository = resultRepository;
            _feedbackRepository = feedbackRepository;
            _mapper = mapper;
            _multiLingualObjectManager = multiLingualObjectManager;
        }


        /**
         * @api {get} api/file/download-template For downloading the csv template file for bulk upload of employee data.
         * @apiName DownloadTemplate
         * @apiGroup File
         *
         *
         * @apiSuccess {Object File} File containing details of required fields.
         */
        [Authorize]
        [HttpGet("download-template")]
        public IActionResult DownloadTemplate()
        {
            var records = new List<BulkUserTemplateDto> { new BulkUserTemplateDto() };
            var csvContent = new StringBuilder();

            using (var writer = new StringWriter(csvContent))
            using (var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)))
            {
                csv.WriteRecords(records);
            }

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Sheet1");

                // Load CSV data into the Excel worksheet
                string csvData = csvContent.ToString();
                string[] lines = csvData.Split(Environment.NewLine);

                for (int row = 1; row <= lines.Length; row++)
                {
                    string[] values = lines[row - 1].Split(',');
                    int col = 1;
                    foreach (var value in values)
                    {
                        worksheet.Cell(row, col).Value = (row == 1 ? value + "(Required)" : value);
                        col++;
                    }
                }
                var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                memoryStream.Position = 0;

                // Set the content type for Excel file
                var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var outputFileName = $"bulkuploadforemployees_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}.xlsx";

                // Return the Excel file as a FileResult
                return File(memoryStream, contentType, outputFileName);
            }
        }

        /**
         * @api {get} api/file/feedbacks-file For downloading the feedbacks files.
         * @apiName DownloadFeedbacksExcelFile
         * @apiGroup File
         *
         *
         * @apiSuccess {Object File} File containing details of required fields.
         */
        [Authorize]
        [HttpGet("feedbacks-file")]
        public async Task<IActionResult> DownloadFeedbacksExcelFile()
        {
            List<Feedback> feedbacks = await _feedbackRepository.GetListAsync();
            List<FeedbackTemplateDto> feedbacksDto = _mapper.Map<List<FeedbackTemplateDto>>(feedbacks);
            foreach (var item in feedbacks.Select((value, i) => new { i, value }))
            {
                string ScreenShots = "";
                if (item.value.ScreenShots != null)
                {
                    foreach (var ss in item.value.ScreenShots)
                    {
                        ScreenShots += ss + "  ";
                    }
                }
                feedbacksDto[item.i].ScreenShots = ScreenShots;
            }
            var records = new List<FeedbackTemplateDto> { new FeedbackTemplateDto(), };
            foreach (var feedback in feedbacksDto)
            {
                records.Add(feedback);
            }
            var csvContent = new StringBuilder();

            using (var writer = new StringWriter(csvContent))
            using (var csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture)))
            {
                csv.WriteRecords(records);
            }

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Sheet1");

                // Load CSV data into the Excel worksheet
                string csvData = csvContent.ToString();
                string[] lines = csvData.Split(Environment.NewLine);

                for (int row = 1; row <= lines.Length; row++)
                {
                    string[] values = lines[row - 1].Split(',');
                    int col = 1;
                    foreach (var value in values)
                    {
                        worksheet.Cell(row, col).Value = (row == 1 ? value + "(Required)" : value);
                        col++;
                    }
                }
                var memoryStream = new MemoryStream();
                workbook.SaveAs(memoryStream);
                memoryStream.Position = 0;

                // Set the content type for Excel file
                var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                var outputFileName = $"feedbacks_{DateTime.Now.ToString("MM-dd-yyyy-HH:mm:ss")}.xlsx";

                // Return the Excel file as a FileResult
                return File(memoryStream, contentType, outputFileName);
            }
        }

        /**
         * @api {post} api/file/download-certificate For downloading the certificate.
         * @apiName GenerateCertificateWSAsync
         * @apiGroup File
         * @apiBody CourseCertificateDto Details for the certificate creation.
         *
         *
         * @apiSuccess {Object File} File containing details of certification.
         */
        [Authorize]
        [HttpPost("download-certificate")]
        public async Task<IActionResult> GenerateCertificateWSAsync(int examDetailId, string userId, string examType, string culture)
        {
            ExamDetail examDetails = await _examDetailRepository.FirstOrDefaultAsync(x => x.Id == examDetailId);
            if (examDetails == null)
            {
                throw new UserFriendlyException(_localizer["ExamNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            Users.UserCourseEnrollments userCourseEnrollmentDetails = await _courseDomainService.GetUserCourseEnrollmentDetailsAsync(userId, examDetails.CourseId.ToString(), examType);
            List<Question> questionList = await _questionRepository.GetListAsync(e => e.ExamDetailId == examDetailId);
            int resultDetails = await _resultRepository.CountAsync(x => questionList.Select(q => q.Id).Contains(x.QuestionId) && x.UserId == Guid.Parse(userId) && x.CourseEnrollmentId == userCourseEnrollmentDetails.Id && x.IsOptionCorrect);

            double reqPercentage = 0.0;
            if (resultDetails >= 0 && examDetails.NoOfQuestions > 0)
            {
                Log.Information("Req percentage started calculating...");
                reqPercentage = ((float)resultDetails / (float)examDetails.NoOfQuestions) * 100;
                Log.Information("Req percentage is calculated...");
            }
            else
            {
                throw new UserFriendlyException(_localizer["ResultDetailsIssue"], StatusCodes.Status422UnprocessableEntity.ToString());

            }
            Log.Information("Started fetching course details...");
            Course courseDetails = (await _courseDomainService.GetCourseDetailsWithTranslationByCourseIdAsync(examDetails.CourseId));

            if (userCourseEnrollmentDetails == null)
            {
                throw new UserFriendlyException(_localizer["UserCourseEnrollmentNotFound"], StatusCodes.Status404NotFound.ToString());
            }

            if (courseDetails == null)
            {
                throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            try
            {
                CourseCertificateDto courseCertificateDto = new CourseCertificateDto();
                courseCertificateDto.UserName = $"{userCourseEnrollmentDetails.User.FirstName} {userCourseEnrollmentDetails.User.LastName}";
                courseCertificateDto.CourseName = courseDetails.Name;
                courseCertificateDto.Percentage = double.IsNaN(reqPercentage) ? 0 : Math.Round(reqPercentage, 2);
                courseCertificateDto.CourseCompletionDate = userCourseEnrollmentDetails.CourseEndDate;
                courseCertificateDto.CertificateExpirationDate = userCourseEnrollmentDetails.CertificateExpirationDate ?? userCourseEnrollmentDetails.CourseEndDate.AddYears(1);

                // Get the SES template content
                string templateName = _localizer["CertificateTemplate"];
                if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                {
                    templateName = templateName + "_" + culture;
                }
                Template emailTemplateContent = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateName);
                string htmlContent = emailTemplateContent.HtmlPart;

                CourseTranslation translationForCourse = await _multiLingualObjectManager.FindTranslationAsync<Course, CourseTranslation>(courseDetails, culture, true);
                if(translationForCourse != null)
                {
                    courseCertificateDto.CourseName = translationForCourse.Name;
                }
                if (userCourseEnrollmentDetails != null && userCourseEnrollmentDetails.CourseSubscriptionMapping != null && userCourseEnrollmentDetails.CourseSubscriptionMapping.ExamType == "VR")
                {
                    string templateNameForVR = _localizer["VrCertificateTemplate"];
                    if (culture == "nl" || culture == "de" || culture == "uk" || culture == "ar")
                    {
                        templateNameForVR = templateNameForVR + "_" + culture;
                    }
                    Template emailTemplateContentForVR = await _templateAppService.GetEmailTemplateContentByTemplateNameAsync(templateNameForVR);
                    htmlContent = emailTemplateContentForVR.HtmlPart;
                    htmlContent = htmlContent.Replace("[User_Name]", courseCertificateDto.UserName);
                    htmlContent = htmlContent.Replace("[Course_Name]", courseCertificateDto.CourseName);
                    htmlContent = htmlContent.Replace("[Completion_Date]", courseCertificateDto.CourseCompletionDate.ToString("dd-MM-yyyy"));
                    htmlContent = htmlContent.Replace("[Expiration_Date]", courseCertificateDto.CertificateExpirationDate.ToString("dd-MM-yyyy"));
                }
                else
                {
                    // Assuming you want to replace placeholders with dynamic data
                    htmlContent = htmlContent.Replace("[User_Name]", courseCertificateDto.UserName);
                    htmlContent = htmlContent.Replace("[Course_Name]", courseCertificateDto.CourseName);
                    htmlContent = htmlContent.Replace("[Percentage]", courseCertificateDto.Percentage.ToString());
                    htmlContent = htmlContent.Replace("[Completion_Date]", courseCertificateDto.CourseCompletionDate.ToString("dd-MM-yyyy"));
                    htmlContent = htmlContent.Replace("[Expiration_Date]", courseCertificateDto.CertificateExpirationDate.ToString("dd-MM-yyyy"));
                }

                Log.Information("Pdf creation starting...");

                PdfOptions pdfOptions = new PdfOptions { Format = PaperFormat.A4 };
                // Create a dynamic object to hold HTML and options
                var messageObject = new
                {
                    html = htmlContent,
                    options = pdfOptions
                };

                // Serialize the object to a JSON string
                string message = JsonConvert.SerializeObject(messageObject);

                Uri uri = new Uri($"ws://{_appOptions.PdfDownloadServerUrl}"); // Replace with your WebSocket server URL
                MemoryStream memoryStream = new MemoryStream();
                using (ClientWebSocket clientWebSocket = new ClientWebSocket())
                {

                    await clientWebSocket.ConnectAsync(uri, CancellationToken.None);

                    Log.Information("Connected to WebSocket server.");

                    await SendMessageAsync(clientWebSocket, message);

                    // Receive messages from the server
                    while (clientWebSocket.State == WebSocketState.Open)
                    {
                        memoryStream = await ReceiveMessageAsync(clientWebSocket);
                        if (memoryStream == null)
                        {
                            throw new UserFriendlyException(_localizer["CertificateContentIsNotAppropriate"], StatusCodes.Status500InternalServerError.ToString());
                        }
                        else
                        {
                            break;
                        }
                    }

                }
                Log.Information("File name creation...");
                string fileName = $"{courseCertificateDto.CourseName}_{DateTime.Now:MM-dd-yyyy-HH:mm:ss}.pdf";

                // Return the file as an API response
                return File(memoryStream.ToArray(), "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message, ex);
                throw new UserFriendlyException($"Some issue in configuration. {ex.Message}", StatusCodes.Status500InternalServerError.ToString());
            }
        }


        static async Task SendMessageAsync(ClientWebSocket clientWebSocket, string message)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(message);
            await clientWebSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        static async Task<MemoryStream> ReceiveMessageAsync(ClientWebSocket clientWebSocket)
        {
            const int bufferSize = 1024 * 45; // Adjust the buffer size as needed

            using (var memoryStream = new MemoryStream())
            {
                byte[] buffer = new byte[bufferSize];
                WebSocketReceiveResult result;

                do
                {
                    result = await clientWebSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                    memoryStream.Write(buffer, 0, result.Count);

                } while (!result.EndOfMessage);

                byte[] messageBytes = memoryStream.ToArray();
                string message = Encoding.UTF8.GetString(messageBytes);

                // Check if the message is an error
                bool isError = message.StartsWith("Error:");
                if (isError)
                {
                    throw new UserFriendlyException($"{message}");
                }

                return memoryStream;
            }
        }
    }
}
