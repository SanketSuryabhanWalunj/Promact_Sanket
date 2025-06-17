using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using VirtaulAid.Interfaces;
using Volo.Abp.Application.Services;
using VirtaulAid.Purchases;
using Volo.Abp.Domain.Repositories;
using VirtaulAid.DTOs.Purchase;
using AutoMapper;
using VirtaulAid.Companies;
using Volo.Abp;
using Microsoft.Extensions.Localization;
using VirtaulAid.Localization;
using Microsoft.AspNetCore.Authorization;
using VirtaulAid.Users;
using Microsoft.AspNetCore.Http;
using System.IO;
using Stripe;
using Stripe.Checkout;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.Appsettings;
using Microsoft.Extensions.Options;
using VirtaulAid.Carts;
using VirtaulAid.Permissions;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using VirtaulAid.DTOs.Course;
using System.Linq;
using VirtaulAid.DTOs.User;
using VirtaulAid.DomainServices;
using VirtaulAid.Util;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Company, Individual, Admin, Super Admin")]
    public class PaymentService : ApplicationService, IPaymentService
    {
        private readonly IRepository<PurchaseDetail> _purchaseRepository;
        private readonly IRepository<Company> _companyRepository;
        private readonly IRepository<UserDetail> _userRepository;
        private readonly IRepository<Course> _courseRepository;
        private readonly AdminReportDomainService _adminReportDomainService;
        private readonly IEmailService _emailService;
        private readonly CourseDomainService _courseDomainService;
        private readonly IHostEnvironment _environment;
        private readonly IRepository<Cart> _cartRepository;
        private readonly IRepository<CourseSubscriptionMapping> _courseSubscriptionRepository;
        private readonly IRepository<CustomCourseRequest> _customCourseRequestRepository;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public AppAppsettings _appOptions { get; }
        public StripeAppsettings _stripeOptions { get; }

        public PaymentService(IRepository<PurchaseDetail> purchaseRepository,
            IMapper mapper,
            IRepository<Company> companyRepository,
            IRepository<UserDetail> userRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IHttpContextAccessor httpContextAccessor,
            IRepository<Course> courseRepository,
            IOptions<AppAppsettings> appOptions,
            AdminReportDomainService adminReportDomainService,
            IEmailService emailService,
            IHostEnvironment environment,
            IRepository<CourseSubscriptionMapping> courseSubscriptionRepository,
            IOptions<StripeAppsettings> stripeOptions,
            IRepository<Cart> cartRepository,
            IRepository<CustomCourseRequest> customCourseRequestRepository
,
            CourseDomainService courseDomainService)
        {
            _purchaseRepository = purchaseRepository;
            _mapper = mapper;
            _companyRepository = companyRepository;
            _userRepository = userRepository;
            _localizer = localizer;
            _httpContextAccessor = httpContextAccessor;
            _courseRepository = courseRepository;
            _adminReportDomainService = adminReportDomainService;
            _emailService = emailService;
            _environment = environment;
            _appOptions = appOptions.Value;
            _courseSubscriptionRepository = courseSubscriptionRepository;
            _stripeOptions = stripeOptions.Value;
            _cartRepository = cartRepository;
            _customCourseRequestRepository = customCourseRequestRepository;
            _courseDomainService = courseDomainService;
        }

        /// <summary>
        /// Method to add the Purchase details using ReqPurchaseDto.
        /// </summary>
        /// <param name="reqPurchaseModel">ReqPurchaseDto to add record.</param>
        /// <returns>Task ResPurchaseDto.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        [Authorize(VirtaulAidPermissions.Purchase.Create)]
        public async Task<ResPurchaseDto> AddPurchaseDetails(ReqPurchaseDto reqPurchaseModel)
        {
            if (reqPurchaseModel.CompanyId != null)
            {
                Company companyDetails = await _companyRepository.FirstOrDefaultAsync(x => x.Id == reqPurchaseModel.CompanyId);
                if (companyDetails == null)
                {
                    throw new UserFriendlyException(_localizer["CompanyNotExist"], StatusCodes.Status404NotFound.ToString());
                }
            }
            else
            {
                UserDetail userDetails = await _userRepository.FirstOrDefaultAsync(x => x.Id == reqPurchaseModel.UserId);
                if (userDetails == null)
                {
                    throw new UserFriendlyException(_localizer["UserNotExist"], StatusCodes.Status404NotFound.ToString());
                }
            }

            PurchaseDetail purchaseDetail = _mapper.Map<PurchaseDetail>(reqPurchaseModel);
            purchaseDetail.PurchaseDate = DateTime.Now;
            PurchaseDetail result = await _purchaseRepository.InsertAsync(purchaseDetail, true);
            return _mapper.Map<ResPurchaseDto>(result);
        }

        /// <summary>
        /// Method is to get purchase history by company id.
        /// </summary>
        /// <param name="companyId"> company Id.</param>
        /// <returns>Task list of ResPurchaseDto.</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<List<ResPurchaseDto>> GetPurchaseListByCompanyIdAsync(Guid companyId)
        {
            List<PurchaseDetail> listPurchase = await _purchaseRepository.GetListAsync(x => x.CompanyId == companyId);
            if (listPurchase == null)
                return new List<ResPurchaseDto>();

            return _mapper.Map<List<ResPurchaseDto>>(listPurchase);
        }

        /// <summary>
        /// Method is to get purchase history by user id.
        /// </summary>
        /// <param name="userId"> user Id.</param>
        /// <returns>Task list of ResPurchaseDto.</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<List<ResPurchaseDto>> GetPurchaseListByUserIdAsync(Guid userId)
        {
            List<PurchaseDetail> listPurchase = await _purchaseRepository.GetListAsync(x => x.UserId == userId);
            if (listPurchase == null)
                return new List<ResPurchaseDto>();

            return _mapper.Map<List<ResPurchaseDto>>(listPurchase);
        }

        /// <summary>
        /// Method is to get the payment checkout for payment.
        /// </summary>
        /// <param name="reqPaymentDto">request payment dto.</param>
        /// <returns>Task ResCheckoutPaymentDto.</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<ResCheckoutPaymentDto> PaymentCheckOutAsync(ReqCheckoutPaymentDto reqPaymentDto)
        {
            IList<ReqPurchaseCourseDetails> purchaseCourseDetails = new List<ReqPurchaseCourseDetails>();
            purchaseCourseDetails = reqPaymentDto.reqPurchaseCourseDetails;
            string jsonString = JsonConvert.SerializeObject(purchaseCourseDetails);

            //Creating Metadata which is to be sent in the InvoiceCreation
            Dictionary<string, string> metaData = new Dictionary<string, string>();
            metaData["Environment"] = _environment.EnvironmentName;
            int no = 1;
            for (int i = 0; i < jsonString.Length; i = i + 450)
            {
                try
                {
                    string newString = jsonString.Substring(i, Math.Min(450, jsonString.Length - i));
                    metaData["chunk" + no] = newString;
                }
                catch (Exception e)
                {
                    throw new UserFriendlyException(e.Message);
                }
                no++;
            }
            no--;
            metaData["noOfChunk"] = no.ToString();

            List<SessionLineItemOptions> sessionLineItemOptions = new List<SessionLineItemOptions>();
            foreach (var item in reqPaymentDto.reqPurchaseCourseDetails)
            {
                SessionLineItemOptions sessionLineItem = new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmountDecimal = (decimal?)item.UnitAmount * 100,
                        Currency = item.CurrencyType,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.CourseName,
                            Description = item.CourseDescription,
                            Metadata = new Dictionary<string, string>()
                                {
                                    {
                                        "CourseId",item.CourseId
                                    }
                                }
                        },
                        TaxBehavior = "inclusive",
                    },
                    Quantity = item.Quantity,
                };
                sessionLineItemOptions.Add(sessionLineItem);
            }
            string currency = reqPaymentDto.reqPurchaseCourseDetails.First().CurrencyType;
            var sessionOptions = new SessionCreateOptions
            {
                InvoiceCreation = new SessionInvoiceCreationOptions
                {
                    Enabled = true,
                    InvoiceData = new SessionInvoiceCreationInvoiceDataOptions()
                    {
                        Metadata = metaData
                    }
                },
                SuccessUrl = $"{reqPaymentDto.SuccessUrl}",
                CancelUrl = $"{reqPaymentDto.CancelUrl}",
                CustomerEmail = reqPaymentDto.PayerEmail,

                // ideal payment type is only valid with netharland currency type i.e. EUR
                PaymentMethodTypes = currency == "EUR" ? new List<string> {"card", "ideal" } : new List<string> { "card"},
                LineItems = sessionLineItemOptions,
                Mode = "payment",
                Metadata = new Dictionary<string, string>
                {
                    { "Environment", _environment.EnvironmentName }
                },
                AutomaticTax = new SessionAutomaticTaxOptions
                {
                    Enabled = true,
                }
            };

            SessionService service = new SessionService();
            try
            {
                Session session = await service.CreateAsync(sessionOptions);
                ResCheckoutPaymentDto resCheckoutPaymentDto = new ResCheckoutPaymentDto
                {
                    sessionId = session.Id,
                    Url = session.Url,
                    PublicKey = _stripeOptions.PubKey
                };
                return resCheckoutPaymentDto;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(ex.Message);
            }
        }

        /// <summary>
        /// Methos is to use for webhook to save the payment detailis.
        /// </summary>
        /// <returns>Task empty.</returns>
        [AllowAnonymous]
        public async Task Webhook()
        {
            try
            {
                string json = await new StreamReader(_httpContextAccessor.HttpContext.Request.Body).ReadToEndAsync();
                var stripeEvent = EventUtility.ConstructEvent(json,
                   _httpContextAccessor.HttpContext.Request.Headers["Stripe-Signature"], _stripeOptions.WebHookSecreteKey);

                if (stripeEvent.Type == Events.InvoicePaymentSucceeded)
                {
                    var session = stripeEvent.Data.Object as Invoice;
                    string environmentMetadata = session.Metadata?.GetValueOrDefault("Environment");

                    if (session != null && environmentMetadata != null && _environment.IsEnvironment(environmentMetadata))
                    {
                        int noOfChunks = int.Parse(session.Metadata?.GetValueOrDefault("noOfChunk"));
                        string jsonString = "";
                        for (int i = 1; i <= noOfChunks; i++)
                        {
                            string newString = session.Metadata?.GetValueOrDefault("chunk" + i);
                            jsonString += newString;
                        }
                        List<ReqPurchaseCourseDetails> deserializedList = JsonConvert.DeserializeObject<List<ReqPurchaseCourseDetails>>(jsonString);

                        var reqWebhookPaymentDto = new ReqWebhookPaymentDto
                        {
                            TransactionId = session.PaymentIntentId,
                            PayerEmail = session.CustomerEmail,
                            ToatalAmount = session.AmountPaid / 100,
                            CurrencyType = session.Currency,
                            InvoiceId = session.Id,
                            InvoiceMasterLink = session.HostedInvoiceUrl,
                            InvoicePdfLink = session.InvoicePdf,
                            PurchaseDate = DateTime.UtcNow
                        };

                        UserDetail? userDetail = new();
                        Company? companyDetail = await _companyRepository.FirstOrDefaultAsync(x => x.Email == session.CustomerEmail);
                        if (companyDetail == null)
                        {
                            userDetail = await _userRepository.FirstOrDefaultAsync(x => x.Email == session.CustomerEmail);
                            reqWebhookPaymentDto.UserId = userDetail != null ? userDetail.Id : Guid.Empty;
                        }
                        else
                        {
                            reqWebhookPaymentDto.CompanyId = companyDetail.Id;
                        }

                        if (companyDetail != null)
                        {
                            await _cartRepository.DeleteDirectAsync(x => x.CompanyId == companyDetail.Id);
                        }
                        else
                        {
                            await _cartRepository.DeleteDirectAsync(x => x.UserId == userDetail.Id);
                        }
                        PurchaseDetail purchaseDetailModel = _mapper.Map<PurchaseDetail>(reqWebhookPaymentDto);
                        PurchaseDetail resultPurchase = await _purchaseRepository.InsertAsync(purchaseDetailModel, true);
                        List<CourseSubscriptionMapping> courseSubscriptionMappings = new();
                        foreach (ReqPurchaseCourseDetails item in deserializedList)
                        {
                            CourseSubscriptionMapping courseSubscription = new CourseSubscriptionMapping
                            {
                                CourseId = Guid.Parse(item.CourseId),
                                ExamType = item.ExamType,
                                TotalCount = (int)item.Quantity,
                                RemainingCount = (int)item.Quantity,
                                PayementId = resultPurchase.Id,
                                PurchasedDate = resultPurchase.PurchaseDate,
                                ExpirationDate = resultPurchase.PurchaseDate.AddYears(_appOptions.CourseExpirationInYears),
                                PlanType = item.PlanType,
                                TotalAmount = item.UnitAmount * item.Quantity,
                            };
                            if (companyDetail == null)
                            {
                                courseSubscription.UserId = userDetail != null ? userDetail.Id : Guid.Empty;
                            }
                            else
                            {
                                courseSubscription.CompanysId = companyDetail.Id;
                            }
                            courseSubscriptionMappings.Add(courseSubscription);
                        }
                        await _courseSubscriptionRepository.InsertManyAsync(courseSubscriptionMappings, true);


                        // If buyer is user then we are enrolled this course to user after subscription.
                        if (userDetail != null)
                            await _courseDomainService.AssignCourseToUserAsync(userDetail.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Method to add Custom course request into the database and send email for that to all the admins
        /// </summary>
        /// <param name="req">request parameter of type CustomCourseRequestDto</param>
        /// <returns>Result string</returns>
        [Authorize(VirtaulAidPermissions.Purchase.Default)]
        public async Task<string> CustomCourseContactUsAsync(CustomCourseRequestDto req, string culture)
        {
            CustomCourseRequest courseRequest = _mapper.Map<CustomCourseRequest>(req);
            CustomCourseRequest result = await _customCourseRequestRepository.InsertAsync(courseRequest, true);
            if (result != null)
            {
                result = (await _customCourseRequestRepository.WithDetailsAsync(x => x.Company, y => y.Course)).First(x => x.Id == result.Id);
            }
            else
            {
                throw new UserFriendlyException(_localizer["RequestNotExists"], StatusCodes.Status404NotFound.ToString());
            }
            CustomCourseRequestDetailsDto customCourseRequestDetailsDto = _mapper.Map<CustomCourseRequestDetailsDto>(result);

            List<UserDetail> admins = (await _adminReportDomainService.GetAdminAndSuperAdminListAsync()).ToList();
            // For admin and super admin listing
            List<UserDetailsDto> adminList = _mapper.Map<List<UserDetailsDto>>(admins);
            if (adminList != null && adminList.Count > 0)
            {
                // We are sending the email to the admin and super admin for custom plan request from company.
                await _emailService.SendBulkEmailToAdminForCourseSubscriptionAsync(adminList, customCourseRequestDetailsDto, culture);
            }

            return "Request Sent.";
        }
    }
}
