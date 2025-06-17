using Microsoft.AspNetCore.Http;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.DTOs.User;
using Volo.Abp.DependencyInjection;

namespace VirtaulAid.Util
{
    public interface IUtilityService: ITransientDependency
    {
        /// <summary>
        /// Upload file.
        /// </summary>
        /// <param name="file">IFormFile object.</param>
        /// <param name="fileName">File name, may include path.</param>
        /// <returns>File path.</returns>
        Task<string> UploadAsync(IFormFile file, string fileName);

        /// <summary>
        /// Method to get all uploaded files paths.
        /// </summary>
        /// <returns>List of the file paths.</returns>
        Task<ICollection<string>> GetAllFilesPathAsync();

        /// <summary>
        /// Extract data from file to crate new user in bulk.
        /// </summary>
        /// <param name="file">IFormFile object.</param>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>List of extracted data.</returns>
        Task<ICollection<BulkUserUploadDto>> ExtractDataFromFileAsync(IFormFile file, string companyId);

        /// <summary>
        /// Method to convert first letter of input to small case.
        /// </summary>
        /// <param name="input">input string.</param>
        /// <returns>converted string.</returns>
        Task<string> ConvertFirstCharToLowerCaseAsync(string input);
    }
}
