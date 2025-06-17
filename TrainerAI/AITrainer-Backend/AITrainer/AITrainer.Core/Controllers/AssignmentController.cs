using AITrainer.AITrainer.Core.Dto;
using AITrainer.AITrainer.Core.Dto.Assignments;
using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.Core.Dto.Quizes;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Assignments;
using AITrainer.Services.Assignements;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Security.Claims;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/assignments")]
    [ApiController]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly IAssignmentRepository _assignmentRepository;
        private readonly IAssignmentAppService _assignmentAppService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AssignmentController(IAssignmentRepository assignmentRepository, IAssignmentAppService assignmentAppService, IHttpContextAccessor httpContextAccessor)
        {
            _assignmentRepository = assignmentRepository;
            _assignmentAppService = assignmentAppService;
            _httpContextAccessor = httpContextAccessor;
        }

        /// <summary>
        /// Retrieves the assignment with the specified ID
        /// </summary>
        /// <param name="id">The unique identifier of the assignment</param>
        /// <returns>Returns an ActionResult with the assignment information</returns>

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
        /// Retrieves a list of assignments filtered by the specified topic ID
        /// </summary>
        /// <param name="topicId">The topic ID used to filter assignments</param>
        /// <returns>Returns an ActionResult with a list of assignment information</returns>

        [HttpGet]
        public async Task<ActionResult> GetAssignmentsAsync([FromQuery] string topicId)
        {
            var assignments = await _assignmentRepository.GetAssignmentsAsync(topicId);
            var result = new List<GetAssignmentDto>();
            foreach (var assignment in assignments)
            {
                var assignmentResult = JsonConvert.DeserializeObject<GetGptAssignmentResponseDto>(assignment.Content);
                var newResult = new GetAssignmentDto
                {
                    Id = assignment.Id,
                    TopicId = assignment.TopicId,
                    Content = assignmentResult,
                    Marks = assignment.Marks,
                    DurationInDay = assignment.DurationInDay,
                    CreatedBy = assignment.CreatedBy,
                    CreatedDate = assignment.CreatedDate,
                    UpdatedBy = assignment.UpdatedBy,
                    UpdatedDate = assignment.UpdatedDate,
                    IsDeleted = assignment.IsDeleted
                };
                result.Add(newResult);
            }

            return Ok(result);
        }

        /// <summary>
        /// Creates a new assignment for the specified topic
        /// </summary>
        /// <param name="topicId">The ID of the topic for which the assignment is created</param>
        /// <param name="input">The data required to create the assignment</param>
        /// <returns>Returns an ActionResult with the newly created assignment information</returns>

        [HttpPost("{topicId}")]
        public async Task<ActionResult> CreateAssignmentAsync(string topicId, CreateAssignmentDto input)
        {
            var assignment = await _assignmentAppService.AddAssignmentAsync(topicId, input);
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

        /// <summary>
        /// Re-generates the content of an existing assignment with the specified ID
        /// </summary>
        /// <param name="id">The unique identifier of the assignment to be re-generated</param>
        /// <param name="input">The data used to update the assignment</param>
        /// <returns>Returns an ActionResult with the updated assignment information</returns>

        [HttpPut("{id}")]
        public async Task<ActionResult> ReGenerateAssignmentAsync(string id, UpdateAssignmentDto input)
        {

            var assignment = await _assignmentAppService.ReGenerateAssignmentAsync(id, input);
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

        /// <summary>
        /// Deletes the assignment with the specified ID
        /// </summary>
        /// <param name="id">The unique identifier of the assignment to be deleted</param>
        /// <returns>Returns an ActionResult indicating the success of the deletion operation</returns>

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAssignmentAsync(string id)
        {
            var assignment = await _assignmentAppService.DeleteAssignmentAsync(id);
            return Ok(assignment);
        }

        /// <summary>
        /// Retrieves a list of assignments based on the specified topic ID
        /// </summary>
        /// <param name="topicId">The ID of the topic for which assignments are to be retrieved</param>
        /// <returns>Returns an ActionResult with the list of assignments</returns>

        [HttpGet("assignment-List")]
        public async Task<ActionResult> GetAssignmentList(string topicId)
        {
            var assignment = await _assignmentAppService.GetAssignmentList(topicId);

            return Ok(assignment);
        }

        /// <summary>
        /// Checks if an assignment has been submitted for the specified assignment ID and topic ID
        /// </summary>
        /// <param name="assignmentId">The ID of the assignment to check submission for</param>
        /// <param name="topicId">The ID of the topic related to the assignment</param>
        /// <returns>Returns an ActionResult indicating whether the assignment has been submitted</returns>

        [HttpGet("check-assignment-submited")]
        public async Task<ActionResult> AssignmentSubmited(string assignmentId, string topicId)
        {
            var assignment = await _assignmentAppService.CheckAssignmentSubmited(assignmentId, topicId);

            return Ok(assignment);
        }

        /// <summary>
        /// Submits an assignment for processing and storage
        /// </summary>
        /// <param name="assignment">The data representing the assignment submission</param>
        /// <returns>Returns an ActionResult with the result of the assignment submission</returns>
        [HttpPost("assignment-submission")]
        public async Task<ActionResult> AssignmentSubmision(AssignmentSubmisionReq assignment)
        {
            var assignments = await _assignmentAppService.AssignmentSubmisiion(assignment);

            if (assignments == null)
            {
                return BadRequest(new { message = "Please Try again later" });
            }
            return Ok(assignments);
        }

        /// <summary>
        /// Updates the submission status of an assignment
        /// </summary>
        /// <param name="assignment">The data representing the assignment submission to be updated</param>
        /// <returns>Returns an ActionResult indicating the success or failure of the update operation</returns>
        [HttpPut("assignment-submission-update")]
        public async Task<ActionResult> AssignmentSubmisionUpdate(AssignmentSubmisionReq assignment)
        {
            var assignments = await _assignmentAppService.AssignmentSubmisionUpdate(assignment);

            if (assignments)
            {
                return Ok(new { message = "Assignment Successfully Saved" });
            }

            return BadRequest(new { message = "Please Try again later" });
        }

        /// <summary>
        /// Updates the details of an existing assignment
        /// </summary>
        /// <param name="editAssignment">The data representing the edited assignment</param>
        /// <returns>Returns an IActionResult indicating the success or failure of the update operation</returns>
        [HttpPut("UpdateAssignment")]
        public async Task<IActionResult> UpdateAssignmentAsync(AssignmentEditDto editAssignment)
        {
            var userId = _httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            try
            {
                var assignment = await _assignmentRepository.findAssignmentById(editAssignment.AssignmentId);
                
                if (assignment == null)
                {
                    return NotFound("Assignment Not Found");
                }
                else
                {
                    assignment.Name = editAssignment.AssignmentName;
                    assignment.Marks = Convert.ToDouble(editAssignment.AssignmentMarks);
                  
                    // Deserialize the JSON string to Content object
                    var content = JsonConvert.DeserializeObject<Content>(assignment.Content);
                    content.AssignmentTitle = editAssignment.AssignmentName;
                
                    if (editAssignment.PartsDetails!= null) { 
                    foreach (var partDetail in editAssignment.PartsDetails)
                    {
                        var findAssignmentPartForInstruction = content.Instructions
                            .FirstOrDefault(instruction => instruction.Part == partDetail.Part);

                        if (findAssignmentPartForInstruction != null)
                        {
                            findAssignmentPartForInstruction.Note = partDetail.Note;
                        }
                            else
                            {
                               
                                var newInstruction = new Instruction 
                                {
                                    Part = partDetail.Part,
                                    Note = partDetail.Note 
                                };
                                content.Instructions.Add(newInstruction);
                            }
                            var findAssignmentPartForGrade = content.GradingCriteria
                            .FirstOrDefault(grade => grade.Part == partDetail.Part);

                        if (findAssignmentPartForGrade != null)
                        {
                            if (!partDetail.Percentage.EndsWith("%"))
                            {
                                partDetail.Percentage += "%";
                            }
                            findAssignmentPartForGrade.Percentage = partDetail.Percentage;
                        }
                            else
                            {
                                
                                var newGradingCriteria = new GradingCriterion 
                                {
                                    Part = partDetail.Part,
                                    Percentage = partDetail.Percentage 
                                };
                                content.GradingCriteria.Add(newGradingCriteria);
                            }
                        }

                    }
                    // Serialize the content object back to a JSON string
                    string updatedContentJson = JsonConvert.SerializeObject(content);

                    // Update assignment.Content with the updated JSON string
                    assignment.Content = updatedContentJson;

                    assignment.UpdatedDate = DateTime.UtcNow;
                    assignment.UpdatedBy = userId;

                    //save changes to assignment table
                    var updatedAssignment = await _assignmentRepository.UpdateAssignmentAsync(assignment);
                   
                    //response
                    var assignmentEdit = new EditResponseDto
                    {
                        AssignmentId= assignment.Id,
                        AssignmentMarks=Convert.ToString(assignment.Marks),
                        AssignmentName=assignment.Name,
                        content= JsonConvert.DeserializeObject<Content>(assignment.Content)
                    };


                    var response = new AssignmentResponseDto
                    {
                        message = "Assignment updated successfully.",
                        assignmentEditDto = assignmentEdit
                    };

                    return Ok(response);
                }
            }

            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a specific part of an assignment and adjusts the content accordingly
        /// </summary>
        /// <param name="assignmentId">The ID of the assignment from which the part will be deleted</param>
        /// <param name="assignmentPart">The part number of the assignment to be deleted</param>
        /// <returns>Returns an IActionResult indicating the success or failure of the deletion operation</returns>
        [HttpDelete("DeleteAssignmentPart")]
        public async Task<IActionResult> DeleteAssignmentPartAsync(string assignmentId,int assignmentPart)
        {
            try
            {
                var assignment = await _assignmentRepository.findAssignmentById(assignmentId);

                if (assignment == null)
                {
                    return BadRequest();

                }
                else
                {
                    // Deserialize the JSON string to Content object
                    var content = JsonConvert.DeserializeObject<Content>(assignment.Content);

                    var findAssignmentPartForInstruction = content.Instructions.FirstOrDefault(instruction => instruction.Part == assignmentPart);

                    if (findAssignmentPartForInstruction != null)
                    {
                        // Find the index of the instruction to remove
                        var indexToRemoveInstruction = content.Instructions.IndexOf(findAssignmentPartForInstruction);

                        // Remove the instruction at the specified index
                        content.Instructions.RemoveAt(indexToRemoveInstruction);

                        // Update part numbers for the remaining instructions
                        for (int i = indexToRemoveInstruction; i < content.Instructions.Count; i++)
                        {
                            content.Instructions[i].Part--;
                        }
                    }

                    var findAssignmentPartForGrade = content.GradingCriteria.FirstOrDefault(grade => grade.Part == assignmentPart);

                    if (findAssignmentPartForGrade != null)
                    {
                        //find the index of the grade to remove
                        var indexToRemoveGrade = content.GradingCriteria.IndexOf(findAssignmentPartForGrade);

                        // Get the percentage to distribute
                        var removedPercentage = double.Parse(findAssignmentPartForGrade.Percentage.Trim('%'));

                        // Calculate the total number of remaining parts in grade
                        var remainingPartsCount = content.GradingCriteria.Count - 1;

                        // Calculate the percentage to distribute equally among remaining parts
                        double percentageToAdd = removedPercentage / remainingPartsCount;

                        // Remove the grade at the specific index
                        content.GradingCriteria.RemoveAt(indexToRemoveGrade);

                        // Update part numbers for the remaining grade and distribute percentage equally
                        foreach(var part in content.GradingCriteria )
                        {
                            if(part.Part > assignmentPart)
                            {
                                part.Part--;
                            }
                            var existingPercentage = double.Parse(part.Percentage.Trim('%'));
                            double updatedPercentage = existingPercentage + percentageToAdd;
                            part.Percentage = $"{updatedPercentage:F1}%";
                        }


                    }

                    // Serialize the content object back to a JSON string
                    string updatedContentJson = JsonConvert.SerializeObject(content);

                    // Update assignment.Content with the updated JSON string
                    assignment.Content = updatedContentJson;
                     assignment.UpdatedDate = DateTime.UtcNow;

                    //save changes to assignment table
                    var updatedAssignment = await _assignmentRepository.UpdateAssignmentAsync(assignment);

                    //response
                    var assignmentPartDelete = new AssignmentPartDelete
                    {
                        content= JsonConvert.DeserializeObject<Content>(assignment.Content)
                    };
                    var response = new PartDeleteResponseDto
                    {
                        message = $"Assignment part{assignmentPart} deleted successfully.",
                        assignmentPartDelete = assignmentPartDelete,
                        Count=content.GradingCriteria.Count,
                    };

                    return Ok(response);

                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error :{ex.Message}");
            }

        }

        /// <summary>
        /// Deletes an assignment associated with a specific topic and updates the durations in related entities if required
        /// </summary>
        /// <param name="assignmentid">The ID of the assignment to be deleted</param>
        /// <param name="checkDuration">A boolean flag indicating whether to update durations in related entities</param>
        /// <returns>Returns an IActionResult indicating the success or failure of the deletion operation</returns>
        [HttpDelete("DeleteAssignment")]
        public async Task<IActionResult> DeleteAssignmentForTopicAsync(string assignmentid,bool checkDuration)
        {
            try
            {
                var assignment = await _assignmentRepository.findAssignmentById(assignmentid);

                if (assignment == null)
                {
                    return BadRequest();

                }
                else
                {
                    assignment.IsDeleted = true;

                   //update changes to assignment table
                   var deleteAssignment = await _assignmentRepository.UpdateAssignmentAsync(assignment);

                    if(checkDuration)
                    {

                        //find TopicId from assignment
                        var findTopicId = await _assignmentRepository.GetTopicIdFromAssignment(assignment.TopicId);

                        //update duration in topic after assignment delete
                        findTopicId.Duration -= Convert.ToInt16(deleteAssignment.DurationInDay);
                        findTopicId.UpdatedDate = DateTime.UtcNow;

                        var deleteDurationInTopic = await _assignmentRepository.UpdateTopicAsync(findTopicId);

                        //find CourseId From Topic
                        var findCourseId = await _assignmentRepository.GetCourseIdFromTopic(findTopicId.CourseId);

                        //update duration in topic after assignment delete
                        findCourseId.Duration -= Convert.ToInt16(deleteAssignment.DurationInDay);
                        findCourseId.UpdatedDate = DateTime.UtcNow;

                        var deleteDurationInCourse = await _assignmentRepository.UpdateCourseAsync(findCourseId);

                        //response
                        var deleteDto = new DeleteAssignmentDto
                        {
                            CourseDuration = Convert.ToString(deleteDurationInCourse.Duration),
                            TopicDuration = Convert.ToString(deleteDurationInTopic.Duration),
                            TopicId = deleteDurationInTopic.Id
                        };

                        var response = new AssignmentDeleteResponseDto
                        {
                            message = "Assignment deleted successfully",
                            deleteAssignmentDto = deleteDto
                        };

                        return Ok(response);

                    }
                    else if(checkDuration==false)
                    {
                        return Ok(new { message = "Assignment deleted successfully" });
                    }
                    else
                    {
                        return BadRequest();
                    }            

                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error :{ex.Message}");
            }
        }

        /// <summary>
        /// Creates a new user assignment associated with the specified topic
        /// </summary>
        /// <param name="topicsId">The ID of the topic to which the assignment belongs</param>
        /// <param name="input">The data required to create the user assignment</param>
        /// <returns>Returns an ActionResult with the newly created user assignment information</returns>
        [HttpPost("create/user")]
        public async Task<ActionResult> CreateUserAssignmentAsync(string topicsId, CreateUserAssignmentDto input)
        {
            var assignment = await _assignmentAppService.AddUserAssignmentAsync(topicsId, input);
           
            var newResult = new GetUserAssignmentDto
            {
                Id = assignment.Id,
                TopicId = assignment.TopicId,
                Content = JsonConvert.DeserializeObject<UserAssignmentContent>(assignment.Content),
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

        /// <summary>
        /// Deletes a submitted assignment associated with a specific internship and submission ID
        /// </summary>
        /// <param name="InternshipId">The ID of the internship related to the submission</param>
        /// <param name="SubmissionId">The ID of the submission to be deleted</param>
        /// <returns>Returns an IActionResult indicating the success or failure of the deletion operation</returns>
        [HttpDelete("DeleteSubmittedAssignment")]
        public async Task<IActionResult> DeleteSubmittedAssignmentAsync(string InternshipId, string SubmissionId)
        {
            try
            {
                var Submittedassignment = await _assignmentRepository.GetAssignmentSubmission(InternshipId,SubmissionId);

                if (Submittedassignment == null)
                {
                    return BadRequest();

                }
                else
                {
                    Submittedassignment.IsDeleted = true;

                    //update changes to assignment table
                    var deleteAssignment = await _assignmentRepository.DeleteSubmittedAssignmentAsync(Submittedassignment);

                }

                return Ok(Submittedassignment.IsDeleted);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error :{ex.Message}");
            }
        }
    }

    }


