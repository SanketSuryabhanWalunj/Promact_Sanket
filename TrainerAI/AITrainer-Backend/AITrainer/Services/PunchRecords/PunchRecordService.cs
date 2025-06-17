using AITrainer.AITrainer.Core.Dto;
using AITrainer.AITrainer.Core.Dto.Notification;
using AITrainer.AITrainer.Core.Dto.PunchRecords;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Batches;
using AITrainer.AITrainer.Repository.PunchRecords;
using AITrainer.AITrainer.Repository.User;
using AITrainer.AITrainer.Util;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Security.Claims;
using System.Text;

namespace AITrainer.Services.PunchRecords
{
    public class PunchRecordService : IPunchRecordService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IPunchRecordsRepository _punchRecordsRepository;
        private readonly IUserRepository _userRepository;
        private readonly IEmailService _emailService;
        private readonly IBatchRepository _batchRepository;
        private readonly IConfiguration _configuration;

        public PunchRecordService(IHttpContextAccessor httpContextAccessor, IPunchRecordsRepository punchRecordsRepository, IUserRepository userRepository, IEmailService emailService, IBatchRepository batchRepository,IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _punchRecordsRepository = punchRecordsRepository;
            _userRepository = userRepository;
            _emailService = emailService;
            _batchRepository = batchRepository;
            _configuration = configuration;
        }
        /// <summary>
        /// Adds punchrecord and punchlogtime when intern checkIn and checkOut
        /// </summary>
        /// <param name="punchRecord">To insert the punchRecord and punchlogtime</param>
        public async Task<PunchRecord> AddPunchIn(PunchRecordsDto punchRecord)
        {
            if (punchRecord == null)
            {
                throw new ArgumentNullException(nameof(punchRecord));
            }
            else
            {
                var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var intern = await _punchRecordsRepository.GetInternDetails(userId);

                GetPunchRecordsDto getPunchRecords = new GetPunchRecordsDto()
                {
                    Punchdate = DateTime.UtcNow,
                };

                PunchRecord ispunchRecords = null;

                if (intern != null)
                {
                    ispunchRecords = await _punchRecordsRepository.IsCheckPunchtime(getPunchRecords, intern.Id);
                }
                if (ispunchRecords == null)
                {
                    var punchrecord = new PunchRecord
                    {
                        Id = Guid.NewGuid().ToString(),
                        InternId = intern.Id,
                        PunchDate = DateTime.UtcNow,
                        IsPunch = true,
                        Comments = punchRecord.Comments,
                        approvedBy = punchRecord.approvedBy,
                        approvedDate = null,
                    };
                    await _punchRecordsRepository.AddPunchIn(punchrecord);
                    if (punchRecord.IsPunch)
                    {
                        var punlogtime = new PunchLogTime
                        {
                            Id = Guid.NewGuid().ToString(),
                            PunchRecordId = punchrecord.Id,
                            PunchIn = DateTime.UtcNow,
                            IsPunchLog = true,
                        };
                        await _punchRecordsRepository.AddPunchInLogTime(punlogtime);
                    }

                }
                else
                {
                    if (ispunchRecords.IsPunch)
                    {
                        ispunchRecords.IsPunch = false;
                        await _punchRecordsRepository.UpdatePunchIn(ispunchRecords);
                        if (!ispunchRecords.IsPunch)
                        {
                            ispunchRecords.PunchLogTime[0].PunchOut = DateTime.UtcNow;
                            ispunchRecords.PunchLogTime[0].IsPunchLog = false;
                            ispunchRecords.PunchLogTime[0].TotalTimeSpan = (TimeSpan)(ispunchRecords.PunchLogTime[0].PunchOut - ispunchRecords.PunchLogTime[0].PunchIn);
                            await _punchRecordsRepository.UpdatePunchLogOut(ispunchRecords.PunchLogTime[0]);
                        }
                    }
                    else
                    {
                        ispunchRecords.IsPunch = true;
                        await _punchRecordsRepository.UpdatePunchIn(ispunchRecords);
                        if (punchRecord.IsPunch)
                        {
                            var punlogtime = new PunchLogTime
                            {
                                Id = Guid.NewGuid().ToString(),
                                PunchRecordId = ispunchRecords.Id,
                                PunchIn = DateTime.UtcNow,
                                IsPunchLog = true,
                            };
                            await _punchRecordsRepository.AddPunchInLogTime(punlogtime);
                        }
                    }

                }
                return ispunchRecords;
            }
        }
        /// <summary>
        /// Gets punchLogtime details 
        /// </summary>
        /// <param name="getPunchRecordsDto">To checks the punchLogtime is there or not</param>
        public async Task<GetPunchResponseDto> GetCheckPunchtime(GetPunchRecordsDto getPunchRecordsDto)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var intern = await _punchRecordsRepository.GetInternDetails(userId);
            PunchRecord punchRecord = null;

            if (intern != null)
            {
                punchRecord = await _punchRecordsRepository.GetCheckPunchtime(getPunchRecordsDto, intern.Id);

            }

            if (punchRecord != null)
            {
                var firstPunchLogTime = punchRecord.PunchLogTime

                    .FirstOrDefault();

                punchRecord.PunchLogTime = new List<PunchLogTime>();
                if (firstPunchLogTime != null)
                {
                    punchRecord.PunchLogTime.Add(firstPunchLogTime);
                }

            }
            GetPunchResponseDto getPunchResponseDto = new GetPunchResponseDto();
            if (punchRecord == null)
            {
                getPunchResponseDto.PunchLogInTime = null;
                getPunchResponseDto.isPunch = false;
                getPunchResponseDto.PunchLogOutTime = null;
            }
            else
            {
                if (punchRecord.IsPunch)
                {
                    getPunchResponseDto.isPunch = true;
                    getPunchResponseDto.PunchLogInTime = punchRecord.PunchLogTime.Count > 0 ? punchRecord.PunchLogTime[0].PunchIn : DateTime.UtcNow;
                    getPunchResponseDto.PunchLogOutTime = punchRecord.PunchLogTime.Count > 0 ? punchRecord.PunchLogTime[0].PunchOut : DateTime.UtcNow;

                }
                else
                {
                    getPunchResponseDto.PunchLogInTime = DateTime.UtcNow;
                    getPunchResponseDto.isPunch = false;
                    getPunchResponseDto.PunchLogOutTime = punchRecord.PunchLogTime.Count > 0 ? punchRecord.PunchLogTime[0].PunchOut : DateTime.UtcNow;

                }
            }
            if (intern != null)
            {
                getPunchResponseDto.InternStartDate = intern.CreatedDate;
            }
            return getPunchResponseDto;
        }
        /// <summary>
        /// Insert record when intern missed his punchOut or punchin
        /// </summary>
        /// <param name="requestPunchDto">updates punchout in punchLogTime</param>
        public async Task<PunchRecord> IsRequestPunchOut(RequestPunchDto requestPunchDto)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var intern = await _punchRecordsRepository.GetInternDetails(userId);
            var admin = await _punchRecordsRepository.GetAdminsInInternship(intern.Id);
            PunchRecord punchRecord = new PunchRecord();
            StringBuilder RequestPunches = new StringBuilder();
            DateTime punchDate = requestPunchDto.RequestedPunchOutTime;
            PunchRecordRequests punchRecordRequests = new PunchRecordRequests();
            DateTime PunchIn = PunchIn = new DateTime(punchDate.Year, punchDate.Month, punchDate.Day, 5, 30, 0).AddHours(-5).AddMinutes(-30).ToUniversalTime();
            if (requestPunchDto == null)
            {
                throw new ArgumentNullException(nameof(requestPunchDto));
            }
            else
            {

                foreach (var punches in requestPunchDto.PunchInandOut)
                {
                    RequestPunches.Append(punches);
                    if (punches != requestPunchDto.PunchInandOut.Last())
                    {
                        RequestPunches.Append(",");
                    }

                }
                punchRecordRequests.Id = Guid.NewGuid().ToString();
                punchRecordRequests.InternId = intern.Id;
                punchRecordRequests.RequestDate = punchDate;
                punchRecordRequests.RequestPunches = RequestPunches.ToString();
                punchRecordRequests.RequestedOn = DateTime.UtcNow;
                punchRecordRequests.RequestReason = requestPunchDto.Comments;
                punchRecordRequests.status = "Pending";
                punchRecordRequests = await _punchRecordsRepository.AddPunchRecordRequests(punchRecordRequests);
                PunchRequestNotificationModel notificationModel = new PunchRequestNotificationModel
                {
                    InternFirstName = intern.FirstName,
                    InternLastName = intern.LastName,
                    PunchDate = requestPunchDto.RequestedPunchOutTime,
                    Punches = FormatPuncesForAMPM(RequestPunches.ToString()),
                    Comments = requestPunchDto.Comments,
                    RequestedOn = DateTime.UtcNow,
                    URL = GetIncomingDomainName(),
                };
                string MentorMailsubject = EmailSubjects.RequestPunchSubject(notificationModel.InternFirstName, notificationModel.InternLastName, notificationModel.PunchDate);
                if (admin.Count > 0)
                {
                    foreach (var email in admin)
                    {
                        notificationModel.AdminName = email.Name;
                        string internEmailBody = NotificationTemplates.GetPunchRequestEmailBody(notificationModel);
                        await _emailService.SendEmailAsync(email.Email, MentorMailsubject, internEmailBody);
                    }
                }
            }
            return punchRecord;
        }
        /// <summary>
        /// Get all Punchrequest details based on startdate and enddate
        /// </summary>
        /// <param name="startdate">get details based on startdate</param>
        /// <param name="enddate">get details based on enddate</param>
        public async Task<GetListPunchRecordsDto> GetAllPunchDetails(DateTime startdate, DateTime enddate)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Intern intern = await _punchRecordsRepository.GetInternDetails(userId);
            DateTime internStartdate = intern.CreatedDate.ToUniversalTime();
            List<LeavePunchDto> leaveApplications = await _punchRecordsRepository.GetLeaveDetails(intern.Id, startdate, enddate);
            Batch internBatch = await _batchRepository.GetBatchByUserId(userId);
            List<PunchRecord> punchRecord = await _punchRecordsRepository.GetAllPunchDetails(intern, startdate, enddate);
            List<PunchRequestStartEndDateDto> punchRequests = await _punchRecordsRepository.GetPunchRequestDetailsByStartEndDate(intern.Id, startdate.Date, enddate.Date);
            List<ListPunchRecordsDto> punchRecordsDto = new List<ListPunchRecordsDto>();
            if (punchRecord.Count > 0)
            {
                punchRecordsDto = punchRecord.Select(p => new ListPunchRecordsDto
                {
                    Id = p.Id,
                    InternId = p.InternId,
                    PunchDate = p.PunchDate,
                    IsPunch = p.IsPunch,
                    IsStartDate = false,
                    punchLogTime = p.PunchLogTime.Select(pl => new ListPunchLogTimeDto
                    {
                        Id = pl.Id,
                        IsPunchLog = pl.IsPunchLog,
                        PunchIn = pl.PunchIn,
                        PunchOut = pl.PunchOut,
                        IsPunchLogin = pl.IsPunchLogin,
                        IsPunchLogOut = pl.IsPunchLogOut,
                        PunchRecordId = pl.PunchRecordId,
                        TotalTimeSpan = pl.TotalTimeSpan,
                        IsDeleted = pl.IsDeleted,
                    }).ToList()
                }).ToList();
                foreach (ListPunchRecordsDto punchDto in punchRecordsDto)
                {
                    LeavePunchDto? leaveApplication = IsApplyleave(leaveApplications, punchDto.PunchDate);
                    punchDto.RequestStatus = await IsPunchRequest(intern.Id, punchDto.PunchDate);
                    punchDto.IsApplyLeave = leaveApplication != null;
                    punchDto.LeaveStatus = leaveApplication?.LeaveStatus ?? string.Empty;
                }
            }
            InternBatchDto internBatchDto = new InternBatchDto()
            {
                BatchName = internBatch.BatchName,
                WeekdaysNames = internBatch.WeekdaysNames
            };
            GetListPunchRecordsDto getListPunchRecordsDto = new GetListPunchRecordsDto()
            {
                punchRecords = punchRecordsDto,
                leavePunchRecords = leaveApplications,
                punchRequestStartEndDateDtos = punchRequests,
                IsBatch = internBatchDto,

            };

            return getListPunchRecordsDto;
        }
        /// <summary>
        /// Get all Punchrequest details based on startdate and enddate
        /// </summary>
        /// <returns>List of all intern request details</returns>
        public async Task<List<PunchRecordRequestsDto>> GetInternsRequest()
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                Intern intern = await _punchRecordsRepository.GetInternDetails(userId);
                List<PunchRecordRequests> requestApplications = await _punchRecordsRepository.GetAllpunchRequestDetails(intern);
                var users = await _userRepository.GetListOfUsers();
                var internRequestDetailsDto = (await Task.WhenAll(requestApplications.Select(async x => new PunchRecordRequestsDto
                {
                    Id = x.Id,
                    InternId = x.InternId,
                    RequestDate = x.RequestDate,
                    RequestPunches = await stringToDate(x.RequestDate, x.RequestPunches),
                    status = x.status,
                    RequestReason = x.RequestReason,
                    ApprovedBy = x.ApprovedBy,
                    ApprovedDate = x.ApprovedDate,
                    IsDeleted = x.IsDeleted,

                }))).ToList();
                return internRequestDetailsDto;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        /// <summary>
        /// Get all intern Punchrequest details for admin
        /// </summary>
        /// <returns>List of all GetAllInternRequestHistoryForAdmin</returns>
        public async Task<List<AdminInternPunchRecordRequestDetailsDto>> GetAllInternRequestHistoryForAdmins()
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<string> admin = await _punchRecordsRepository.GetAdminsInOrganization(userId);
            List<PunchRecordRequests> allpunchDetails = new List<PunchRecordRequests>();
            List<AdminInternPunchRecordRequestDetailsDto> adminInternRequestDetailsDto = new List<AdminInternPunchRecordRequestDetailsDto>();
            foreach (var admins in admin)
            {
                var result = await _punchRecordsRepository.GetPunchAdminRecordbyIntern(admins);
                allpunchDetails.AddRange(result);
            }

            if (allpunchDetails.Count > 0)
            {

                foreach (var punch in allpunchDetails)
                {
                    if (!adminInternRequestDetailsDto.Any(av => av.Id == punch.Id))
                    {
                        var user = await _userRepository.FindByIdAsync(punch.ApprovedBy);
                        var username = await _punchRecordsRepository.GetInternName(punch.InternId);
                        AdminInternPunchRecordRequestDetailsDto requestHistoryForAdmin = new AdminInternPunchRecordRequestDetailsDto
                        {
                            Id = punch.Id,
                            InternId = punch.InternId,
                            InternName = username,
                            Date = punch.RequestDate,
                            RequestPunches = await stringToDate(punch.RequestDate, punch.RequestPunches),
                            RequestedOn = punch.RequestedOn,
                            Comments = punch.RequestReason,
                            Status = punch.status,
                            IsDeleted = punch.IsDeleted,
                            RequestReason = punch.RequestReason,
                            approvedBy = user != null ? user.FirstName + " " + user.LastName : "Not Approved",
                            approvedDate = punch.ApprovedDate
                        };
                        adminInternRequestDetailsDto.Add(requestHistoryForAdmin);
                    }
                }
            }
            return adminInternRequestDetailsDto.OrderByDescending(pr => pr.RequestedOn).ToList();

        }
        /// <summary>
        /// Admin can approve or reject the request punch
        /// </summary>
        /// <returns>List of all intern punch record</  returns>
        public async Task<PunchRecord> PunchRequestApprovedOrRejected(AdminInternApprovalRequestDto requestedApprovedOrNot)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string adminName = await _punchRecordsRepository.GetAdminName(userId);
            PunchRecord punchRecord = new PunchRecord();
            var intern = await _punchRecordsRepository.GetInternDetailsForEmail(requestedApprovedOrNot.InternId);
            string internemail = await _punchRecordsRepository.GetInternEmail(requestedApprovedOrNot.InternId);
            PunchRecordRequests punchRecordRequests = await _punchRecordsRepository.GetPunchRequestRecordbyIntern(requestedApprovedOrNot.PunchId, requestedApprovedOrNot.InternId);
            PunchRecordRequests punchRecordRequestsDate = await _punchRecordsRepository.GetPunchRequestRecordbyInternPunchDate(punchRecordRequests.RequestDate.Date, requestedApprovedOrNot.InternId);
            List<string> requestPunches = await FormatPunches(punchRecordRequests.RequestPunches);
            DateTime PunchDate = DateTime.UtcNow;
            if (punchRecordRequests != null)
            {
                PunchDate = DateTime.SpecifyKind(punchRecordRequests.RequestDate, DateTimeKind.Utc);
            }
            PunchRecord punchRecord1 = await _punchRecordsRepository.GetPunchRecordbyInternanddate(requestedApprovedOrNot.InternId, PunchDate);

            try
            {
                if (requestedApprovedOrNot.Status == "Approved")
                {
                    int punchCount = punchRecord1?.PunchLogTime != null ? punchRecord1.PunchLogTime.Count : 0;
                    List<string> punchLogTimes = new List<string>();
                    if (punchRecord1?.PunchLogTime != null)
                    {
                        punchLogTimes = await PunchDateToString(punchRecord1.PunchLogTime.Where(p => !p.IsDeleted).ToList());
                    }
                    List<string> ApprovedLists = await MergeToLists(requestPunches, punchLogTimes);
                    double count = ApprovedLists.Count / 2.0;
                    int resualtCount = (int)Math.Ceiling(count);
                    if (punchRecord1 == null)
                    {
                        punchRecord.Id = Guid.NewGuid().ToString();
                        punchRecord.PunchDate = punchRecordRequests.RequestDate;
                        punchRecord.InternId = punchRecordRequests.InternId;
                        punchRecord1 = await _punchRecordsRepository.AddPunchIn(punchRecord);
                    }
                    if (punchRecord1 != null)
                    {
                        int punchinsert = 0;
                        int ipunchrecords = 0;
                        for (int i = 0; i < resualtCount; i++)
                        {

                            if (ipunchrecords < punchCount)
                            {
                                DateTime punchIn = DateTime.UtcNow;
                                DateTime? punchOut = DateTime.UtcNow;
                                if (TimeSpan.TryParse(ApprovedLists[punchinsert], out TimeSpan parsedTimein))
                                {
                                    DateTime localDateTimein = punchRecordRequests.RequestDate.Date + parsedTimein;
                                    punchIn = localDateTimein.Subtract(new TimeSpan(5, 30, 0));
                                }
                                punchRecord1.PunchLogTime[ipunchrecords].PunchIn = punchIn;
                                if (TimeSpan.TryParse(ApprovedLists[punchinsert + 1], out TimeSpan parsedTimeout))
                                {
                                    DateTime localDateTimeOut = punchRecordRequests.RequestDate.Date + parsedTimeout;
                                    punchOut = localDateTimeOut.Subtract(new TimeSpan(5, 30, 0));
                                    punchRecord1.PunchLogTime[ipunchrecords].IsPunchLog = false;
                                    punchRecord1.IsPunch = false;
                                }
                                else
                                {
                                    punchOut = null;
                                    punchRecord1.PunchLogTime[ipunchrecords].IsPunchLog = true;
                                    punchRecord1.IsPunch = true;
                                }
                                punchRecord1.PunchLogTime[ipunchrecords].PunchOut = punchOut;

                                if (requestPunches.Contains(ApprovedLists[punchinsert]))
                                {
                                    punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogin = true;
                                }
                                else
                                {
                                    punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogin = false;
                                }
                                if (requestPunches.Contains(ApprovedLists[punchinsert + 1]))
                                {
                                    punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogOut = true;

                                }
                                else
                                {
                                    punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogOut = false;

                                }
                                punchRecord1.PunchLogTime[ipunchrecords].IsDeleted = false;
                                if (punchOut != null)
                                {
                                    punchRecord1.PunchLogTime[ipunchrecords].TotalTimeSpan = (TimeSpan)(punchRecord1.PunchLogTime[ipunchrecords].PunchOut - punchRecord1.PunchLogTime[ipunchrecords].PunchIn);

                                }
                                await _punchRecordsRepository.UpdatePunchLogOut(punchRecord1.PunchLogTime[ipunchrecords]);
                            }
                            else
                            {
                                DateTime punchIn = DateTime.UtcNow;
                                DateTime punchOut = DateTime.UtcNow;
                                PunchLogTime punchLogTime = new PunchLogTime();
                                punchLogTime.Id = Guid.NewGuid().ToString();
                                punchLogTime.IsPunchLogin = false;
                                punchLogTime.IsPunchLogOut = false;
                                punchLogTime.PunchRecordId = punchRecord1.Id;
                                if (TimeSpan.TryParse(ApprovedLists[punchinsert], out TimeSpan parsedTimein))
                                {
                                    DateTime localDateTimein = punchRecordRequests.RequestDate.Date + parsedTimein;
                                    punchLogTime.PunchIn = localDateTimein.Subtract(new TimeSpan(5, 30, 0));

                                }
                                if (TimeSpan.TryParse(ApprovedLists[punchinsert + 1], out TimeSpan parsedTimeout))
                                {
                                    DateTime localDateTimeOut = punchRecordRequests.RequestDate.Date + parsedTimeout;
                                    punchLogTime.PunchOut = localDateTimeOut.Subtract(new TimeSpan(5, 30, 0));
                                    punchLogTime.IsPunchLog = false;
                                    punchRecord1.IsPunch = false;
                                }
                                else
                                {
                                    punchLogTime.PunchOut = null;
                                    punchLogTime.IsPunchLog = true;
                                    punchRecord1.IsPunch = true;
                                }
                                if (requestPunches.Contains(ApprovedLists[punchinsert]))
                                {
                                    punchLogTime.IsPunchLogin = true;
                                }
                                else
                                {
                                    punchLogTime.IsPunchLogin = false;
                                }
                                if (requestPunches.Contains(ApprovedLists[punchinsert + 1]))
                                {
                                    punchLogTime.IsPunchLogOut = true;
                                }
                                else
                                {
                                    punchLogTime.IsPunchLogOut = false;
                                }

                                if (punchLogTime.PunchOut != null)
                                {
                                    punchLogTime.TotalTimeSpan = (TimeSpan)(punchLogTime.PunchOut - punchLogTime.PunchIn);
                                }
                                await _punchRecordsRepository.AddPunchInLogTime(punchLogTime);
                            }
                            ipunchrecords++;
                            punchinsert = punchinsert + 2;
                        }
                        punchRecordRequests.status = "Approved";
                        punchRecordRequests.ApprovedDate = DateTime.UtcNow;
                        punchRecordRequests.ApprovedBy = userId;
                        punchRecordRequests = await _punchRecordsRepository.UpdatePunchRecordRequest(punchRecordRequests);

                    }
                }
                else
                {
                    if (punchRecord1 != null)
                    {
                        int punchCount = punchRecord1?.PunchLogTime != null ? punchRecord1.PunchLogTime.Count : 0;
                        List<string> punchLogTimes = new List<string>();
                        int punchinsert = 0;
                        int ipunchrecords = 0;
                        if (punchRecord1?.PunchLogTime != null)
                        {
                            punchLogTimes = await PunchDateToString(punchRecord1.PunchLogTime.Where(p => !p.IsDeleted).ToList());
                        }
                        List<string> ApprovedLists = await ExceptToLists(requestPunches, punchLogTimes);
                        double count = ApprovedLists.Count / 2.0;
                        int resualtCount = (int)Math.Ceiling(count);
                        if (punchCount > 0)
                        {
                            for (int punchint = 0; punchint < punchCount; punchint++)
                            {
                                if (ipunchrecords < resualtCount)
                                {
                                    DateTime punchIn = DateTime.UtcNow;
                                    DateTime? punchOut = DateTime.UtcNow;
                                    if (TimeSpan.TryParse(ApprovedLists[punchinsert], out TimeSpan parsedTimein))
                                    {
                                        DateTime localDateTimein = punchRecordRequests.RequestDate.Date + parsedTimein;
                                        punchIn = localDateTimein.Subtract(new TimeSpan(5, 30, 0));
                                    }
                                    punchRecord1.PunchLogTime[ipunchrecords].PunchIn = punchIn;
                                    if (TimeSpan.TryParse(ApprovedLists[punchinsert + 1], out TimeSpan parsedTimeout))
                                    {
                                        DateTime localDateTimeOut = punchRecordRequests.RequestDate.Date + parsedTimeout;
                                        punchOut = localDateTimeOut.Subtract(new TimeSpan(5, 30, 0));
                                        punchRecord1.PunchLogTime[ipunchrecords].IsPunchLog = false;
                                        punchRecord1.IsPunch = false;
                                    }
                                    else
                                    {
                                        punchOut = null;
                                        punchRecord1.PunchLogTime[ipunchrecords].IsPunchLog = true;
                                        punchRecord1.IsPunch = true;
                                    }
                                    punchRecord1.PunchLogTime[ipunchrecords].PunchOut = punchOut;

                                    if (requestPunches.Contains(ApprovedLists[punchinsert]))
                                    {
                                        punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogin = true;
                                    }
                                    else
                                    {
                                        punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogin = false;
                                    }
                                    if (requestPunches.Contains(ApprovedLists[punchinsert + 1]))
                                    {
                                        punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogOut = true;
                                    }
                                    else
                                    {
                                        punchRecord1.PunchLogTime[ipunchrecords].IsPunchLogOut = false;
                                    }
                                    punchRecord1.PunchLogTime[ipunchrecords].IsDeleted = false;
                                    if (punchOut != null)
                                    {
                                        punchRecord1.PunchLogTime[ipunchrecords].TotalTimeSpan = (TimeSpan)(punchRecord1.PunchLogTime[ipunchrecords].PunchOut - punchRecord1.PunchLogTime[ipunchrecords].PunchIn);
                                    }
                                    await _punchRecordsRepository.UpdatePunchLogOut(punchRecord1.PunchLogTime[ipunchrecords]);
                                }
                                else
                                {
                                    punchRecord1.PunchLogTime[ipunchrecords].IsDeleted = true;
                                    await _punchRecordsRepository.UpdatePunchLogOut(punchRecord1.PunchLogTime[ipunchrecords]);
                                }
                                ipunchrecords++;
                                punchinsert = punchinsert + 2;
                            }

                        }
                        await _punchRecordsRepository.UpdatePunchIn(punchRecord1);
                    }

                    punchRecordRequests.status = "Rejected";
                    punchRecordRequests.ApprovedDate = DateTime.UtcNow;
                    punchRecordRequests.ApprovedBy = userId;
                    await _punchRecordsRepository.UpdatePunchRecordRequest(punchRecordRequests);
                }

                PunchRequestNotificationModel notificationModel = new()
                {
                    AdminName = adminName,
                    InternFirstName = intern.FirstName,
                    InternLastName = intern.LastName,
                    PunchDate = punchRecordRequestsDate.RequestDate,
                    Punches = FormatPuncesForAMPM(punchRecordRequests?.RequestPunches),
                    Comments = requestedApprovedOrNot.Comments,
                    RequestStatus = requestedApprovedOrNot.Status,
                    UpdatedDate = DateTime.UtcNow,
                    RequestedOn = punchRecordRequestsDate.RequestedOn,
                };

                string InternMailsubject = EmailSubjects.RequestPunchApproveRejectSubject(notificationModel.RequestStatus, notificationModel.PunchDate);
                string internEmailBody = NotificationTemplates.GetPunchRequestApprovalEmailBody(notificationModel);
                await _emailService.SendEmailAsync(internemail, InternMailsubject, internEmailBody);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return punchRecord;
        }
        /// <summary>
        /// Deletes a request application based on the provided ID.
        /// </summary>
        /// <param name="id">The ID of the request application to delete</param>
        /// <returns>True if the leave application was successfully deleted; otherwise, false</returns>
        public async Task<bool> DeleteRequest(DeleteRequestDto deleteRequest)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var intern = await _punchRecordsRepository.GetInternDetails(userId);
            var admin = await _punchRecordsRepository.GetAdminsInInternship(intern.Id);
            PunchRecordRequests requestToDelete = await _punchRecordsRepository.GetPunchRecordRequestById(deleteRequest.PunchRecordRequestId);
            bool isDeleted = false;

            if (requestToDelete != null)
            {
                requestToDelete.IsDeleted = true;
                await _punchRecordsRepository.UpdatePunchRecordRequest(requestToDelete);
                isDeleted = true;
            }
            PunchRequestNotificationModel notificationModel = new PunchRequestNotificationModel
            {
                InternFirstName = intern.FirstName,
                InternLastName = intern.LastName,
                PunchDate = requestToDelete.RequestDate,
                Punches = FormatPuncesForAMPM(requestToDelete.RequestPunches),
                Comments = requestToDelete.RequestReason,
            };
            string MentorMailsubject = EmailSubjects.RequestPunchDeletionSubject(notificationModel.InternFirstName, notificationModel.InternLastName, notificationModel.PunchDate);
            if (admin.Count > 0)
            {
                foreach (var email in admin)
                {
                    notificationModel.AdminName = email.Name;
                    string internEmailBody = NotificationTemplates.GetPunchRequestDeletionEmailBody(notificationModel);
                    await _emailService.SendEmailAsync(email.Email, MentorMailsubject, internEmailBody);
                }
            }

            return isDeleted;

        }
        /// <summary>
        /// Get all intern Punchrequest details for admin
        /// </summary>
        /// <returns>List of all GetAllInternRequestHistoryForAdmin</returns>
        public async Task<List<AdminInternRequestDetailsDto>> GetAllInternRequestHistoryForAdminsUsingFilter(string? filterword, DateTime? filterduration, string? filterstatus)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var admin = await _punchRecordsRepository.GetAdminsInOrganization(userId);
            List<PunchRecordRequests> allpunchDetails = new List<PunchRecordRequests>();
            List<AdminInternRequestDetailsDto> getAllInternRequestHistories = new List<AdminInternRequestDetailsDto>();
            foreach (var admins in admin)
            {
                var result = await _punchRecordsRepository.GetPunchAdminRecordbyIntern(admins);
                allpunchDetails.AddRange(result);
            }

            if (allpunchDetails.Count > 0)
            {

                foreach (var punch in allpunchDetails)
                {
                    if (!getAllInternRequestHistories.Any(av => av.Id == punch.Id))
                    {
                        var user = await _userRepository.FindByIdAsync(punch.ApprovedBy);
                        var username = await _punchRecordsRepository.GetInternName(punch.InternId);
                        AdminInternRequestDetailsDto requestHistoryForAdmin = new AdminInternRequestDetailsDto
                        {
                            Id = punch.Id,
                            InternId = punch.InternId,
                            InternName = username,
                            Date = punch.RequestDate,
                            RequestPunches = await stringToDate(punch.RequestDate, punch.RequestPunches),
                            RequestedOn = punch.RequestedOn,
                            Comments = punch.RequestReason,
                            Status = punch.status,
                            IsDeleted = punch.IsDeleted,
                            RequestReason = punch.RequestReason,
                            approvedBy = user != null ? user.FirstName + " " + user.LastName : "Not Approved",
                            approvedDate = punch.ApprovedDate
                        };
                        getAllInternRequestHistories.Add(requestHistoryForAdmin);

                    }
                    if (filterword != null)
                    {
                        getAllInternRequestHistories = getAllInternRequestHistories.Where(i => i.InternName == filterword).ToList();
                    }
                    if (filterduration != null)
                    {
                        getAllInternRequestHistories = getAllInternRequestHistories.Where(i => i.Date.Date == filterduration?.Date).ToList();
                    }
                    if (filterstatus != null)
                    {
                        getAllInternRequestHistories = getAllInternRequestHistories.Where(i => i.Status == filterstatus).ToList();
                    }
                }
            }
            return getAllInternRequestHistories.OrderByDescending(p => p.RequestedOn).ToList();


        }
        private string GetLeaveStatus(List<LeavePunchDto> application, DateTime punchDate)
        {
            if (application == null || application.Count == 0)
                return string.Empty;

            LeavePunchDto? leaveApplication = application.Find(p => p.LeaveStartDate.Date <= punchDate.Date && (p.LeaveEndDate?.Date ?? DateTime.MaxValue) >= punchDate.Date);

            return leaveApplication?.LeaveStatus ?? string.Empty;
        }
        /// <summary>
        /// checks whether leave is applied or not.
        /// /// <param name="application"> the list of leave punch details</param>
        /// <param name="punchDate"> the date time</param>
        /// </summary>
        /// <returns>leave punch dto object for perticular date.</returns>
        private LeavePunchDto? IsApplyleave(List<LeavePunchDto> application, DateTime punchDate)
        {
            if (application == null)
            {
                return new LeavePunchDto();
            }
            else
            {
                LeavePunchDto leave = application.FirstOrDefault(p => (p.LeaveStartDate.Date <= punchDate.Date && p.LeaveEndDate?.Date >= punchDate.Date));
                return leave;
            }
        }
        /// <summary>
        /// converts string to date format.
        /// /// <param name="punchDate">The Punch date </param>
        /// <param name="requestPunchs">The string of request punches</param>
        /// </summary>
        /// <returns>The list of date times</returns>
        private async Task<List<DateTime>> stringToDate(DateTime punchDate, string requestPunchs)
        {
            List<DateTime> result = new List<DateTime>();
            if (string.IsNullOrWhiteSpace(requestPunchs))
            {
                return result;
            }
            string[] punchTimes = requestPunchs.Split(',');
            foreach (string time in punchTimes)
            {
                if (TimeSpan.TryParse(time, out TimeSpan parsedTime))
                {
                    await Task.Delay(1);
                    DateTime localDateTime = punchDate.Date + parsedTime;
                    DateTime utcDateTime = localDateTime.Subtract(new TimeSpan(5, 30, 0));
                    result.Add(utcDateTime);
                }
                else
                {
                    throw new Exception("invalid time format");
                }
            }
            return result;
        }
        /// <summary>
        /// converts ist time zone to utc time zone format.
        /// /// <param name="punchLogTimes">The list of punch log time</param>
        /// </summary>
        /// <returns>The list of string</returns>
        private async Task<List<string>> PunchDateToString(List<PunchLogTime> punchLogTimes)
        {
            List<string> result = new List<string>();
            if (punchLogTimes.Count > 0)
            {
                foreach (var punch in punchLogTimes)
                {
                    TimeZoneInfo istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
                    DateTime punchlogin = TimeZoneInfo.ConvertTimeFromUtc(punch.PunchIn, istTimeZone);
                    result.Add(punchlogin.ToString("HH:mm"));
                    DateTime punchlogout = DateTime.UtcNow;
                    if (punch.PunchOut != null)
                    {
                        punchlogout = TimeZoneInfo.ConvertTimeFromUtc(Convert.ToDateTime(punch.PunchOut), istTimeZone);
                        result.Add(punchlogout.ToString("HH:mm"));
                    }
                    else
                    {
                        result.Add(null);
                    }

                }
            }
            return result;
        }
        /// <summary>
        /// Merging two lists of time span.
        /// <param name="RequestPunches">The list of string</param>
        /// <param name="punches">The list of string</param>
        /// </summary>
        /// <returns>The list of string</returns>
        private async Task<List<string>> MergeToLists(List<string> RequestPunches, List<string> punches)
        {
            List<string> result = new List<string>();
            List<string> filteredPunches = punches.Where(p => p != null).ToList();
            List<string> mergedList = RequestPunches.Concat(filteredPunches).ToList();
            result = mergedList
           .Select(time => TimeSpan.Parse(time))
           .OrderBy(timeSpan => timeSpan)
           .Select(timeSpan => timeSpan.ToString(@"hh\:mm"))
           .ToList();
            if (result.Count % 2 != 0)
            {
                result.Add(null);
            }
            return result;
        }
        /// <summary>
        /// Removing request punches and reapplying previous punches
        /// <param name="RequestPunches">The list of string</param>
        /// <param name="punches">The list of string</param>
        /// </summary>
        /// <returns>The list of string</returns>
        private async Task<List<string>> ExceptToLists(List<string> RequestPunches, List<string> punches)
        {
            List<string> filteredPunches = punches.Where(p => p != null).ToList();
            List<string> result = new List<string>();
            foreach (var item in RequestPunches)
            {
                filteredPunches.Remove(item);
            }
            result = filteredPunches
           .Select(time => TimeSpan.Parse(time))
           .OrderBy(timeSpan => timeSpan)
           .Select(timeSpan => timeSpan.ToString(@"hh\:mm"))
           .ToList();
            if (result.Count % 2 != 0)
            {
                result.Add(null);
            }
            return result;

        }
        /// <summary>
        /// Checks weather requested for punch or not
        /// <param name="internID">The string Id</param>
        /// <param name="punchDate">The Date time</param>
        /// </summary>
        /// <returns>The string</returns>
        private async Task<string> IsPunchRequest(string internID, DateTime punchDate)
        {
            if (internID == null)
            {
                throw new ArgumentNullException(nameof(internID));
            }
            else
            {

                DateTime PunchDatekind = DateTime.SpecifyKind(punchDate, DateTimeKind.Utc);

                List<PunchRecordRequests> punchRecordRequests = await _punchRecordsRepository.IsPunchRecordRequestById(internID, PunchDatekind);
                if (punchRecordRequests == null)
                {
                    return null;
                }
                else
                {
                    PunchRecordRequests PunchRequest = punchRecordRequests.FirstOrDefault(p => p.status == "Approved");
                    if (PunchRequest != null)
                    {
                        return PunchRequest.status;
                    }
                    else
                    {
                        PunchRecordRequests IsPunchRequest = punchRecordRequests.FirstOrDefault(p => p.status == "Pending");
                        if (IsPunchRequest != null)
                        {
                            return IsPunchRequest.status;
                        }
                        return null;
                    }

                }
            }
            return null;
        }
        private async Task<List<string>> FormatPunches(string punches)
        {
            List<string> result = new List<string>();
            if (string.IsNullOrWhiteSpace(punches))
            {
                return result;
            }
            else
            {
                List<string> requestPunches = punches.Split(",").ToList();
                foreach (var punch in requestPunches)
                {
                    TimeSpan time = TimeSpan.Parse(punch);
                    result.Add(time.ToString(@"hh\:mm"));
                }

            }
            return result;
        }
        private string GetLeaveType(List<LeavePunchDto> application, DateTime punchDate)
        {
            if (application == null || application.Count == 0)
                return string.Empty;

            LeavePunchDto? leaveApplication = application.Find(p => p.LeaveStartDate.Date <= punchDate.Date && (p.LeaveEndDate?.Date ?? DateTime.MaxValue) >= punchDate.Date);

            return leaveApplication?.LeaveType ?? string.Empty;
        }
        public string FormatPuncesForAMPM(string stringpunches)
        {
            List<string> punches = stringpunches.Split(",").ToList();
            string result = "";
            foreach (var punch in punches)
            {
                DateTime punchTime = DateTime.ParseExact(punch, "H:mm", CultureInfo.InvariantCulture);
                string formattedPunch = punchTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
                result = result + formattedPunch + ",";

            }
             result = result.Substring(0, result.Length - 1);
            return result;
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
