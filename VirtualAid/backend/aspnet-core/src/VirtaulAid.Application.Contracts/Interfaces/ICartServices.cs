using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Cart;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface ICartServices : IApplicationService
    {

        /// <summary>
        /// Method is to Add the course item with count in cart.
        /// </summary>
        /// <param name="reqAddCartDto">Get the dto to add in cart.</param>
        /// <returns>Task of ResAddCartDto.</returns>
        Task<ResAddCartDto> AddCourseInCartAsync(ReqAddCartDto reqAddCartDto);

        /// <summary>
        /// Method is to get the cartlist by company id.
        /// </summary>
        /// <param name="companyId">Company id for getting cart list.</param>
        /// <returns>Task list of cart including course details.</returns>
        Task<List<ResAddCartDto>> GetCartsByCompanyIdAsync(Guid companyId);

        /// <summary>
        /// Method is to get the cartlist by user id.
        /// </summary>
        /// <param name="userId">User id for getting cart list.</param>
        /// <returns>Task list of cart including course details.</returns>       
        Task<List<ResAddCartDto>> GetCartsByUserIdAsync(Guid userId);

        /// <summary>
        /// Method is to update the course count that are stored in cart.
        /// </summary>
        /// <param name="CartId">Cart Id for updation.</param>
        /// <param name="courseCount">To be updated the count.</param>
        /// <returns>Task upadtes cart object.</returns>
        Task<ResAddCartDto> UpdateCartAsync(Guid CartId, int courseCount);

        /// <summary>
        /// Method is to delete cart by cart Id.
        /// </summary>
        /// <param name="CartId">Cart Id that we are deleting.</param>
        /// <returns>Task delete confirmation string.</returns>
        Task<string> DeleteCartByIdAsync(Guid CartId);
    }
}
