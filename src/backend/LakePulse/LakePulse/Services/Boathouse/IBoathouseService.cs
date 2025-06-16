using LakePulse.DTOs;

namespace LakePulse.Boathouse.Email
{
    public interface IBoathouseService
    {
        #region Public Methods
        /// <summary>
        /// Sends an email asynchronously using the provided BoathouseEmailDto.
        /// </summary>
        /// <param name="boathouseEmailDto">The data transfer object containing email details such as subject, recipient email, sender name, and message.</param>
        /// <returns>A Task representing the asynchronous operation.</returns>
        Task SendBoathouseEmailAsync(BoathouseEmailDto boathouseEmailDto);
        #endregion
    }
}
