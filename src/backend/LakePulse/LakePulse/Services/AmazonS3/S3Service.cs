using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;


namespace LakePulse.Services.AmazonS3
{
    public class S3Service : IS3Service
    {
        private readonly IAmazonS3 _s3Client;
        private readonly IConfiguration _configuration;
        private readonly string _bucketName;


        public S3Service(IAmazonS3 s3Client,
             IConfiguration configuration)
        {
            _s3Client = s3Client; // This line comments out when ypou run at local server and uncomment when you deployment.
            _configuration = configuration;
            _bucketName = _configuration["AWS:Bucket"];

            // Below five lines of code Required for the local testing environment, Comment it at the time of deployment.
            // string accessKey = "#";
            // string secretKey = "#";
            //RegionEndpoint region = RegionEndpoint.GetBySystemName("us-east-1");
            //BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            //_s3Client = new AmazonS3Client(credentials, region);
        }

        #region public methods

        /// <summary>  
        /// Uploads a file to the specified Amazon S3 bucket based on the data source type.  
        /// </summary>  
        /// <param name="file">The file to upload.</param>  
        /// <param name="dataSourceType">The type of data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the key of the uploaded file.</returns>  
        public async Task<string> UploadFileAsync(IFormFile file, string dataSourceType)
        {

            using Stream stream = file.OpenReadStream();
            PutObjectRequest request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = dataSourceType + "/" + file.FileName,
                InputStream = stream,
                ContentType = file.ContentType
            };

            await _s3Client.PutObjectAsync(request);
            return file.FileName;
        }

        /// <summary>  
        /// Retrieves a file from the specified Amazon S3 bucket based on the data source type.  
        /// </summary>  
        /// <param name="fileName">The name of the file to retrieve.</param>  
        /// <param name="dataSourceType">The type of data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the file as a byte array.</returns>  
        public async Task<byte[]> GetFileAsync(string fileName, string dataSourceType)
        {
            string key = $"{dataSourceType}/{fileName}";
            GetObjectRequest request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };

            using GetObjectResponse response = await _s3Client.GetObjectAsync(request);
            using MemoryStream memoryStream = new MemoryStream();
            await response.ResponseStream.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }

        /// <summary>  
        /// Generates pre-signed URLs for a list of files in the specified Amazon S3 bucket.  
        /// </summary>  
        /// <param name="fileNames">The list of file names for which to generate pre-signed URLs.</param>  
        /// <param name="dataSourceType">The type of data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains a dictionary where the keys are file keys and the values are the corresponding pre-signed URLs.</returns>  
        public async Task<Dictionary<string, string>> GeneratePresignedUrls(List<string> fileNames, string dataSourceType)
        {
            IEnumerable<Task<KeyValuePair<string, string>>> tasks = fileNames.Select(fileName => Task.Run(() =>
                {
                    string key = $"{dataSourceType}/{fileName}";
                    GetPreSignedUrlRequest request = new GetPreSignedUrlRequest
                    {
                        BucketName = _bucketName,
                        Key = key,
                        Expires = DateTime.UtcNow.Add(TimeSpan.FromMinutes(30)),
                        Verb = HttpVerb.GET
                    };
                    return new KeyValuePair<string, string>(key, _s3Client.GetPreSignedURL(request));
                }));

            KeyValuePair<string, string>[] results = await Task.WhenAll(tasks);
            return results.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }
        #endregion
    }
}
