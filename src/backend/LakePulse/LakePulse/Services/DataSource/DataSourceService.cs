using AutoMapper;
using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.DTOs.DataSource;
using LakePulse.Services.AmazonS3;
using Microsoft.EntityFrameworkCore;

namespace LakePulse.Services.DataSource
{
    public class DataSourceService : IDataSourceService
    {
        private readonly IS3Service _s3Service;
        private readonly IConfiguration _configuration;
        private readonly string _bucketName;
        private readonly string _region;
        private readonly ApplicationDbContext _dbContext;
        private readonly IMapper _mapper;

        public DataSourceService(IS3Service s3Service,
             IConfiguration configuration
,
             ApplicationDbContext dbContext,
             IMapper mapper)
        {
            _s3Service = s3Service;
            _configuration = configuration;
            _bucketName = _configuration["AWS:Bucket"];
            _region = _configuration["AWS:Region"];
            _dbContext = dbContext;
            _mapper = mapper;
        }


        /// <summary>
        /// Uploads a list of lake data source files to Amazon S3 and saves their metadata to the database.  
        /// </summary>  
        /// <param name="files">The list of files to upload.</param>  
        /// <param name="dataSourceFilesDetails">The details of the data source files, including metadata such as type, label, and comments.</param>  
        /// <returns>A task that represents the asynchronous operation.</returns>  
        public async Task UploadLakeDataSourceFileAsync(List<IFormFile> files, List<DataSourceUploasRequestDto> dataSourceFilesDetails)
        {
            List<Models.DataSource> dataSourceList = new();
            foreach (IFormFile file in files)
            {
                DataSourceUploasRequestDto dataSourceFileDetail = dataSourceFilesDetails.First(x => x.FileName == file.FileName);
                string key = await _s3Service.UploadFileAsync(file, dataSourceFileDetail.DataSourceType);
                Models.DataSource dataSource = new()
                {
                    FileName = key,
                    FileType = file.ContentType,
                    DataSourceType = dataSourceFileDetail.DataSourceType,
                    FilePath = $"https://{_bucketName}.{_region}.s3.amazonaws.com/{dataSourceFileDetail.DataSourceType}/{key}",
                    ReportDate = dataSourceFileDetail.ReportDate,
                    Label = dataSourceFileDetail.Label,
                    Comment = dataSourceFileDetail.Comment,
                    LakePulseId = dataSourceFileDetail.LakePulseId,
                    UserId = dataSourceFileDetail.UserId,
                    CreatedBy = dataSourceFileDetail.UserId,
                    CreatedTime = DateTime.UtcNow
                };
                dataSourceList.Add(dataSource);
            }

            await _dbContext.DataSources.AddRangeAsync(dataSourceList);
            await _dbContext.SaveChangesAsync();
        }

        /// <summary>  
        /// Retrieves a specific data source file as a byte array from Amazon S3.  
        /// </summary>  
        /// <param name="fileName">The name of the file to retrieve.</param>  
        /// <param name="dataSourceType">The type of the data source to determine the target bucket.</param>  
        /// <returns>A task that represents the asynchronous operation. The task result contains the file as a byte array.</returns>  
        public async Task<byte[]> GetDataSourceFileAsync(string fileName, string dataSourceType)
        {
            byte[] response = await _s3Service.GetFileAsync(fileName, dataSourceType);
            return response;
        }

        /// <summary>   
        /// Retrieves details of lake documents based on the provided request parameters,  
        /// including filtering, sorting, and pagination.  
        /// If the data source type is "test", presigned URLs are generated for the files.  
        /// </summary>  
        /// <param name="requestDto">The request parameters for filtering, sorting, and pagination.</param>  
        /// <returns>A task that returns a list of data source details, including optional presigned URLs.</returns>  
        public async Task<List<DataSourceResponseDto>> GetDataSourceLakeDocumentsDetailsAsync(DataSourceDetailsRequestDto requestDto)
        {
            IQueryable<Models.DataSource> query = _dbContext.DataSources
                .Where(x => x.LakePulseId == requestDto.lakePulseId && x.DataSourceType == requestDto.dataSourceType);

            if (!string.IsNullOrEmpty(requestDto.searchTerm))
            {
                query = query.Where(x => x.FileName.ToLower().Contains(requestDto.searchTerm.ToLower()));
            }

            if (requestDto.fromDate.HasValue)
            {
                query = query.Where(x => x.ReportDate >= requestDto.fromDate.Value);
            }

            if (requestDto.toDate.HasValue)
            {
                query = query.Where(x => x.ReportDate <= requestDto.toDate.Value);
            }

            switch (requestDto.sortBy?.ToLower())
            {
                case "filename":
                    query = requestDto.sortDirection?.ToLower() == StringConstant.DESC.ToLower()
                        ? query.OrderByDescending(x => x.FileName)
                        : query.OrderBy(x => x.FileName);
                    break;
                case "label":
                    query = requestDto.sortDirection?.ToLower() == StringConstant.DESC.ToLower()
                        ? query.OrderByDescending(x => x.Label)
                        : query.OrderBy(x => x.Label);
                    break;
                case "reportdate":
                    query = requestDto.sortDirection?.ToLower() == StringConstant.DESC.ToLower()
                        ? query.OrderByDescending(x => x.ReportDate)
                        : query.OrderBy(x => x.ReportDate);
                    break;
                default:
                    query = query.OrderBy(x => x.FileName);
                    break;
            }

            int skip = (requestDto.pageNumber - 1) * requestDto.pageSize;
            query = query.Skip(skip).Take(requestDto.pageSize);
            List<Models.DataSource> dataSourceList = await query.ToListAsync();
            List<DataSourceResponseDto> dataSourceDto = _mapper.Map<List<DataSourceResponseDto>>(dataSourceList);
            List<string> fileName = dataSourceList.Select(x => x.FileName).ToList();
            Dictionary<string, string> presignedUrls = await _s3Service.GeneratePresignedUrls(fileName, requestDto.dataSourceType);
            foreach (DataSourceResponseDto dataSource in dataSourceDto)
            {
                string key = $"{requestDto.dataSourceType}/{dataSource.FileName}";
                if (presignedUrls.ContainsKey(key))
                {
                    dataSource.PresignedURL = presignedUrls[key];
                }
            }
            return dataSourceDto;
        }
    }
}
