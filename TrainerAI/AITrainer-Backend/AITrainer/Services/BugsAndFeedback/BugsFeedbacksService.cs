using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Feedback;
using AITrainer.AITrainer.Core.Dto.Intern;
using AITrainer.AITrainer.Core.Enums;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.BugsAndFeedback;
using AutoMapper;
using System.Security.Claims;
using AutoMapper.QueryableExtensions;
using System.Linq;

namespace AITrainer.Services.BugsAndFeedback
{
    public class BugsFeedbacksService : IBugsFeedbacksService
    {
        private readonly IBugsFeedbacksRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;
        public BugsFeedbacksService(IBugsFeedbacksRepository repository, IHttpContextAccessor httpContextAccessor, IMapper mapper)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;

        }

        ///// <summary>
        ///// Creates a bug report submitted by an intern.
        ///// </summary>
        ///// <param name="model">The input model containing data for creating the bug report.</param>
        /////  <returns>Returns a BugsFeedback object representing the created bug report.</returns>
        public async Task<BugsFeedback> CreateInternBugsAsync(BugsFeedbackInputModel model)
        {
            if (model == null)
            {
                throw new ArgumentNullException(nameof(model));
            }

            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            BugsFeedback feedback = _mapper.Map<BugsFeedbackInputModel, BugsFeedback>(model);

            feedback.Id = Guid.NewGuid().ToString();
            feedback.ReporterId = userId;
            feedback.CreatedDate = DateTime.UtcNow;
            feedback.UpdatedDate = DateTime.UtcNow;
            feedback.CreatedBy = userId;
            feedback.UpdatedBy = userId;
            feedback.IsDeleted = false;

            if (model.Files != null)
            {
                foreach (IFormFile file in model.Files)
                {
                    using (MemoryStream memoryStream = new MemoryStream())
                    {
                        await file.CopyToAsync(memoryStream);
                        byte[] fileData = memoryStream.ToArray();
                        feedback.Attachments.Add(new DocumentAttachment
                        {
                            Id = Guid.NewGuid().ToString(),
                            BugsFeedbackId = feedback.Id,
                            FileName = file.FileName,
                            FileData = fileData,
                            IsDeleted = false
                        });
                    }
                }
            }

            BugsFeedback result = await _repository.CreateFeedbackAsync(feedback);
            return result;
        }


        /// <summary>
        /// Retrieves mentor details for interns.
        /// </summary>
        /// <returns>Returns a list of AdminList objects representing the mentors of interns.</returns>
        public async Task<List<AdminList>> GetInternsMentorDetailsAsync()
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string createdMentorId = await _repository.GetMentorAsync(userId);
            List<AdminList> Mentors = await _repository.GetMentorListOfInternAsync(new List<string> { createdMentorId });
            return Mentors;
        }

        /// <summary>
        /// Retrieves bug reports along with images for the current logged in intern.
        /// </summary>
        /// <returns>Returns a list of FeedbackWithImagesDTO objects representing bug reports with images.</returns>
        public async Task<List<FeedbackWithImagesDTO>> GetBugsReportAsync()
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            List<BugsFeedback> feedbacks =await _repository.GetallBugReportOfInternAsync(userId);
           List<string> reportedAdminIds = feedbacks.SelectMany(feedback => feedback.ReportedToId).Distinct().ToList();

            List<AdminList> adminDetails = await _repository.GetMentorListOfInternAsync(reportedAdminIds); 

            List<FeedbackWithImagesDTO> feedbacksWithImages = new List<FeedbackWithImagesDTO>();

            foreach (BugsFeedback feedback in feedbacks)
            {
                FeedbackWithImagesDTO feedbackDto = _mapper.Map<FeedbackWithImagesDTO>(feedback);
                feedbackDto.Admins = new List<AdminList>();
                feedbackDto.ImageUrls = new List<AttachmentInfo>();
                if (adminDetails!=null)
                {
                  
                    foreach (string reportedAdminId in feedback.ReportedToId)
                    {
                        AdminList adminDetail = adminDetails.FirstOrDefault(admin => admin.Id == reportedAdminId);
                        if (adminDetail != null)
                        {
                            feedbackDto.Admins.Add(new AdminList
                            {
                                Id = adminDetail.Id,
                                FirstName = adminDetail.FirstName,
                                LastName = adminDetail.LastName
                            });
                        }
                    }

                }
                if (feedback.Comments != null)
                {
                    
                    AdminList adminDetail = adminDetails.FirstOrDefault(admin => admin.Id == feedback.UpdatedBy);
                    if (adminDetail != null)
                    {
                        feedbackDto.CommentedBy = $"{adminDetail.FirstName} {adminDetail.LastName}";
                    }
                }

                foreach (DocumentAttachment attachment in feedback.Attachments)
                {
                    if (attachment.FileData != null)
                    {
                        AttachmentInfo attachmentInfo = new AttachmentInfo
                        {
                            FileName = attachment.FileName,
                            Id = attachment.Id
                        };
                        feedbackDto.ImageUrls.Add(attachmentInfo);
                    }
                }
                feedbacksWithImages.Add(feedbackDto);

            }
            feedbacksWithImages = feedbacksWithImages.OrderBy(f => f.Status == BugStatus.Pending.ToString() ? 0 : 1)
                .ThenByDescending(f => f.CreatedDate).
                ToList();
            return feedbacksWithImages;
         
        }

        /// <summary>
        /// Retrieves a bug report with images by interns idD.
        /// </summary>
        /// <param name="Id">The ID of the bug report to retrieve.</param>
        /// <returns>Returns a FeedbackWithImagesDTO object representing the bug report with images.</returns>
        public async  Task<FeedbackWithImagesDTO> GetInternFeedbackByIdAsync(string Id)
        {
          
               List<AdminList> adminDetails = null;
                string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                string createdMentorId = await _repository.GetMentorAsync(userId);
            if (createdMentorId == null)
            {
                adminDetails= await _repository.getAllMentorsInOrganizationAsync(userId);
            }
            else
            {

                adminDetails = await _repository.GetMentorListOfInternAsync(new List<string> { createdMentorId });
            }

            BugsFeedback feedback = await _repository.FindBugByIdAsync(Id);
            



            FeedbackWithImagesDTO feedbackDto = _mapper.Map<FeedbackWithImagesDTO>(feedback);
            feedbackDto.Admins = new List<AdminList>();
            feedbackDto.ImageUrls = new List<AttachmentInfo>();
            if (adminDetails != null)
            {

                foreach (string reportedAdminId in feedback.ReportedToId)
                {
                    AdminList adminDetail = adminDetails.FirstOrDefault(admin => admin.Id == reportedAdminId);
                    if (adminDetail != null)
                    {
                        feedbackDto.Admins.Add(new AdminList
                        {
                            Id = adminDetail.Id,
                            FirstName = adminDetail.FirstName,
                            LastName = adminDetail.LastName
                        });
                    }
                }

            }
            if (feedback.Comments != null)
            {
               
                AdminList adminDetail = adminDetails.FirstOrDefault(admin => admin.Id == feedback.UpdatedBy);
                if (adminDetail != null)
                {
                    feedbackDto.CommentedBy = $"{adminDetail.FirstName} {adminDetail.LastName}";
                }
            }
            foreach (DocumentAttachment attachment in feedback.Attachments)
            {
                if (attachment.FileData != null)
                {
                    AttachmentInfo attachmentInfo = new AttachmentInfo
                    {
                        FileName = attachment.FileName,
                        Id = attachment.Id
                    };
                    feedbackDto.ImageUrls.Add(attachmentInfo);
                }
            }
           return feedbackDto;


        }

        /// <summary>
        /// Deletes a bug report along with its attachments.
        /// </summary>
        /// <param name="feedbackId">The ID of the bug report to delete.</param>
        /// <returns>Task representing the asynchronous operation.</returns>
        public async Task DeleteFeedbackAsync(string feedbackId)
        {
            BugsFeedback bugsFeedback = await _repository.FindBugByIdAsync(feedbackId);
            bugsFeedback.IsDeleted = true;
            foreach (DocumentAttachment attachment in bugsFeedback.Attachments)
            {
                if (attachment.FileData != null)
                {
                    attachment.IsDeleted = true;

                }
            }
            await _repository.UpdateFeedbackAsync(bugsFeedback);
        }

         /// <summary>
        /// Retrieves all bugs and feedback for mentors.
        /// </summary>
        /// <returns>A list of DTOs containing bugs and feedback information.</returns>
        public async Task<List<FeedbackWithImagesDTO>> GetAllBugsForMentorsAsync()
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            string adminType = await _repository.GetAdminTypeAsync(userId);
            List<string> internIds = await _repository.GetAllInternsOfMentorAsync(userId);

            List<BugsFeedback> bugsFeedbacks = adminType == AdminType.Mentor.ToString() ?
                await _repository.GetMentorBugsAsync(userId, internIds) :
                await _repository.GetMentorBugsAsync(null, internIds);

            List<string> reportedAdminIds = bugsFeedbacks
                .SelectMany(feedback => feedback.ReportedToId)
                .Distinct()
                .ToList();

            List<AdminList> adminDetails = await _repository.GetMentorListOfInternAsync(reportedAdminIds);
            List<ReporterInfoDTO> reporterDetails = await _repository.GetReporterDetailsAsync(internIds);

            List<FeedbackWithImagesDTO> feedbackResponseList = bugsFeedbacks
                .Select(bugsFeedback =>
                {
                    FeedbackWithImagesDTO feedbackMentorOutput = _mapper.Map<FeedbackWithImagesDTO>(bugsFeedback);


                    ReporterInfoDTO reporterDetail = reporterDetails.FirstOrDefault(r => r.ReporterId == bugsFeedback.ReporterId);
                    feedbackMentorOutput.ReporterInfo = reporterDetail;

                    if(bugsFeedback.ReportedToId !=null)
                    {
                        List<AdminList> admins = bugsFeedback.ReportedToId
                       .Select(adminId => adminDetails.FirstOrDefault(admin => admin.Id == adminId))
                       .Where(admin => admin != null)
                       .ToList();
                        feedbackMentorOutput.Admins = admins.Any() ? admins : null;
                    }
                    if (feedbackMentorOutput.Comments != null)
                    {
                        AdminList adminDetail = adminDetails.FirstOrDefault(admin => admin.Id == feedbackMentorOutput.UpdatedBy);
                        if (adminDetail != null)
                        {
                            feedbackMentorOutput.CommentedBy = $"{adminDetail.FirstName} {adminDetail.LastName}";
                        }
                    }

                    if (bugsFeedback.Attachments != null)
                    {
                        feedbackMentorOutput.ImageUrls = bugsFeedback.Attachments
                            .Where(attachment => attachment.FileData != null)
                            .Select(attachment => new AttachmentInfo
                            {
                                FileName = attachment.FileName,
                                Id = attachment.Id
                            })
                            .ToList();
                    }
                    else
                    {
                        feedbackMentorOutput.ImageUrls = null;
                    }
                    return feedbackMentorOutput;

                })
                .ToList();
            feedbackResponseList= feedbackResponseList.OrderBy(f => f.Status == BugStatus.Pending.ToString() ? 0 : 1)
                 .ThenByDescending(f => f.CreatedDate).ToList();
            return feedbackResponseList;
        }

        /// <summary>
        /// Adds a mentor comment to a bug feedback asynchronously and to assign and reassign mentor.
        /// </summary>
        /// <param name="feedbackReplyDto">The data transfer object containing the mentor comment details.</param>
        /// <returns>Returns a BugsFeedback object representing the updated bug feedback.</returns>
        public async Task<BugsFeedback> AddMentorCommentAsync(BugsMentorReplyInputDto feedbackReplyDto)
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            BugsFeedback bugsFeedback = await _repository.FindBugByIdAsync(feedbackReplyDto.FeedbackId);
            if(feedbackReplyDto.Comment!= null)
            {
                bugsFeedback.Comments = feedbackReplyDto.Comment;
            }
            if(feedbackReplyDto.MentorsId != null)
            {
                bugsFeedback.ReportedToId=feedbackReplyDto.MentorsId;
            }
            bugsFeedback.UpdatedDate=DateTime.UtcNow;
            bugsFeedback.UpdatedBy = userId;
            bugsFeedback.Status= feedbackReplyDto.Status;
            

            await _repository.UpdateFeedbackAsync(bugsFeedback);
            return bugsFeedback;

        }

        /// <summary>
        /// Retrieves details of all mentors in the organization asynchronously.
        /// </summary>
        /// <returns>Returns a list of AdminList objects representing the details of mentors in the organization.</returns>
        public async Task<List<AdminList>> getAllMentorsInOrganizationAsync()
        {
            string userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            List<AdminList> result = await _repository.getAllMentorsInOrganizationAsync(userId);
            return result;

        }


    }
}
