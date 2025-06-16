using LakePulse.DTOs;
using LakePulse.Models;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Services.User
{
    public interface IUserService
    {

        /// <summary>
        /// Method is to get the my lakes data from the redshift database.
        /// </summary>
        /// <param name="userId">user id.</param>
        /// <returns>List of MyLakeDto.</returns>
        Task<List<MyLakeDto>> GetMyLakesByUserIdAsync(string userId);

        /// <summary>
        /// Method to add a lake to the user's list of lakes.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <param name="lakeId">Lake id.</param>
        /// <returns>String indicating the result of the operation.</returns>
        Task<string> AddLakesInMyLakeAsync(string userId, string lakeId);

        /// <summary>
        /// Method is to get all user my lakes.
        /// </summary>
        /// <returns>List of my userLake.</returns>
        Task<List<UserLake>> GetAllMyLakeAsync();

        /// <summary>
        /// Method is to delete the user saved lakes.
        /// </summary>
        /// <param name="userId">Lake id.</param>
        /// <param name="lakeId">Lake id of readshift database.</param>
        /// <returns>String.</returns>
        Task<string> DeleteMyLakeAsync(string userId, string lakeId);

        /// <summary>
        /// Method to delete all lakes associated with a user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <returns>Task.</returns>
        Task DeleteUserLakesAsync(string userId);

        /// <summary>
        /// Method to get the count of lakes associated with a user.
        /// </summary>
        /// <param name="userId">User id.</param>
        /// <returns>Count of lakes associated with the user.</returns>
        Task<int> GetMyLakesCountByUserIdAsync(string userId);
    }
}
