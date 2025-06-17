using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Repository.Assignments;
using AITrainer.Services.Assignements;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace AITrainer.AITrainer.Core.Controllers;

[Route("api/course-assignments")]
[ApiController]
[Authorize]
public class CourseAssignmentController : ControllerBase
{
    private readonly IAssignmentRepository _assignmentRepository;
    private readonly IAssignmentAppService _assignmentAppService;

    public CourseAssignmentController(IAssignmentRepository assignmentRepository, IAssignmentAppService assignmentAppService)
    {
        _assignmentRepository = assignmentRepository;
        _assignmentAppService = assignmentAppService;
    }

    /// <summary>
    /// Adds a new assignment to a course identified by its ID
    /// </summary>
    /// <param name="courseId">The ID of the course to which the assignment belongs</param>
    /// <param name="input">The data representing the new assignment to be added</param>
    /// <returns>Returns an ActionResult with the newly created assignment information if successful, otherwise returns a bad request message</returns>
    [HttpPost("{courseId}")]
    public async Task<ActionResult> AddCourseAssignmentAsync(string courseId, CreateAssignmentDto input)
    {
        var assignment = await _assignmentAppService.AddCourseAssignmentAsync(courseId, input);
        var result = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(assignment.Content);
        var newResult = new GetAssignmentDto
        {
            Id = assignment.Id,
            TopicId = assignment.TopicId,
            Content = result,
            Marks = assignment.Marks,
            DurationInDay = assignment.DurationInDay,
            CreatedBy = assignment.CreatedBy,
            CreatedDate = assignment.CreatedDate,
            UpdatedBy = assignment.UpdatedBy,
            UpdatedDate = assignment.UpdatedDate,
            IsDeleted = assignment.IsDeleted
        };
        if (newResult != null)
        {
            return Ok(newResult);
        }
        return BadRequest("Something went wrong");

    }

    /// <summary>
    /// Retrieves an assignment by its ID
    /// </summary>
    /// <param name="id">The ID of the assignment to be retrieved</param>
    /// <returns>Returns an ActionResult with the assignment information if found, otherwise returns a not found message</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<GetAssignmentDto>> GetAssignmentAsync(string id)
    {
        var assignment = await _assignmentRepository.GetAssignmentAsync(id);
        if (assignment != null)
        {
            var result = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(assignment.Content);
            var newResult = new GetAssignmentDto
            {
                Id = assignment.Id,
                TopicId = assignment.TopicId,
                Content = result,
                Marks = assignment.Marks,
                DurationInDay = assignment.DurationInDay,
                CreatedBy = assignment.CreatedBy,
                CreatedDate = assignment.CreatedDate,
                UpdatedBy = assignment.UpdatedBy,
                UpdatedDate = assignment.UpdatedDate,
                IsDeleted = assignment.IsDeleted
            };
            return Ok(newResult);
        }
        return NotFound();
    }

    /// <summary>
    /// Deletes an assignment identified by its ID
    /// </summary>
    /// <param name="id">The ID of the assignment to be deleted</param>
    /// <returns>Returns an ActionResult indicating the success or failure of the assignment deletion</returns>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAssignmentAsync(string id)
    {

        var result = await _assignmentAppService.RemoveCourseAssignmentAsync(id);
        if (result != null)
        {
            return Ok("Assignment deleted successfully");
        }
        return BadRequest("Invalid assignment id");
    }
}