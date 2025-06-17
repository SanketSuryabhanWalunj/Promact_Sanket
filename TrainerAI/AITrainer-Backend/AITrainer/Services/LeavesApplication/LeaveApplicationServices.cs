
using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.Core.Dto.Notification;
using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.LeavesApplication;
using AITrainer.AITrainer.Repository.User;
using AITrainer.AITrainer.Util;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR.Protocol;
using System.Linq;
using System.Security.Claims;
using static Mysqlx.Notice.Warning.Types;

namespace AITrainer.Services.LeaveApplications
{
    public class LeaveApplicationServices : ILeaveApplicationService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILeaveApplicationRepository _leaveApplicationRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public LeaveApplicationServices(IHttpContextAccessor httpContextAccessor, ILeaveApplicationRepository leaveApplicationRepository, IUserRepository userRepository, IEmailService emailService,IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _leaveApplicationRepository = leaveApplicationRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _configuration = configuration;
        }


        /// <summary>
        /// Applies for leave based on the provided leave application request.
        /// </summary>
        /// <param name="request">The leave application request</param>
        /// <returns>The leave application details if successfully applied</returns>
        public async Task<LeaveApplication> ApplyLeave(LeaveApplicationDto request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }
            else
            {
                var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var intern = await _leaveApplicationRepository.GetInternDetails(userId);
                var totalDays = await _leaveApplicationRepository.FindTotalDays(request.leaveStartDate, request.leaveEndDate, intern.Id, request.leaveType);
                List<AdminEmailModel> admin = await _leaveApplicationRepository.GetAdminsInInternship(intern.Id);

                var newApplication = new LeaveApplication
                {
                    Id = Guid.NewGuid().ToString(),
                    InternId = intern.Id,
                    leaveStartDate = request.leaveStartDate,
                    leaveEndDate = request.leaveEndDate,
                    leaveType = request.leaveType,
                    totalDay = totalDays,
                    leaveReason = request.leaveReason,
                    leaveStatus = "Pending",
                    leaveCategory = request.leaveCategory,
                    isDeleted = false,
                    createdDate = DateTime.UtcNow,
                    createdBy = userId,
                    updatedBy = intern.Id,
                    updatedDate = DateTime.UtcNow,
                };
                if (request.Files != null)
                {
                    foreach (IFormFile file in request.Files)
                    {
                        using (MemoryStream memoryStream = new MemoryStream())
                        {
                            await file.CopyToAsync(memoryStream);
                            byte[] fileData = memoryStream.ToArray();
                            newApplication.Attachments.Add(new LeaveDocumentAttachment
                            {
                                Id = Guid.NewGuid().ToString(),
                                LeaveApplicationId = newApplication.Id,
                                FileName = file.FileName,
                                FileData = fileData,
                                IsDeleted = false
                            });
                        }
                    }

                };
                LeaveNotificationModel model = new LeaveNotificationModel();
                {
                    model.InternFirstName = intern.FirstName;
                    model.InternLastName = intern.LastName;
                    model.leaveStartDate = request.leaveStartDate;
                    model.leaveEndDate = request.leaveEndDate;
                    model.leaveDuration = (newApplication.leaveCategory == "First Half" || newApplication.leaveCategory == "Second Half") ? 0.5 : totalDays;
                    model.leaveReason = request.leaveReason;
                    model.leaveType = request.leaveType;
                    model.URL = GetIncomingDomainName();
                };
                string MentorMailsubject = EmailSubjects.LeaveRequestSubject(model.leaveStartDate, model.leaveEndDate, model.InternFirstName, model.InternLastName);
                if (admin.Count > 0)
                {
                    foreach (var email in admin)
                    {
                        model.AdminName = email.Name;
                        string internEmailBody = NotificationTemplates.GetLeaveApplicationEmailBody(model);
                        await _emailService.SendEmailAsync(email.Email, MentorMailsubject, internEmailBody);
                    }
                }
                await _leaveApplicationRepository.AddLeave(newApplication);
                return newApplication;
            }
        }


        /// <summary>
        /// Retrieves leave applications of the current intern based on an optional filter.
        /// </summary>
        /// <param name="filter">Optional filter for leave status</param>
        /// <returns>The list of leave applications</returns>
        public async Task<List<LeaveApplicationsDto>> GetInternsLeave(string? filter)
        {

            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var intern = await _leaveApplicationRepository.GetInternDetails(userId);
            var leaveApplications = await _leaveApplicationRepository.GetLeaveDetails(intern.Id);
            var users = await _userRepository.GetListOfUsers();
            List<LeaveApplicationsDto> leaveApplicationsDto = (from leave in leaveApplications
                                                               join user in users
                                                               on leave.approvedBy equals user.Id into userGroup
                                                               from user in userGroup.DefaultIfEmpty()
                                                               select new LeaveApplicationsDto
                                                               {
                                                                   Id = leave.Id,
                                                                   InternId = leave.InternId,
                                                                   leaveStartDate = leave.leaveStartDate,
                                                                   leaveEndDate = leave.leaveEndDate,
                                                                   totalDay = leave.totalDay,
                                                                   leaveType = leave.leaveType,
                                                                   leaveReason = leave.leaveReason,
                                                                   leaveStatus = leave.leaveStatus,
                                                                   leaveCategory = leave.leaveCategory,
                                                                   isDeleted = leave.isDeleted,
                                                                   approvedBy = user != null ? user.FirstName + " " + user.LastName : "Not Approved",
                                                                   approvedDate = leave.approvedDate,
                                                                   Comments = leave.Comments,
                                                                   createdBy = leave.createdBy,
                                                                   createdDate = leave.createdDate,
                                                                   updatedBy = leave.updatedBy,
                                                                   updatedDate = leave.updatedDate,
                                                                   Attachments = leave.Attachments.Select(p => new LeaveDocumentAttachmentDto
                                                                   {
                                                                       Id = p.Id,
                                                                       FileName = p.FileName,
                                                                       FileData = Convert.ToBase64String(p.FileData),

                                                                   }).ToList(),
                                                               }).ToList();
            if (filter != null)
            {
                leaveApplicationsDto = leaveApplicationsDto.Where(i => i.leaveStatus == filter)
                    .OrderBy(i => i.createdDate)
                    .ToList();
            }
            return leaveApplicationsDto;
        }


        /// <summary>
        /// Retrieves the leave history of interns under the current admin, optionally filtered by leave status.
        /// </summary>
        /// <param name="filter">Optional filter for leave status</param>
        /// <param name="filterName">Optional filter for intern name</param>
        /// <param name="filterduration">Optional filter for leave duration</param>
        /// <returns>The list of leave applications with additional admin view details</returns>
        public async Task<List<AdminLeaveView>> GetInternsLeaveHistory(string? filter, string? filterName, int? filterduration)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var admin = await _leaveApplicationRepository.GetAdminsInOrganization(userId);
            List<LeaveApplication> allLeaveDetails = new List<LeaveApplication>();

            foreach (var admins in admin)
            {
                var result = await _leaveApplicationRepository.GetLeaveDetailsIntern(admins);
                allLeaveDetails.AddRange(result);
            }

            List<AdminLeaveView> adminViews = new List<AdminLeaveView>();
            foreach (var intern in allLeaveDetails)
            {
                if (!adminViews.Any(av => av.Id == intern.Id))
                {
                    var name = await _leaveApplicationRepository.GetInternName(intern.InternId);
                    var user = await _userRepository.FindByIdAsync(intern.updatedBy);
                    var newResult = new AdminLeaveView
                    {
                        Id = intern.Id,
                        InternId = intern.InternId,
                        Name = name,
                        leaveStartDate = intern.leaveStartDate,
                        leaveEndDate = intern.leaveEndDate,
                        leaveStatus = intern.leaveStatus,
                        leaveReason = intern.leaveReason,
                        totalDay = intern.totalDay,
                        leaveType = intern.leaveType,
                        updatedBy = user != null ? user.FirstName + " " + user.LastName : "",
                        leaveCategory = intern.leaveCategory,
                        createdDate = intern.createdDate,
                        Attachments = intern.Attachments?.Select(p => new LeaveDocumentAttachmentDto
                        {
                            Id = p.Id,
                            FileName = p.FileName,
                            FileData = Convert.ToBase64String(p.FileData)

                        }).ToList(),
                    };
                    adminViews.Add(newResult);
                }
                if (filter != null)
                {
                    adminViews = adminViews.Where(i => i.leaveStatus == filter).ToList();
                }
                if (filterName != null)
                {
                    adminViews = adminViews.Where(i => i.Name == filterName).ToList();
                }
                if (filterduration != null)
                {
                    adminViews = adminViews.Where(i => i.totalDay == filterduration).ToList();
                }
            }

            return adminViews.OrderByDescending(y => y.createdDate).ToList();
        }


        /// <summary>
        /// Processes the response for a leave application, updating its status and adding comments.
        /// </summary>
        /// <param name="response">The leave response DTO containing response details</param>
        /// <returns>The updated leave application</returns>
        public async Task<LeaveApplication> GiveResponse(LeaveResponseDto response)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string adminName = await _leaveApplicationRepository.GetAdminName(userId);
            var leaveForApproval = await _leaveApplicationRepository.GetLeaveDetailsById(response.leaveId);
            string internName = await _leaveApplicationRepository.GetInternName(leaveForApproval.InternId);
            string internemail = await _leaveApplicationRepository.GetInternEmail(leaveForApproval.InternId);
            LeaveNotificationModel model = new LeaveNotificationModel()
            {
                InternFirstName = internName,
                leaveStartDate = leaveForApproval.leaveStartDate,
                leaveEndDate = leaveForApproval.leaveEndDate,
                leaveReason = leaveForApproval.leaveReason,
                leaveDuration = leaveForApproval.totalDay,
                leaveStatus = response.leaveStatus,
                RequestedOn = leaveForApproval.createdDate,
                Comments = response.Comments,
                UpdatedDate = DateTime.UtcNow,
                leaveType = leaveForApproval.leaveType,
                ApprovedBy = adminName,
            };
            leaveForApproval.leaveStatus = response.leaveStatus;
            leaveForApproval.Comments = response.Comments;
            leaveForApproval.approvedBy = userId;
            leaveForApproval.approvedDate = DateTime.UtcNow;
            leaveForApproval.updatedBy = userId;
            leaveForApproval.updatedDate = DateTime.UtcNow;
            await _leaveApplicationRepository.UpdateLeave(leaveForApproval);

            string InternMailsubject = EmailSubjects.LeaveApproveRejectSubject(model.leaveStartDate, model.leaveEndDate, model.leaveStatus);
            string internEmailBody = NotificationTemplates.GetLeaveApprovalEmailBody(model);
            await _emailService.SendEmailAsync(internemail, InternMailsubject, internEmailBody);
            return leaveForApproval;
        }


        /// <summary>
        /// Deletes a leave application based on the provided ID.
        /// </summary>
        /// <param name="id">The ID of the leave application to delete</param>
        /// <returns>True if the leave application was successfully deleted; otherwise, false</returns>
        public async Task<bool> DeleteLeave(string id)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Intern intern = await _leaveApplicationRepository.GetInternDetails(userId);
                List<AdminEmailModel> admin = await _leaveApplicationRepository.GetAdminsInInternship(intern.Id);
                List<LeaveApplication> allLeaveDetails = new List<LeaveApplication>();
                foreach (var admins in admin)
                {
                    var result = await _leaveApplicationRepository.GetLeaveDetailsIntern(admins.Id);
                    allLeaveDetails.AddRange(result);
                }

                var leaveToDelete = await _leaveApplicationRepository.GetLeaveDetailsById(id);
                if (leaveToDelete != null)
                {
                    leaveToDelete.isDeleted = true;
                    leaveToDelete.updatedDate = DateTime.UtcNow;
                    leaveToDelete.updatedBy = userId;
                    await _leaveApplicationRepository.UpdateLeave(leaveToDelete);
                    LeaveNotificationModel model = new LeaveNotificationModel();
                    {
                        model.InternFirstName = intern.FirstName;
                        model.InternLastName = intern.LastName;
                        model.leaveStartDate = leaveToDelete.leaveStartDate;
                        model.leaveEndDate = leaveToDelete.leaveEndDate;
                        model.leaveDuration = leaveToDelete.totalDay;
                        model.leaveReason = leaveToDelete.leaveReason;
                        model.leaveType = leaveToDelete.leaveType;

                    };
                    string MentorMailsubject = EmailSubjects.LeaveRequestDeletionSubject(model.leaveStartDate, model.leaveEndDate, model.InternFirstName, model.InternLastName);
                    if (admin.Count > 0)
                    {
                        foreach (var email in admin)
                        {
                            model.AdminName = email.Name;
                            string internEmailBody = NotificationTemplates.GetLeaveRequestDeletionEmailBody(model);
                            bool response = await _emailService.SendEmailAsync(email.Email, MentorMailsubject, internEmailBody);
                        }
                    }
                    return true;
                }
                else
                {
                    return false;
                }
            }
            catch (Exception ex)
            {
                throw;

            }
        }


        /// <summary>
        /// Retrieves the dates of approved leave applications for the current user.
        /// </summary>
        /// <returns>An array of DateTime objects representing the approved leave dates</returns>
        public async Task<DateTime[]> GetLeaveDates()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var intern = await _leaveApplicationRepository.GetInternDetails(userId);
            var result = await _leaveApplicationRepository.GetLeaveDates(intern.Id);
            return result;
        }
        /// <summary>
        /// Retrieves the leave history of interns under the current admin
        /// </summary>
        /// <returns>The list of leave applications with additional admin view details</returns>
        public async Task<List<AdminLeaveView>> GetAllInternsLeaveHistory()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<string> admin = await _leaveApplicationRepository.GetAdminsInOrganization(userId);
            List<LeaveApplication> allInternLeaveDetails = new List<LeaveApplication>();
            foreach (var admins in admin)
            {
                List<LeaveApplication> result = await _leaveApplicationRepository.GetLeaveDetailsIntern(admins);
                allInternLeaveDetails.AddRange(result);
            }
            List<AdminLeaveView> adminViews = new List<AdminLeaveView>();
            foreach (var intern in allInternLeaveDetails)
            {
                if (!adminViews.Any(av => av.Id == intern.Id))
                {
                    string name = await _leaveApplicationRepository.GetInternName(intern.InternId);
                    AdminLeaveView newResult = new AdminLeaveView
                    {
                        Id = intern.Id,
                        InternId = intern.InternId,
                        Name = name,
                        leaveStartDate = intern.leaveStartDate,
                        leaveEndDate = intern.leaveEndDate,
                        leaveStatus = intern.leaveStatus,
                        leaveReason = intern.leaveReason,
                        totalDay = intern.totalDay,
                        leaveType = intern.leaveType,
                    };
                    adminViews.Add(newResult);
                }
            }
            return adminViews;

        }
        private string GetIncomingDomainName()
        {
            var request = _httpContextAccessor.HttpContext?.Request;

            if (request == null)
            {
                return "Unknown URL";
            }
            string host = request.Host.ToString();
            string fullUrl;
            if (host == "localhost:44352")
            {
                fullUrl = _configuration["Urls:frontendUrl"] + "/User/Login";
            }
            else if (host == "dev-aitrainer-api.promactinfo.xyz")
            {
                fullUrl = _configuration["Urls:devLink"] + "/#/login";
            }
            else
            {
                fullUrl = _configuration["Urls:prodLink"] + "/#/login";
            }
            return fullUrl;
        }

    }
}

