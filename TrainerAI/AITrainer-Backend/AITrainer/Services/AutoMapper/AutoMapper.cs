using AITrainer.AITrainer.Core.Dto;
using AITrainer.AITrainer.Core.Dto.BugsAndFeedbacks;
using AITrainer.AITrainer.Core.Dto.Internship;
using AITrainer.AITrainer.DomainModel.Models;
using AutoMapper;

namespace AITrainer.Services.AutoMapper
{
    public class AutoMapper:Profile
    {
        public AutoMapper()
        {
            CreateMap<BugsFeedbackInputModel, BugsFeedback>();
            CreateMap<BugsFeedback, FeedbackWithImagesDTO>()
                .ForMember(dest => dest.ReporterId, opt => opt.MapFrom(src => src.ReporterId))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Title))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments))
                .ForMember(dest => dest.CreatedDate, opt => opt.MapFrom(src => src.CreatedDate))
                .ForMember(dest => dest.UpdatedDate, opt => opt.MapFrom(src => src.UpdatedDate))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
                .ForMember(dest => dest.UpdatedBy, opt => opt.MapFrom(src => src.UpdatedBy))
                .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => src.IsDeleted))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.Admins, opt => opt.Ignore())  
                .ForMember(dest => dest.ImageUrls, opt => opt.Ignore());
            CreateMap<OverallFeedbackDTO, OverallFeedback>();
            CreateMap<PunchRequestStartEndDateDto, PunchRecordRequests>().ReverseMap();
        }
    }
}
