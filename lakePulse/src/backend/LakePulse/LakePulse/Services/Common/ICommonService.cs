using LakePulse.DTOs;
using System.Threading.Tasks;

namespace LakePulse.Services.Common
{
    public interface ICommonService
    {
        #region Public Methods
        /// <summary>  
        /// Creates a list of SearchLakeDto objects based on the provided lake metadata and lakepulse IDs.  
        /// </summary>  
        /// <param name="lakeMetaDataResult">The metadata result for lakes.</param>  
        /// <param name="lakepulseIdList">The list of lakepulse IDs.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of SearchLakeDto objects.</returns>  
        Task<List<SearchLakeDto>> CreateLakeDtosAsync(IEnumerable<dynamic> lakeMetaDataResult, List<string> lakepulseIdList);

        /// <summary>  
        /// Retrieves a list of all states as key-value pairs.  
        /// </summary>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of key-value pairs representing states.</returns>  
        Task<List<KeyValuePair<string, string>>> GetAllStateListAsync();

        /// <summary>  
        /// Retrieves the username associated with the specified email address.  
        /// </summary>  
        /// <param name="email">The email address of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the username if found; otherwise, null.</returns>  
        Task<string?> GetUserNameByEmailAsync(string email);

        /// <summary>  
        /// Retrieves community user counts for a list of lakes based on their LakePulse IDs.  
        /// </summary>  
        /// <param name="lakepulseIdList">The list of LakePulse IDs for which to retrieve community user counts.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a list of ComunityMembersDto objects with user counts and details for each lake.</returns>  
        Task<List<ComunityMembersDto>> GetLakesCommunityUserCountsAsync(List<string> lakepulseIdList);

        /// <summary>  
        /// Retrieves the user role associated with the specified subject identifier.  
        /// </summary>  
        /// <param name="sub">The subject identifier of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the user role as a string.</returns>  
        Task<string> GetUserRoleBySubAsync(string sub);

        /// <summary>  
        /// Retrieves the username associated with the specified subject identifier.  
        /// </summary>  
        /// <param name="sub">The subject identifier of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the username if found; otherwise, null.</returns>  
        Task<string> GetUserNameBySubAsync(string sub);

        /// <summary>  
        /// Retrieves the email address associated with the specified subject identifier.  
        /// </summary>  
        /// <param name="sub">The subject identifier of the user.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the email address if found; otherwise, null.</returns>  
        Task<string?> GetUserEmailBySubAsync(string sub);

        /// <summary>  
        /// Retrieves the lake name associated with the specified LakePulse ID.  
        /// </summary>  
        /// <param name="lakepulseId">The LakePulse ID of the lake.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the lake name as a string.</returns>  
        Task<string> GetLakeNameByLakePulseId(string lakepulseId);

        #endregion
    }
}
