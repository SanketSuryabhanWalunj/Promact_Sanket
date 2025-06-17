using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Volo.Abp.Application.Services;
using VirtaulAid.DTOs.Purchase;

namespace VirtaulAid.Interfaces
{
    public interface IPaymentService : IApplicationService
    {
        /// <summary>
        /// Method to add the Purchase details using ReqPurchaseDto.
        /// </summary>
        /// <param name="reqPurchaseModel">ReqPurchaseDto to add record.</param>
        /// <returns>Task ResPurchaseDto.</returns>
        /// <exception cref="UserFriendlyException">CompanyNotExist.</exception>
        Task<ResPurchaseDto> AddPurchaseDetails(ReqPurchaseDto reqPurchaseModel);

        /// <summary>
        /// Methos is to get purchase history by company id.
        /// </summary>
        /// <param name="companyId"> company Id.</param>
        /// <returns>Task list of ResPurchaseDto.</returns>
        Task<List<ResPurchaseDto>> GetPurchaseListByCompanyIdAsync(Guid companyId);

        /// <summary>
        /// Methos is to get purchase history by user id.
        /// </summary>
        /// <param name="userId"> user Id.</param>
        /// <returns>Task list of ResPurchaseDto.</returns>
        Task<List<ResPurchaseDto>> GetPurchaseListByUserIdAsync(Guid userId);


        /// <summary>
        /// Method is to get the payment checkout for payment.
        /// </summary>
        /// <param name="reqPaymentDto">request payment dto.</param>
        /// <returns>Task ResCheckoutPaymentDto.</returns>
        Task<ResCheckoutPaymentDto> PaymentCheckOutAsync(ReqCheckoutPaymentDto reqPaymentDto);

        /// <summary>
        /// Methos is to use for webhook to save the payment detailis.
        /// </summary>
        /// <returns>Task empty.</returns>
        Task Webhook();
    }
}
