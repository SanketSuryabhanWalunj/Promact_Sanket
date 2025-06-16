using LakePulse.Data;
using LakePulse.DTOs;
using LakePulse.DTOs.DataSource;
using LakePulse.Services.DataSource;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace LakePulse.Controllers
{

    [Authorize(Roles = "Super Admin, Admin, User")]
    [Route("api/data-source")]
    [ApiController]
    public class DataSourceController : ControllerBase
    {
        private readonly IDataSourceService _dataSourceService;

        public DataSourceController(IDataSourceService dataSourceService)
        {
            _dataSourceService = dataSourceService;
        }

        /// <summary>  
        /// Uploads lake data source files along with their metadata details.  
        /// </summary>  
        /// <param name="files">The list of files to upload.</param>  
        /// <param name="dataSourceFilesDetailsJson">The JSON string containing metadata details for the files.</param>  
        /// <returns>An IActionResult indicating the result of the upload operation.</returns>  
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadLakeDataSourceFileAsync([FromForm] List<IFormFile> files, [FromForm] string dataSourceFilesDetailsJson)
        {
            if (files == null || files.Count == 0 || string.IsNullOrEmpty(dataSourceFilesDetailsJson))
                return BadRequest(StringConstant.fileOrMetadataMissing);

            var dataSourceFilesDetails = JsonConvert.DeserializeObject<List<DataSourceUploasRequestDto>>(dataSourceFilesDetailsJson);

            if (dataSourceFilesDetails == null || dataSourceFilesDetails.Count != files.Count)
                return BadRequest(StringConstant.mismatchFilesData);

            await _dataSourceService.UploadLakeDataSourceFileAsync(files, dataSourceFilesDetails);
            return Ok(StringConstant.fileUploadedSuccessfully);
        }

        /// <summary>  
        /// Downloads a specific lake data source file.  
        /// </summary>  
        /// <param name="fileName">The name of the file to download.</param>  
        /// <param name="dataSourceType">The type of the data source.</param>  
        /// <returns>The file as a downloadable stream or a NotFound result if the file does not exist.</returns>  
        [HttpGet("download/{fileName}")]
        public async Task<IActionResult> DownloadDataSourceFileAsync(string fileName, [Required] string dataSourceType)
        {
            try
            {
                var content = await _dataSourceService.GetDataSourceFileAsync(fileName, dataSourceType);
                return File(content, "application/octet-stream", fileName);
            }
            catch
            {
                return NotFound(StringConstant.fileNotFound);
            }
        }



        /// <summary>
        /// Retrieves details of lake documents based on the provided request parameters.  
        /// </summary>  
        /// <param name="dataSourceDetailsRequestDto">The request parameters for filtering and pagination.</param>  
        /// <returns>A task that returns an IActionResult containing a list of data source details.</returns>  
        [HttpGet("documents")]
        public async Task<IActionResult> GetDataSourceLakeDocumentsDetailsAsync([FromQuery] DataSourceDetailsRequestDto dataSourceDetailsRequestDto)
        {
            List<DataSourceResponseDto> dataSourceDetails = await _dataSourceService.GetDataSourceLakeDocumentsDetailsAsync(dataSourceDetailsRequestDto);
            return Ok(dataSourceDetails);
        }
    }
}
