using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Appsettings;
using VirtaulAid.DTOs.User;
using Volo.Abp;

namespace VirtaulAid.Util
{
    public class UtilityService: IUtilityService
    {
        public IConfiguration _configurations { get; }
        public AwsAppsettings _options { get; }
        public IAmazonS3 _s3Client { get; }

        public UtilityService(IOptions<AwsAppsettings> options,
            IAmazonS3 s3Client)
        {
            _options = options.Value;
            _s3Client = s3Client;
        }



        /// <summary>
        /// Upload file. Todo: We are not using it now. We will use it in near future.
        /// </summary>
        /// <param name="file">IFormFile object.</param>
        /// <param name="fileName">File name, may include path.</param>
        /// <returns>File path.</returns>
        public async Task<string> UploadAsync(IFormFile file, string fileName)
        {

            FileInfo fileInfo = new FileInfo(file.FileName);
            var filePath = $"{_options.BucketPath}/{fileName}{fileInfo.Extension}";

            var request = new PutObjectRequest
            {
                BucketName = _options.Bucket,
                Key = filePath,
                InputStream = file.OpenReadStream(),
                AutoCloseStream = true
            };
            var response = await _s3Client.PutObjectAsync(request);
            if (response.HttpStatusCode == System.Net.HttpStatusCode.OK)
            {
                return filePath;
            }

            throw new UserFriendlyException($"Failed to upload to {fileName}");
            
        }

        /// <summary>
        /// Method to get all uploaded files paths.
        /// </summary>
        /// <returns>List of the file paths.</returns>
        public async Task<ICollection<string>> GetAllFilesPathAsync()
        {
            // Create an S3 client
            ICollection<string> filePaths = new List<string>();

            // Replace with your bucket name
            var bucketName = _options.Bucket;

            try
            {
                ListObjectsV2Request request = new ListObjectsV2Request
                {
                    BucketName = bucketName
                };

                ListObjectsV2Response response;
                do
                {
                    response = await _s3Client.ListObjectsV2Async(request);

                    foreach (var obj in response.S3Objects)
                    {
                        //Console.WriteLine($"File Name: {obj.Key}");
                        //Console.WriteLine($"File Path: s3://{bucketName}/{obj.Key}");
                        var filePath = $"s3://{bucketName}/{obj.Key}";
                        filePaths.Add(filePath);
                    }

                    request.ContinuationToken = response.NextContinuationToken;
                } while (response.IsTruncated);
            }
            catch (AmazonS3Exception amazonS3Exception)
            {
                Console.WriteLine($"S3 Error: {amazonS3Exception.Message}");
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }

            return filePaths;
        }


        /// <summary>
        /// Extract data from file to crate new user in bulk.
        /// </summary>
        /// <param name="file">IFormFile object.</param>
        /// <param name="companyId">Id of the company.</param>
        /// <returns>List of extracted data.</returns>
        public async Task<ICollection<BulkUserUploadDto>> ExtractDataFromFileAsync(IFormFile file, string companyId)
        {
            var records = new List<BulkUserUploadDto>();

                using (var stream = new MemoryStream())
                {
                    await file.CopyToAsync(stream);

                    using (var workbook = new XLWorkbook(stream))
                    {
                        var worksheet = workbook.Worksheet(1); // Assuming data is in the first worksheet

                        for (int row = 2; row <= worksheet.LastRowUsed().RowNumber(); row++)
                        {
                            var record = new BulkUserUploadDto
                            {
                                FirstName = worksheet.Cell(row, 1).GetString(),
                                LastName = worksheet.Cell(row, 2).GetString(),
                                Email = worksheet.Cell(row, 3).GetString(),
                                ContactNumber = worksheet.Cell(row, 4).GetString(),
                                CurrentCompanyId = companyId
                            };

                            records.Add(record);
                        }
                    }
                }

            return records;

        }

        /// <summary>
        /// Method to convert first letter of input to small case.
        /// </summary>
        /// <param name="input">input string.</param>
        /// <returns>converted string.</returns>
        public async Task<string> ConvertFirstCharToLowerCaseAsync(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            char[] chars = input.ToCharArray();
            chars[0] = char.ToLower(chars[0]);
            return new string(chars);
        }
    }
}
