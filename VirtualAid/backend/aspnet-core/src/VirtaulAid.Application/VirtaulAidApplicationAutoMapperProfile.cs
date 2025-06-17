using AutoMapper;
using VirtaulAid.Carts;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.Cart;
using VirtaulAid.DTOs.Company;
using VirtaulAid.DTOs.Course;
using VirtaulAid.DTOs.Employee;
using VirtaulAid.DTOs.TerminatedEmployees;
using VirtaulAid.DTOs.Purchase;
using VirtaulAid.DTOs.User;
using VirtaulAid.Purchases;
using VirtaulAid.Employee;
using VirtaulAid.Services;
using VirtaulAid.Users;
using VirtaulAid.DTOs.CompanyDashboard;
using VirtaulAid.Exams;
using VirtaulAid.DTOs.Exam;
using VirtaulAid.DTOs.Admin;
using VirtaulAid.DTOs.Governor;
using VirtaulAid.DTOs.Feedback;
using VirtaulAid.Feedbacks;
using VirtaulAid.DTOs.LiveExam;

namespace VirtaulAid;

public class VirtaulAidApplicationAutoMapperProfile : Profile
{
    public VirtaulAidApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */

        CreateMap<ReqUserRegistraionDto, UserDetail>().ReverseMap();
        CreateMap<AdminRegistrationDto, UserDetail>().ReverseMap();
        CreateMap<ResUserRoleDto,UserDetail>().ReverseMap();
        CreateMap<ReqUserRoleDto, UserDetailRoleMapping>().ReverseMap();


        CreateMap<ReqCompanyRegistrationDto, Company>().ReverseMap();
        CreateMap<ResCompanyDto, Company>().ReverseMap();
        CreateMap<UserDetail, AuthenticateUserDto>().ReverseMap();

        CreateMap<Company, CompanyDto>().ReverseMap();
        CreateMap<UpdateCompanyDto, Company>().ReverseMap();

        CreateMap<Course, ResAllCourseDto>().ReverseMap();
        CreateMap<Course, ReqAddCourseDto>().ReverseMap();

        CreateMap<Module, ReqAddModuleDto>().ReverseMap();

        CreateMap<Module, ModuleDto>().ReverseMap();
        CreateMap<Course, ResCourseDetailDto>().ReverseMap();

        CreateMap<UserDetail, ResAllEmployeeDto>().ReverseMap();

        CreateMap<Cart, ReqAddCartDto>().ReverseMap();
        CreateMap<Cart, ResAddCartDto>().ReverseMap();

        CreateMap<UserDetail, UserDetailsDto>().ReverseMap();
        CreateMap<UserDetail, BulkUserUploadDto>().ReverseMap();
        CreateMap<UserDetail, BulkUserTemplateDto>().ReverseMap();
        CreateMap<UserDetail, EmployeeDetailsDto>().ReverseMap();

        CreateMap<UserCourseEnrollments, UserCourseEnrollmentDto>().ReverseMap();
        CreateMap<CourseSubscriptionMapping, CourseSubscriptionDto>().ReverseMap();

        CreateMap<PurchaseDetail, ResPurchaseDto>().ReverseMap();
        CreateMap<PurchaseDetail, ReqPurchaseDto>().ReverseMap();

        CreateMap<TerminatedEmployee, ResTerminatedEmployee>().ReverseMap();
        CreateMap<CourseSubscriptionMapping, DashboardCourseSubscriptionDto>().ReverseMap();

        CreateMap<ResAllUnSubscribedCoursesDto, Course>().ReverseMap();

        CreateMap<ResAllCoursesForIndividualDto, Course>().ReverseMap();
        CreateMap<MostPopularCoursesDto, Course>().ReverseMap();
        CreateMap<ExamDetail, ReqExamDetailDto>().ReverseMap();
        CreateMap<ExamDetail, ResExamDetailDto>().ReverseMap();

        CreateMap<Question, ResQuestionDto>().ReverseMap();
        CreateMap<Question, ResExamQuestionDto>().ReverseMap();

        CreateMap<QuestionOption, ReqOptionDto>().ReverseMap();
        CreateMap<QuestionOption, ResOptionDto>().ReverseMap();
        CreateMap<QuestionOption, ResExamOptionDto>().ReverseMap();

        CreateMap<ExamResult, ReqExamResultDto>().ReverseMap();

        CreateMap<Module, ModuleDto>().ReverseMap();
        CreateMap<Module, ReqModuleDto>().ReverseMap();
        CreateMap<Lesson, LessonDto>().ReverseMap();
        CreateMap<Lesson, ReqLessonDto>().ReverseMap();
        CreateMap<Content, ContentDto>().ReverseMap();
        CreateMap<Module, AddModuleDto>().ReverseMap();
        CreateMap<Lesson, AddLessonDto>().ReverseMap();
        CreateMap<Content, AddContentDto>().ReverseMap();
        CreateMap<Section, SectionDto>().ReverseMap();
        CreateMap<PurchaseDetail, ReqWebhookPaymentDto>().ReverseMap();

        CreateMap<CompanyProfileDto, Company>().ReverseMap();
        CreateMap<CompanyListDto, Company>().ReverseMap();
        CreateMap<UserListDto, UserDetail>().ReverseMap();
        CreateMap<UserProfileDto, UserDetail>().ReverseMap();

        CreateMap<CourseSubscriptionMapping, CoursePurchasedByCompanyDto>().ReverseMap();
        CreateMap<CompanyStatusDto, Company>().ReverseMap();

        CreateMap<UserDetail, ReqAddGovernorDto>().ReverseMap();
        CreateMap<UserDetail, ResAddGovernorDto>().ReverseMap();
        CreateMap<UserDetail, ReqUpdateGovernorDto>().ReverseMap();
        CreateMap<UserDetail, ResUserDetailsDto>().ReverseMap();
        CreateMap<UserDetail, ResUserAddressDetailsDto>().ReverseMap();

        CreateMap<CustomCourseRequest, CustomCourseRequestDto>().ReverseMap();
        CreateMap<CustomCourseRequest, ResCustomCourseRequestDto>().ReverseMap();
        CreateMap<CustomCourseRequest, CustomCourseRequestDetailsDto>().ReverseMap();

        CreateMap<LiveExamDetails, ReqLiveExamDetailsDto>().ReverseMap();
        CreateMap<LiveExamDetails, ResLiveExamDetailsDto>().ReverseMap();

        CreateMap<ReqCompanyProfileDto, Company>().ReverseMap();
        CreateMap<ResCompanyProfileDto, Company>().ReverseMap();
        CreateMap<ResUserProfileDto, UserDetail>().ReverseMap();
        CreateMap<ResPublishDataDto, UserDetail>().ReverseMap();
        CreateMap<ResPublishDataDto, Company>().ReverseMap();

        CreateMap<ResFeedbackDto, Feedback>().ReverseMap();
        CreateMap<ResUpdateFeedbackStatusDto, Feedback>().ReverseMap();
        CreateMap<FeedbackTemplateDto, Feedback>().ReverseMap();
    }
}
