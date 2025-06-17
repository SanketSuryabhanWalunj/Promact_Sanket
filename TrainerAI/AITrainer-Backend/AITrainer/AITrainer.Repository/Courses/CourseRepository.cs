using AITrainer.AITrainer.Core.Dto.Course;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.DomainModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using AITrainer.AITrainer.Core.Dto.JournalTemplate;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace AITrainer.AITrainer.Repository.Courses
{
    public class CourseRepository : ICourseRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public CourseRepository(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
            _context = context;
        }

        /// <summary>
        /// Retrieves a user asynchronously based on the provided email.
        /// </summary>
        /// <param name="email">The email of the user to retrieve.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the user if found, otherwise null.
        /// </returns>
        public async Task<ApplicationUser> findUSerByEmailASync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        /// <summary>
        /// Adds a new course asynchronously to the database.
        /// </summary>
        /// <param name="course">The course information to add.</param>
        /// <param name="userId">The ID of the user who is adding the course.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the added course.
        /// </returns>
        public async Task<Course> AddCourseAsync(CourseDto course, string userId)
        {
            var data = new Course
            {
                Id = Guid.NewGuid().ToString(),
                Name = course.Name,
                Duration = course.DurationType.Equals("Days") ? course.Duration : course.Duration * 6,
                DurationType = course.DurationType,
                TrainingLevel = course.TrainingLevel,
                Quiz = course.Quiz,
                QuizCount = course.QuizCount,
                QuizTime = course.QuizTime,
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow,
                UpdatedDate = DateTime.UtcNow,
                IsDeleted = false
            };
            _context.Courses.Add(data);
            await _context.SaveChangesAsync();
            return data;
        }

        /// <summary>
        /// Finds a course asynchronously based on the provided course information.
        /// </summary>
        /// <param name="course">The course information to search for.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the found course, if any.
        /// </returns>
        public async Task<Course> FindCourseAsync(CourseDto course)
        {
            var findcourse = await _context.Courses.FirstOrDefaultAsync(c =>
                c.Name == course.Name &&
                c.Duration == course.Duration &&
                c.DurationType == course.DurationType &&
                c.TrainingLevel == course.TrainingLevel &&
                c.IsDeleted == false
            );
            return findcourse;
        }

        /// <summary>
        /// Retrieves a list of courses created by a user asynchronously, based on pagination.
        /// </summary>
        /// <param name="userId">The ID of the user who created the courses.</param>     
        /// <returns>
        /// A task representing the asynchronous operation. The task result contains the list of courses created by the user within the specified range.
        /// </returns>
        public async Task<List<Course>> GetCoursesCreatedByUserAsync(string userId)
        {
            var organiztionId = await _context.Admin
                .Where(u => u.UserId == userId)
                .Select(u => u.OrganizationId)
                .FirstOrDefaultAsync();

            var user = await _context.Admin
                .Where(u => u.OrganizationId == organiztionId)
                .Select(u => u.UserId)
                .ToListAsync();

            var courseList = await _context.Courses
           .Where(course => user.Contains(course.CreatedBy))
           .Where(course => !course.IsDeleted) // Exclude courses where IsDeleted is true
           .OrderByDescending(course => course.CreatedDate) // Sort by CreatedDate in descending order (latest first)          
           .ToListAsync();

            return courseList;
        }

        /// <summary>
        /// Deletes a course by its ID asynchronously.
        /// </summary>
        /// <param name="courseId">The ID of the course to delete.</param>
        /// <returns>
        /// A task representing the asynchronous operation. The task result indicates whether the course was successfully deleted.
        /// </returns>
        public async Task<bool> DeleteCourseById(string courseId)
        {
            var deleteCourse = await _context.Courses.FirstAsync(course => course.Id == courseId);
            var courseInternships = await _context.Internship.Where(i => i.CourseId == courseId).ToListAsync();
            if (courseInternships != null)
            {
                foreach (var internship in courseInternships)
                {
                    internship.isDismissed = true;
                    internship.Status = false;
                    _context.Internship.Update(internship);
                    _context.SaveChanges();
                }
            }
            deleteCourse.IsDeleted = true;
            _context.Courses.Update(deleteCourse);
            _context.SaveChanges();
            return true;
        }

        /// <summary>
        /// Adds a chat GPT interaction to the database asynchronously.
        /// </summary>
        /// <param name="chatGptInteraction">The chat GPT interaction to add.</param>
        /// <returns>The added chat GPT interaction.</returns>
        public async Task<ChatGptInteraction> AddResponseAsync(ChatGptInteraction chatGptInteraction)
        {
            _context.chatGptInteractions.Add(chatGptInteraction);
            await _context.SaveChangesAsync();
            return chatGptInteraction;
        }

        /// <summary>
        /// Retrieves a list of courses available for a specific intern asynchronously.
        /// </summary>
        /// <param name="id">The ID of the intern.</param>
        /// <returns>A list of courses.</returns>
        public async Task<IEnumerable<Course>> GetCoursesListForInternAsync(string id)
        {
            var organiztionId = await _context.Admin
               .Where(u => u.UserId == id)
               .Select(u => u.OrganizationId)
               .FirstOrDefaultAsync();

            var user = await _context.Admin
                .Where(u => u.OrganizationId == organiztionId)
                .Select(u => u.UserId)
                .ToListAsync();


            var courseList = await _context.Courses
           .Where(course => user.Contains(course.CreatedBy))
           .Where(course => !course.IsDeleted) // Exclude courses where IsDeleted is true
           .OrderByDescending(course => course.CreatedDate) // Sort by CreatedDate in descending order (latest first)
           .ToListAsync();

            return courseList;

        }

        /// <summary>
        /// Retrieves a course by its ID asynchronously.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>The course with the specified ID.</returns>
        public async Task<Course> GetCourseByIdAsync(string courseId)
        {
            var course = await _context.Courses
                        .Where(c => c.Id == courseId)
                        .Where(course => !course.IsDeleted) // Exclude courses where IsDeleted is true
                        .FirstOrDefaultAsync();

            return course;
        }

        /// <summary>
        /// Retrieves topics belonging to a course asynchronously.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <returns>The list of topics associated with the specified course.</returns>
        public async Task<IEnumerable<Topic>> GetTopicsByCourseIdAsync(string courseId)
        {
            var courseList = await _context.Topics
           .Where(topic => topic.CourseId == courseId)
           .Where(topic => !topic.IsDeleted)
           .OrderBy(topic => topic.Index)
           .ToListAsync();

            return courseList;
        }

        /// <summary>
        /// Retrieves assignments for a list of topics asynchronously.
        /// </summary>
        /// <param name="topicIds">The list of topic IDs.</param>
        /// <returns>The list of assignments associated with the specified topics.</returns>
        public async Task<List<Assignment>> GetAssignmentsForTopicsAsync(List<string> topicIds)
        {
            return await _context.Assignments
                .Where(a => topicIds.Contains(a.TopicId))
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves quizzes for a list of topics asynchronously.
        /// </summary>
        /// <param name="topicIds">The list of topic IDs.</param>
        /// <returns>The list of quizzes associated with the specified topics.</returns>
        public async Task<List<Quiz>> GetQuizzesForTopicsAsync(List<string> topicIds)
        {
            return await _context.Quiz
                .Where(q => topicIds.Contains(q.TopicId))
                .Where(q => !q.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves journal template data asynchronously based on the provided journal ID.
        /// </summary>
        /// <param name="journalId">The ID of the journal template to retrieve.</param>
        /// <returns>The journal template data if found, otherwise null.</returns>
        public async Task<JournalTemplate> GetJournalData(string journalId)
        {
            return await _context.JournalTemplate
                .Where(j => j.Id == journalId)
                .Where(j => !j.IsDeleted) // Exclude courses where IsDeleted is true
                .FirstOrDefaultAsync();
        }

        /// <summary>
        /// Finds the course asynchronously based on the provided course ID.
        /// </summary>
        /// <param name="courseId">The ID of the course to find.</param>
        /// <returns>The course if found, otherwise null.</returns>
        public async Task<Course> FindTemplateIdForCourseAsync(string courseId)
        {
            var findTemplateId = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);

            return findTemplateId;
        }

        /// <summary>
        /// Updates the course entity in the database asynchronously.
        /// </summary>
        /// <param name="course">The course entity to be updated.</param>
        /// <returns>The updated course entity.</returns>
        public async Task<Course> CreateTemplateIdAsync(Course course)
        {
            // Update the entity in the database
            _context.Courses.Update(course);
            await _context.SaveChangesAsync();

            return course;
        }

        /// <summary>
        /// Updates the course entity in the database asynchronously.
        /// </summary>
        /// <param name="course">The course entity to be updated.</param>
        /// <returns>The updated course entity.</returns>
        public async Task<Course> UpdateCourse(Course course)
        {
            // Update the entity in the database
            _context.Courses.Update(course);
            await _context.SaveChangesAsync();

            return course;
        }

        /// <summary>
        /// Finds a course with the specified journal template ID asynchronously.
        /// </summary>
        /// <param name="templateId">The ID of the journal template associated with the course.</param>
        /// <returns>The course entity associated with the specified journal template ID.</returns>
        public async Task<Course> FindTemplateAsync(string templateId)
        {
            var findTemplateId = await _context.Courses.FirstOrDefaultAsync(t => t.JournalTemplate_Id == templateId);

            return findTemplateId;
        }

        /// <summary>
        /// Deletes a journal template from a course asynchronously.
        /// </summary>
        /// <param name="findTemplate">The course entity containing the journal template to delete.</param>
        /// <returns>A boolean value indicating whether the deletion was successful.</returns>
        public async Task<bool> DeleteTemplateById(Course findTemplate)
        {
            // Update the entity in the database
            _context.Courses.Update(findTemplate);
            await _context.SaveChangesAsync();

            return true;

        }

        /// <summary>
        /// Updates the quiz duration for all topics within a course asynchronously.
        /// </summary>
        /// <param name="courseId">The ID of the course.</param>
        /// <param name="duration">The new duration for the quiz.</param>
        /// <returns>A boolean value indicating whether the update was successful.</returns>
        public async Task<bool> UpdateTopicQuizDuration(string courseId, int duration)
        {
            var Topics = await _context.Topics.Where(i => i.CourseId == courseId).ToListAsync();
            if (Topics != null)
            {
                foreach (var topic in Topics)
                {
                    topic.QuizDuration = duration;
                    _context.Topics.Update(topic);
                    await _context.SaveChangesAsync();
                }
                return true;
            }
            else
            {
                return false;
            }
        }


        /// <summary>
        /// Retrieves a list of courses associated with the provided user ID,
        /// including courses created by the user and courses created by other users within the same organization.
        /// </summary>
        /// <param name="userId">The ID of the user whose courses are to be retrieved.</param>
        /// <returns>A list of CourseInfoDto objects representing the courses.</returns>
        public async Task<List<CourseInfoDto>> GetCourses(string userId)
        {
            string? userOrganizationId = await _context.Admin
                .Where(u => u.UserId == userId)
                .Select(u => u.OrganizationId)
                .FirstOrDefaultAsync();

           var courses = await _context.Courses
                .Where(c => !c.IsDeleted &&
                        (c.CreatedBy == userId ||
                         _context.Admin.Any(a => a.UserId == c.CreatedBy && a.OrganizationId == userOrganizationId)))
                .Select(c => new  CourseInfoDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsDeleted = c.IsDeleted
                    })
                .Distinct()
                .ToListAsync();

                return courses;
            }

    }
}
