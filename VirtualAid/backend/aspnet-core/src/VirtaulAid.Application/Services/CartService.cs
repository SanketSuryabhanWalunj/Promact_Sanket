using AutoMapper;
using DocumentFormat.OpenXml.Drawing.Charts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VirtaulAid.Carts;
using VirtaulAid.Companies;
using VirtaulAid.Courses;
using VirtaulAid.DTOs.Cart;
using VirtaulAid.DTOs.Course;
using VirtaulAid.Interfaces;
using VirtaulAid.Localization;
using VirtaulAid.Permissions;
using VirtaulAid.Users;
using Volo.Abp;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace VirtaulAid.Services
{
    [Authorize(Roles = "Company, Individual, Admin, Super Admin")]
    public class CartService : ApplicationService, ICartServices
    {
        private readonly IRepository<Course> _coursesRepository;
        private readonly IRepository<Cart> _cartRepository;
        private readonly IRepository<CourseTypePrice> _coursePriceRepository;
        private readonly IMapper _mapper;
        private readonly IStringLocalizer<VirtaulAidResource> _localizer;
        private readonly IRepository<UserDetail> _userDetailRepository;
        private readonly IRepository<Company> _companyRepository;

        public CartService(IRepository<Course> coursesRepository,
            IMapper mapper,
            IRepository<Cart> cartRepository,
            IRepository<CourseTypePrice> coursePriceRepository,
            IStringLocalizer<VirtaulAidResource> localizer,
            IRepository<UserDetail> userDetailRepository,
            IRepository<Company> companyRepository)
        {
            _coursesRepository = coursesRepository;
            _mapper = mapper;
            _cartRepository = cartRepository;
            _coursePriceRepository = coursePriceRepository;
            _localizer = localizer;
            _userDetailRepository = userDetailRepository;
            _companyRepository = companyRepository;
        }

        /// <summary>
        /// Method is to Add the course item with count in cart.
        /// </summary>
        /// <param name="reqAddCartDto">Get the dto to add in cart.</param>
        /// <returns>Task of ResAddCartDto.</returns>
        /// <exception cref="UserFriendlyException">Thow the condition wise exception.</exception>
        [Authorize(VirtaulAidPermissions.Cart.Create)]
        public async Task<ResAddCartDto> AddCourseInCartAsync(ReqAddCartDto reqAddCartDto)
        {
            if ((reqAddCartDto.CourseId == Guid.Empty && reqAddCartDto.CourseId == null) || reqAddCartDto.CourseCount <= 0)
            {
                throw new UserFriendlyException(_localizer["CourseIdCourseCountEmpty"], StatusCodes.Status409Conflict.ToString());
            }

            Course isCourseAvailable = await _coursesRepository.FirstOrDefaultAsync(c => c.Id == reqAddCartDto.CourseId);
            if (isCourseAvailable == null)
            {
                throw new UserFriendlyException(_localizer["CourseNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            double discount = 0;
            if(reqAddCartDto.CourseCount > 10 && reqAddCartDto.CourseCount <= 50)
            {
                discount = 5;
            } else if (reqAddCartDto.CourseCount > 50 && reqAddCartDto.CourseCount <= 100)
            {
                discount = 10;
            }

            Cart cart = new();
            if (reqAddCartDto.CompanyId != Guid.Empty && reqAddCartDto.CompanyId != null)
            {
                cart = await _cartRepository.FirstOrDefaultAsync(x => x.CourseId == reqAddCartDto.CourseId && x.CompanyId == reqAddCartDto.CompanyId && x.ExamType == reqAddCartDto.ExamType);
            }
            else if(reqAddCartDto.UserId != Guid.Empty && reqAddCartDto.UserId != null)
            {
                cart = await _cartRepository.FirstOrDefaultAsync(x => x.CourseId == reqAddCartDto.CourseId && x.UserId == reqAddCartDto.UserId && x.ExamType == reqAddCartDto.ExamType);
            }
            else
            {
                throw new UserFriendlyException(_localizer["CompanyIdUserIdEmpty"] , StatusCodes.Status400BadRequest.ToString());
            }
             
            Cart cartdetails = new();
            if (cart == null)
            {
                Cart cartModel = _mapper.Map<Cart>(reqAddCartDto);
                cartdetails = await _cartRepository.InsertAsync(cartModel, true);
            }
            else
            {
                cart.CourseCount = reqAddCartDto.CourseCount;
                cartdetails = await _cartRepository.UpdateAsync(cart, true);
            }

            ResAddCartDto result = _mapper.Map<ResAddCartDto>(cartdetails);
            Course courseDetails = await _coursesRepository.FirstAsync(c => c.Id == result.CourseId);
            result.CourseDetails = _mapper.Map<ResCourseDetailDto>(courseDetails);
            CourseTypePrice courseTypePriceAsync = await _coursePriceRepository.FirstOrDefaultAsync(c => c.Name == reqAddCartDto.ExamType);
            double courseTypePrice = courseTypePriceAsync.Price;
            result.CourseDetails.Price = courseTypePrice - discount;
            return result;
        }

        /// <summary>
        /// Method is to get the cartlist by company id.
        /// </summary>
        /// <param name="companyId">Company id for getting cart list.</param>
        /// <returns>Task list of cart including course details.</returns>
        [Authorize(VirtaulAidPermissions.Cart.Default)]
        public async Task<List<ResAddCartDto>> GetCartsByCompanyIdAsync(Guid companyId)
        {
            List<Cart> carts = await _cartRepository.GetListAsync(x => x.CompanyId == companyId);           
            return await PrepareCartList(carts);
        }

        /// <summary>
        /// Method is to get the cartlist by user id.
        /// </summary>
        /// <param name="userId">User id for getting cart list.</param>
        /// <returns>Task list of cart including course details.</returns>
        [Authorize(VirtaulAidPermissions.Cart.Default)]
        public async Task<List<ResAddCartDto>> GetCartsByUserIdAsync(Guid userId)
        {
            List<Cart> carts = await _cartRepository.GetListAsync(x => x.UserId == userId);
            return await PrepareCartList(carts);
        }


        /// <summary>
        /// Method is to update the course count that are stored in cart.
        /// </summary>
        /// <param name="CartId">Cart Id for updation.</param>
        /// <param name="courseCount">To be updated the count.</param>
        /// <returns>Task upadtes cart object.</returns>
        /// <exception cref="UserFriendlyException">Cart does not exists.</exception>
        [Authorize(VirtaulAidPermissions.Cart.Edit)]
        public async Task<ResAddCartDto> UpdateCartAsync(Guid CartId, int courseCount)
        {
            if(courseCount <= 0)
                throw new UserFriendlyException(_localizer["InvalidCartCount"], StatusCodes.Status400BadRequest.ToString());

            Cart cart = await _cartRepository.FirstOrDefaultAsync(x => x.Id == CartId);
            if (cart == null)
            {
                throw new UserFriendlyException(_localizer["CartNotExist"], StatusCodes.Status404NotFound.ToString());
            }

            double discount = 0;
            if (courseCount > 10 && courseCount <= 50)
            {
                discount = 5;
            }
            else if (courseCount > 50 && courseCount <= 100)
            {
                discount = 10;
            }

            cart.CourseCount = courseCount;
            Cart cartdetails = await _cartRepository.UpdateAsync(cart, true);
            ResAddCartDto result = _mapper.Map<ResAddCartDto>(cartdetails);
            Course courseDetails = await _coursesRepository.FirstAsync(c => c.Id == result.CourseId);
            result.CourseDetails = _mapper.Map<ResCourseDetailDto>(courseDetails);
            CourseTypePrice courseTypePriceAsync = await _coursePriceRepository.FirstOrDefaultAsync(c => c.Name == cart.ExamType);
            double courseTypePrice = courseTypePriceAsync.Price;
            result.CourseDetails.Price = courseTypePrice - discount;
            return result;
        }

        /// <summary>
        /// Method is to delete cart by cart id.
        /// </summary>
        /// <param name="CartId">Cart Id that we are deleting.</param>
        /// <returns>Task delete confirmation string.</returns>
        /// <exception cref="UserFriendlyException"></exception>
        [Authorize(VirtaulAidPermissions.Cart.Delete)]
        public async Task<string> DeleteCartByIdAsync(Guid CartId)
        {
            Cart cart = await _cartRepository.FirstOrDefaultAsync(x => x.Id == CartId);
            if (cart == null)
            {
                throw new UserFriendlyException(_localizer["CartNotExist"], StatusCodes.Status404NotFound.ToString());
            }
            await _cartRepository.DeleteAsync(cart);
            return _localizer["CartDeleted"];
        }
   
        /// <summary>
        /// Method is to create the cart list as per input. 
        /// </summary>
        /// <param name="carts">list of carts.</param>
        /// <returns>List of carts with course details.</returns>
        private async Task<List<ResAddCartDto>> PrepareCartList(List<Cart> carts)
        {
            if (carts == null)
            {
                return new List<ResAddCartDto>();
            }
            List<ResAddCartDto> cartList = _mapper.Map<List<ResAddCartDto>>(carts);
            List<Course> courseList = await _coursesRepository.GetListAsync(x => cartList.Select(b => b.CourseId).Contains(x.Id));
            Dictionary<string, double> Prices = new Dictionary<string, double>();
            List<CourseTypePrice> courseTypePrices = await _coursePriceRepository.GetListAsync();
            foreach(CourseTypePrice courseType in  courseTypePrices)
            {
                Prices.Add(courseType.Name, courseType.Price);
            }
            cartList.ForEach(a => 
            {
                a.CourseDetails = _mapper.Map<ResCourseDetailDto>(courseList.First(b => b.Id == a.CourseId));
                double courseTypePrice = Prices[a.ExamType];
                double discount = 0;
                if (a.CourseCount > 10 && a.CourseCount <= 50)
                {
                    discount = 5;
                }
                else if (a.CourseCount > 50 && a.CourseCount <= 100)
                {
                    discount = 10;
                }
                a.CourseDetails.Price = courseTypePrice - discount;
            });

            return cartList;
        }

        /// <summary>
        /// Method to clear the cart by user id.
        /// </summary>
        /// <param name="userId">user id of the user</param>
        /// <returns>string specifying the status</returns>
        [Authorize(VirtaulAidPermissions.Cart.Delete)]
        public async Task<string> DeleteCartForUserAsync(Guid userId)
        {
            UserDetail user = await _userDetailRepository.FirstOrDefaultAsync(x => x.Id == userId);
            Company company = await _companyRepository.FirstOrDefaultAsync(x => x.Id == userId);

            if(user != null)
            {               
                await _cartRepository.DeleteDirectAsync(x => x.UserId == userId);
            }
            if(company != null)
            {
                await _cartRepository.DeleteDirectAsync(x => x.CompanyId == userId);
            }

            return _localizer["CartDeleted"];
        }
    }
}
