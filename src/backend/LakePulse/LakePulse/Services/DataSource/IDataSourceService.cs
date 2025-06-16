using LakePulse.DTOs;
using LakePulse.DTOs.DataSource;

namespace LakePulse.Services.DataSource
{
    public interface IDataSourceService
    {
        /// <summary>  
        /// Uploads lake data source files along with their details.  
        /// </summary>  
        /// <param name="files">The list of files to upload.</param>  
        /// <param name="dataSourceFilesDetails">The details of the data source files being uploaded.</param>  
        /// <returns>A task representing the asynchronous operation.</returns>  
        Task UploadLakeDataSourceFileAsync(List<IFormFile> files, List<DataSourceUploasRequestDto> dataSourceFilesDetails);

        /// <summary>  
        /// Retrieves a specific data source file as a byte array.  
        /// </summary>  
        /// <param name="fileName">The name of the file to retrieve.</param>  
        /// <param name="dataSourceType">The type of the data source.</param>  
        /// <returns>A task that returns the file as a byte array.</returns>  
        Task<byte[]> GetDataSourceFileAsync(string fileName, string dataSourceType);

        /// <summary>  
        /// Retrieves details of lake documents based on the provided request parameters.  
        /// </summary>  
        /// <param name="requestDto">The request parameters for filtering and pagination.</param>  
        /// <returns>A task that returns a list of data source response DTOs.</returns>  
        Task<List<DataSourceResponseDto>> GetDataSourceLakeDocumentsDetailsAsync(DataSourceDetailsRequestDto requestDto);
    }
}
