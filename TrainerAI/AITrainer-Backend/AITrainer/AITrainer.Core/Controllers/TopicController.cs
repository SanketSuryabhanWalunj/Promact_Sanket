using AITrainer.AITrainer.Core.Dto.Topics;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Repository.Topics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITrainer.AITrainer.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class TopicController : ControllerBase
    {
        private readonly ITopicRepository _topicRepository;
        public TopicController(ITopicRepository topicRepository) 
        {
            _topicRepository = topicRepository;
        }

        /// <summary>
        /// Edits the details of an existing topic in a course. It updates the topic's name and duration, recalculates 
        /// the total duration of all topics within the course, and updates the course duration accordingly.
        /// </summary>
        /// <param name="editTopic">DTO containing the edited topic details including topic ID, new name, and duration.</param>
        /// <returns>An IActionResult containing the result of the edit operation with a message and updated topic and course durations.</returns>
        [HttpPut("EditTopic")]
        public async Task<IActionResult> EditTopicInCourseDetail(TopicEditDto editTopic)
        {
            try
            {
                var findTopic = await _topicRepository.FindTopicId(editTopic.topicId);

                if (findTopic == null)
                {
                    return NotFound("Topic not found");
                }
                else
                {
                    findTopic.TopicName = editTopic.topicName;
                    findTopic.Duration = editTopic.duration;
                    findTopic.UpdatedDate = DateTime.UtcNow;

                    //save changes to topic table
                    var updatedTopic = await _topicRepository.updateTopicAsync(findTopic);

                    // Calculate total duration of all topics related to the course
                    var courseId = findTopic.CourseId;
                    var totalDuration = await _topicRepository.GetTotalDurationForCourse(courseId);

                    // update course duration
                    var findCourse = await _topicRepository.FindCourseByTopicId(courseId);

                    if (findCourse != null)
                    {
                        findCourse.Duration = totalDuration;
                        findCourse.UpdatedDate = DateTime.UtcNow;

                        //update changes in database
                        var updateCourse = await _topicRepository.UpdateCourseAsync(findCourse);

                    }

                    //response 
                    var topicEditResponse = new TopicEditResponseDto
                    {
                        TopicId=editTopic.topicId,
                        TopicName = editTopic.topicName,
                        TopicDuration = editTopic.duration,
                        CourseDuration = totalDuration
                    };
                    var response = new TopicResposneDto
                    {
                        message = "Topic updated successfully.",
                        topicEditResponseDto = topicEditResponse,
                    };
                    return Ok(response);

                }

            }
            catch (Exception ex)
            {
                // Handle exceptions and return appropriate response
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a topic by its ID, marks it as deleted, recalculates the course duration by subtracting the topic's duration, 
        /// and updates the indices of subsequent topics in the course.
        /// </summary>
        /// <param name="topicId">The ID of the topic to be deleted.</param>
        /// <param name="duration">The duration of the topic to be subtracted from the course's total duration.</param>
        /// <param name="index">The index of the topic within the course's list of topics.</param>
        /// <returns>An IActionResult containing the result of the delete operation with a message and the updated course duration.</returns>
        [HttpDelete("DeleteTopic")]
        public async Task<IActionResult> DeleteTopicByTopicId (string topicId,int duration,int index)
        {
            try
            {
                var findTopic = await _topicRepository.FindTopicByIdAsync(topicId);

                if (findTopic == null)
                {
                    return NotFound("Topic not found");
                }
                else
                {
                    findTopic.IsDeleted = true;
                    findTopic.UpdatedDate = DateTime.UtcNow;

                    //save changes to topic table
                    var deleteTempalte = await _topicRepository.DeleteTopicById(findTopic);

                    //minus duration in course table
                    var courseId = findTopic.CourseId;
                    var findCourse=await _topicRepository.FindCourseByCourseId(courseId);

                    var courseDuration = findCourse.Duration - duration;

                    if (findCourse != null)
                    {     
                        findCourse.Duration = courseDuration;
                        findCourse.UpdatedDate= DateTime.UtcNow;

                        //update changes in database
                        var updateCourse = await _topicRepository.UpdateCourseAsync(findCourse);

                    }

                    var topicList=await _topicRepository.GetTopicsByCourseIdAsync(courseId);

                    // Shift indices of topics in the list after the deleted topic
                    foreach (var topic in topicList)
                    {
                        if (topic.Index > index)
                        {
                            topic.Index--; // Decrease index by 1 for topics after the deleted topic
                        }
                    }

                    // Update index in the database
                    foreach (var topic in topicList)
                    {
                        await _topicRepository.UpdateTopicIndexAsync(topic.Id, topic.Index);
                    }

                    //response
                    var response = new TopicDeleteResponseDto
                    {
                        message = "Topic deleted successfully.",
                        courseDuration = courseDuration,
                    };
                    return Ok(response);
                }           
               
            }
            catch(Exception ex)
            {
                // Handle exceptions and return appropriate response
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
            
        }

        /// <summary>
        /// Rearranges the sequence of topics within a course based on a new order specified in the input.
        /// This could be used after topics have been added, removed, or when the user changes the order of topics.
        /// </summary>
        /// <param name="topics">A list of DTOs representing the new order of topics within a course.</param>
        /// <returns>A Task<ActionResult<bool>> indicating the success or failure of the rearrangement operation.</returns>
        [HttpPut("RearrangeTopic")]
        public async Task<ActionResult<bool>> RearrangeTopicSequence(List<TopicRearrangeDto> topics)
        {
            return await _topicRepository.RearrangeTopicSequence(topics);
        }
    }
}
