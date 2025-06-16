namespace LakePulse.Services.AmazonS3
{
    public interface IS3Service
    {
        /// <summary>  
        /// Uploads a file to the specified Amazon S3 bucket based on the data source type.  
        /// </summary>  
        /// <param name="file">The file to upload.</param>  
        /// <param name="dataSourceType">The type of data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the URL of the uploaded file.</returns>  
        Task<string> UploadFileAsync(IFormFile file, string dataSourceType);

        /// <summary>  
        /// Retrieves a file from the specified Amazon S3 bucket based on the data source type.  
        /// </summary>  
        /// <param name="fileName">The name of the file to retrieve.</param>  
        /// <param name="dataSourceType">The type of data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the file as a byte array.</returns>  
        Task<byte[]> GetFileAsync(string fileName, string dataSourceType);

        /// <summary>  
        /// Generates presigned URLs for a list of files in the specified Amazon S3 bucket based on the data source type.  
        /// </summary>  
        /// <param name="fileNames">The list of file names for which to generate presigned URLs.</param>  
        /// <param name="dataSourceType">The type of data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a dictionary where the keys are file names and the values are their corresponding presigned URLs.</returns>  
        Task<Dictionary<string, string>> GeneratePresignedUrls(List<string> fileNames, string dataSourceType);
    }
}
