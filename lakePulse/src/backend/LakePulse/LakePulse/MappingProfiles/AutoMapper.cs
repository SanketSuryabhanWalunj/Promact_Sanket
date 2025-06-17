using AutoMapper;
using LakePulse.DTOs;
using LakePulse.DTOs.DataPartner;
using LakePulse.DTOs.DataSource;
using LakePulse.DTOs.FieldNote;
using LakePulse.Models;

namespace LakePulse.MappingProfiles
{
    public class AutoMapper : Profile
    {
        public AutoMapper()
        {
            //CreateMap<SourceModel, DestinationModel>()

            CreateMap<FieldNoteRequestDto, FieldNote>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.CreatedTime, opt => opt.MapFrom(src => DateTime.UtcNow));
            CreateMap<FieldNote, FieldNotesResponseDto>();
            CreateMap<FeaturesResponseDto, Features>()
                .ForMember(dest => dest.feature_id, opt => opt.MapFrom(src => src.FeatureId))
                .ForMember(dest => dest.category, opt => opt.MapFrom(src => src.Category))
                .ForMember(dest => dest.order_in_category, opt => opt.MapFrom(src => src.OrderInCategory))
                .ForMember(dest => dest.label, opt => opt.MapFrom(src => src.Label))
                .ForMember(dest => dest.units, opt => opt.MapFrom(src => src.Units))
                .ForMember(dest => dest.data_type, opt => opt.MapFrom(src => src.DataType))
                .ForMember(dest => dest.data_source, opt => opt.MapFrom(src => src.DataSource))
                .ForMember(dest => dest.field_id, opt => opt.MapFrom(src => src.FieldId))
                .ForMember(dest => dest.editable, opt => opt.MapFrom(src => src.Editable))
                .ForMember(dest => dest.lower_bound, opt => opt.MapFrom(src => src.LowerBound))
                .ForMember(dest => dest.upper_bound, opt => opt.MapFrom(src => src.UpperBound))
                .ForMember(dest => dest.allowed_categories, opt => opt.MapFrom(src => src.AllowedCategories))
                .ForMember(dest => dest.decimal_rounding, opt => opt.MapFrom(src => src.DecimalRounding))
                .ForMember(dest => dest.description, opt => opt.MapFrom(src => src.Description)).ReverseMap();
            CreateMap<ToolboxPurchases, ToolboxOrderDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.lp_trans_no))
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.vendor_trans_id))
                .ForMember(dest => dest.Product, opt => opt.MapFrom(src => src.item_label))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
                .ForMember(dest => dest.ProductSKU, opt => opt.MapFrom(src => src.item_sku))
                .ForMember(dest => dest.LakePulseId, opt => opt.MapFrom(src => src.lakepulse_id))
                .ForMember(dest => dest.PurchaseDateTime, opt => opt.MapFrom(src => src.purchase_datetime)).ReverseMap();
            CreateMap<ToolboxPurchases, ToolboxRecentPurchasesDto>()
               .ForMember(dest => dest.ItemSku, opt => opt.MapFrom(src => src.item_sku))
               .ForMember(dest => dest.ItemLabel, opt => opt.MapFrom(src => src.item_label))
               .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.user_email))
               .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
               .ForMember(dest => dest.PurchaseDateTime, opt => opt.MapFrom(src => src.purchase_datetime)).ReverseMap();
            CreateMap<DataSourceResponseDto, DataSource>().ReverseMap();
            CreateMap<CreateDataPartnerRequestDto, DataPartner>().ReverseMap();
            CreateMap<DataPartnerResponseDto, DataPartner>().ReverseMap();
            CreateMap<UpdateDataPartnerRequestDto, DataPartner>().ReverseMap();

        }
    }
}
