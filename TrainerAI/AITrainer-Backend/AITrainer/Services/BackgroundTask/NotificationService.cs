using AITrainer.AITrainer.Core.Dto.Notification;
using AITrainer.AITrainer.DomainModel;
using AITrainer.AITrainer.DomainModel.Models;
using AITrainer.AITrainer.Util;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AITrainer.Services.BackgroundTask
{
    public class NotificationService : BackgroundService
    {
        private readonly ILogger<NotificationService> logger;
        private readonly IServiceScopeFactory serviceScopeFactory;

        public NotificationService(
            ILogger<NotificationService> logger,
            IServiceScopeFactory serviceScopeFactory)
        {
            this.logger = logger;
            this.serviceScopeFactory = serviceScopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation($"NotificationService is starting.");
            stoppingToken.Register(() =>
                logger.LogInformation($" NotificationService background task is stopping."));


            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = serviceScopeFactory.CreateScope())
                    {
                        //Send mail one day before the internship start date to interns.
                        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                        var emailNotificationService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                        List<IdentityUser> users = await dbContext.Users.AsNoTracking().ToListAsync();
                        List<Intern> interns = await dbContext.Intern.AsNoTracking().Where(i => !i.IsDeleted).ToListAsync();
                        List<Course> courses = await dbContext.Courses.AsNoTracking().Where(c => !c.IsDeleted).ToListAsync();
                        List<Internship> internships = await dbContext.Internship.AsNoTracking().Where(i => i.isDismissed == false).ToListAsync();
                        List<Batch> batches = await dbContext.Batch.AsNoTracking().Where(b => !b.IsDeleted).ToListAsync();
                        List<Topic> topics = await dbContext.Topics.AsNoTracking().Where(t => !t.IsDeleted).ToListAsync();
                        List<Assignment> assignments = await dbContext.Assignments.AsNoTracking().Where(a => !a.IsDeleted).ToListAsync();
                        List<Internship> updatedInternships = new List<Internship>();

                        //Send mail one day before the internship start date to interns.
                        var internshipStartReminder = internships.Where(i => DateTime.UtcNow.AddHours(24) > i.StartDate
                                                    && i.StartDate > DateTime.UtcNow && !i.IsStartNotified && i.isDismissed == false).ToList();
                        var internshipStartMentorReminder = internshipStartReminder.GroupBy(i => i.CourseId).ToList();
                        foreach (var internship in internshipStartReminder)
                        {
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            string mentorNames = String.Empty;
                            if (intern == null || course == null) { continue; }
                            List<string> mentorIds = internship.MentorId.Split(",").ToList();

                            int count = 0;
                            foreach (var mentorId in mentorIds)
                            {

                                var mentor = users.FirstOrDefault(f => f.Id == mentorId);
                                count++;
                                if (mentor is ApplicationUser applicationUser && !applicationUser.isDeleted)
                                {
                                    NotificationModel mentorMailfields = new NotificationModel
                                    {
                                        InternFirstName = intern.FirstName,
                                        InternLastName = intern.LastName,
                                        CourseName = course.Name,
                                        CourseDuration = course.Duration,
                                        StartDate = internship.StartDate,
                                        EmailId = mentor.Email,
                                        MentorNames = $"{applicationUser.FirstName}"
                                    };

                                    string subject = EmailSubjects.InternshipStartSubject(course.Name);
                                    string mentorEmailBody = NotificationTemplates.GetStartInternshipMentorEmailBody(mentorMailfields);
                                    bool isMailSent = await emailNotificationService.SendEmailAsync(mentorMailfields.EmailId ,subject , mentorEmailBody);
                                    logger.LogInformation($"Reminder status:{isMailSent}");

                                    if (mentorIds.Count != count)
                                    {
                                        mentorNames += $"{applicationUser.FirstName} {applicationUser.LastName}, ";
                                    }
                                    else
                                    {
                                        mentorNames += $"{applicationUser.FirstName} {applicationUser.LastName}";
                                    }
                                }
                            }

                            NotificationModel model = new NotificationModel()
                            {
                                InternFirstName = intern.FirstName,
                                InternLastName = intern.LastName,
                                CourseName = course.Name,
                                CourseDuration = course.Duration,
                                StartDate = internship.StartDate,
                                EmailId = intern.Email,
                                MentorNames = mentorNames
                            };

                            string MentorMailsubject = EmailSubjects.InternshipStartSubject(course.Name);
                            string internEmailBody = NotificationTemplates.GetStartInternshipEmailBody(model);
                            bool response = await emailNotificationService.SendEmailAsync(model.EmailId, MentorMailsubject, internEmailBody);
                            logger.LogInformation($"Reminder status:{response}");

                            if (response)
                            {
                                internship.IsStartNotified = true;
                                updatedInternships.Add(internship);
                            }
                        }
                        dbContext.Internship.UpdateRange(updatedInternships);
                        await dbContext.SaveChangesAsync();
                        updatedInternships.Clear();


                        //Send mail one day before the internship end date.
                        var internshipEndReminder = internships.Where(i => !i.IsEndNotified && i.isDismissed == false).ToList();
                        foreach (var internship in internshipEndReminder)
                        {
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            if (intern == null || course == null) { continue; }
                            
                            List<string> workingDays;
                            if (intern.BatchId != null)
                            {
                                var batch = batches.FirstOrDefault(b => b.Id == intern.BatchId);
                                workingDays = batch?.WeekdaysNames.ToList() ?? new List<string>();
                            }
                            else
                            {
                                workingDays = new List<string>();
                            }
                            List<string> mentorIds = internship.MentorId.Split(",").ToList();

                            DateTime endDate = CalculateDate(internship.StartDate, course.Duration, workingDays);
                            if (DateTime.UtcNow.AddHours(24) > endDate && endDate > DateTime.UtcNow)
                            {
                                NotificationModel internMailfields = new NotificationModel
                                {
                                    InternFirstName = intern.FirstName,
                                    InternLastName = intern.LastName,
                                    CourseName = course.Name,
                                    EmailId = intern.Email,
                                    EndDate = endDate,
                                };
                                //Sending mail to intern for an internship.
                                string subject = EmailSubjects.InternshipEndSubjectForIntern(course.Name);
                                string emailInternshipEndBody = NotificationTemplates.GetEndInternshipEmailBody(internMailfields);
                                bool response = await emailNotificationService.SendEmailAsync(internMailfields.EmailId, subject, emailInternshipEndBody);
                                logger.LogInformation($"Deadline mail status:{response}");

                                //Sending mail to all mentors for an internship.
                                foreach (var mentorId in mentorIds)
                                {
                                    NotificationModel mentorEndMailfields = new NotificationModel
                                    {
                                        CourseName = course.Name,
                                        EndDate = endDate,
                                    };
                                    var mentor = users.FirstOrDefault(f => f.Id == mentorId);
                                    if (mentor is ApplicationUser applicationUser && !applicationUser.isDeleted)
                                    {
                                        mentorEndMailfields.EmailId = mentor.Email;
                                        mentorEndMailfields.MentorNames = $"{applicationUser.FirstName} {applicationUser.LastName}";
                                    }
                                    subject = EmailSubjects.InternshipEndSubjectForMentors(mentorEndMailfields.CourseName);
                                    string emailMentorInternshipEndBody = NotificationTemplates.GetEndInternshipMentorEmailBody(mentorEndMailfields);
                                    bool isMailSent = await emailNotificationService.SendEmailAsync(mentorEndMailfields.EmailId, subject, emailMentorInternshipEndBody);
                                    logger.LogInformation($"Deadline mail status:{isMailSent}");
                                }

                                if (response)
                                {
                                    internship.IsEndNotified = true;
                                    updatedInternships.Add(internship);
                                }
                            }
                        }

                        dbContext.Internship.UpdateRange(updatedInternships);
                        await dbContext.SaveChangesAsync();
                        updatedInternships.Clear();


                        //Send mail to mentors on each submission of intern.
                        List<AssignmentSubmission> submissions = await dbContext.AssignmentSubmissions.AsNoTracking()
                                            .Where(i => !i.IsNotified && !i.IsDeleted).OrderBy(i => i.SubmitedDate).ToListAsync();
                        var groupedSubmissions = submissions.GroupBy(s => s.InternshipId).ToList();
                        List<AssignmentSubmission> assignmentSubmissions = new List<AssignmentSubmission>();
                        foreach (var group in groupedSubmissions)
                        {
                            Internship internship = internships.FirstOrDefault(i => i.Id == group.Key && i.isDismissed == false);
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            if (internship == null || intern == null || course == null) { continue; }
                            List<string> mentorIds = internship.MentorId.Split(",").ToList();
                            DateTime? lastSubmissionDate = group.OrderByDescending(s => s.SubmitedDate).FirstOrDefault()?.SubmitedDate;
                            NotificationModel model = new NotificationModel()
                            {
                                CourseName = course.Name,
                                InternFirstName = intern.FirstName,
                                InternLastName = intern.LastName,
                                SubmissionCount = group.Count(),
                                SubmissionDate = lastSubmissionDate,
                            };
                            bool isAllMailSent = true;
                            foreach (var mentorId in mentorIds)
                            {

                                var mentor = users.FirstOrDefault(f => f.Id == mentorId);
                                if (mentor is ApplicationUser applicationUser && !applicationUser.isDeleted)
                                {
                                    model.EmailId = mentor.Email;
                                    model.MentorNames = $"{applicationUser.FirstName} {applicationUser.LastName}";
                                }
                                string subject = EmailSubjects.InternshipSubmissionSubject(intern.FirstName, course.Name);
                                string emailSubmissionBody = NotificationTemplates.GetSubmissionEmailBody(model);
                                bool isMailSent = await emailNotificationService.SendEmailAsync(model.EmailId, subject, emailSubmissionBody);
                                logger.LogInformation($"Submission status:{isMailSent}");
                                if (!isMailSent)
                                {
                                    isAllMailSent = false;
                                }
                            }

                            if (isAllMailSent)
                            {
                                foreach (var submission in group)
                                {
                                    submission.IsNotified = true;
                                    assignmentSubmissions.Add(submission);
                                }
                            }
                        }
                        dbContext.AssignmentSubmissions.UpdateRange(assignmentSubmissions);
                        await dbContext.SaveChangesAsync();

                        //Send mail to intern for the each feedback received.
                        List<AssignmentFeedback> submissionsFeedback = await dbContext.AssignmentFeedbacks.AsNoTracking().Where(s => s.IsPublished && !s.IsNotified && !s.IsDeleted).ToListAsync();
                        logger.LogInformation($"SubmissionsFeedback:{submissionsFeedback}");
                        List<AssignmentFeedback> assignmentFeeedbacks = new List<AssignmentFeedback>();

                        foreach (var feedback in submissionsFeedback)
                        {
                            Internship internship = internships.FirstOrDefault(i => i.Id == feedback.InternshipId && i.isDismissed == false);
                            if (internship == null) { continue; }
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            if (internship == null || intern == null || course == null) { continue; }
                            NotificationModel model = new NotificationModel()
                            {
                                CourseName = course.Name,
                                InternFirstName = intern.FirstName,
                                InternLastName = intern.LastName,
                            };
                            var mentor = users.FirstOrDefault(f => f.Id == feedback.ReviewerId);
                            if (mentor is ApplicationUser applicationUser && !applicationUser.isDeleted)
                            {
                                model.MentorNames = $"{applicationUser.FirstName} {applicationUser.LastName}";
                                model.EmailId = intern.Email;
                            }
                            DateTime? date = feedback.UpdatedDate;

                            string subject = EmailSubjects.InternshipFeedbackSubject(course.Name);
                            string emailFeedbackBody = NotificationTemplates.GetFeedbackEmailBody(model,date);
                            bool response = await emailNotificationService.SendEmailAsync(model.EmailId, subject, emailFeedbackBody);
                            logger.LogInformation($"Feedback status:{response}");
                            if (response)
                            {
                                feedback.IsNotified = true;
                                assignmentFeeedbacks.Add(feedback);
                            }
                        }
                        dbContext.AssignmentFeedbacks.UpdateRange(assignmentFeeedbacks);
                        await dbContext.SaveChangesAsync();

                        List<GeneralInternshipFeedback> generalFeedbacks = dbContext.GeneralInternshipFeedbacks.AsNoTracking().Where(f => !f.IsNotified && !f.IsDeleted).ToList();
                        logger.LogInformation($"GeneralFeedback:{generalFeedbacks}");
                        Dictionary<string, List<GeneralInternshipFeedback>> groupedBehaviourFeedbacks = generalFeedbacks.Where(f => f.Type == "Behaviour" && f.IsPublished == true).GroupBy(f => f.InternshipId).ToDictionary(g => g.Key, g => g.ToList());
                        logger.LogInformation($"GroupedBehaviourFeedback:{groupedBehaviourFeedbacks}");
                        List<GeneralInternshipFeedback> generalInternshipFeedbacks = new List<GeneralInternshipFeedback>();
                        foreach (var groupFeedback in groupedBehaviourFeedbacks)
                        {
                            Internship internship = internships.FirstOrDefault(i => i.Id == groupFeedback.Key && i.isDismissed == false);
                            logger.LogInformation($"internship:{internship}");
                            if (internship == null){ continue; }
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            logger.LogInformation($"Intern:{intern}");
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            logger.LogInformation($"Course:{course}");
                            if (internship == null || intern == null || course == null) { continue; }
                            DateTime? date = groupFeedback.Value.FirstOrDefault(i => i.InternshipId == groupFeedback.Key).UpdatedDate;
                            NotificationModel model = new NotificationModel()
                            {
                                CourseName = course.Name,
                                InternFirstName = intern.FirstName,
                                InternLastName = intern.LastName,
                                EmailId = intern.Email
                            };
                            model.MentorNames = groupFeedback.Value.FirstOrDefault(i => i.InternshipId == groupFeedback.Key).CreatedByName;
                            logger.LogInformation($"Model:{model}");
                            string subject = EmailSubjects.InternshipBehaviourFeedbackSubject(course.Name);
                            logger.LogInformation($"Subject:{subject}");
                            string emailFeedbackBody = NotificationTemplates.GetFeedbackEmailBody(model, date);
                            logger.LogInformation($"EmailFeedbackBody:{emailFeedbackBody}");
                            bool response = await emailNotificationService.SendEmailAsync(model.EmailId, subject, emailFeedbackBody);
                            logger.LogInformation($"Feedback status:{response}");
                            if (response)
                            {
                                foreach (var feedback in groupFeedback.Value)
                                {
                                    feedback.IsNotified = true;
                                    generalInternshipFeedbacks.Add(feedback);
                                }
                            }
                        }
                        dbContext.GeneralInternshipFeedbacks.UpdateRange(generalInternshipFeedbacks);
                        await dbContext.SaveChangesAsync();
                        generalInternshipFeedbacks.Clear();
                        logger.LogInformation($"Behaviour feedbacks updated successfully");

                        // Acknowledgement mail to intern / mentor.
                        List<GeneralInternshipFeedback> generalAcknowledgements = generalFeedbacks.Where(f => f.Type != "Behaviour" && f.IsPublished != true && f.IsPublished != false).ToList();
                        logger.LogInformation($"GeneralAcknowledgements:{generalAcknowledgements}");

                        foreach (var generalAcknowledgement in generalAcknowledgements)
                        {
                            Internship internship = internships.FirstOrDefault(i => i.Id == generalAcknowledgement.InternshipId && i.isDismissed == false);
                            if (internship == null){ continue; }
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            if (internship == null || intern == null || course == null) { continue; }
                            List<string> receivers = new List<string>();
                            List<string> mentorIds = internship.MentorId.Split(",").ToList();

                            receivers.AddRange(mentorIds);
                            receivers.Add(intern.UserId);
                            if (receivers.Contains(generalAcknowledgement.CreatedById))
                            {
                                receivers.Remove(generalAcknowledgement.CreatedById);
                            }
                            foreach (string id in receivers)
                            {
                                AcknowledgmentModel model = new AcknowledgmentModel()
                                {
                                    CourseName = course.Name,
                                };
                                var user = users.FirstOrDefault(f => f.Id == id);
                                if (user is ApplicationUser applicationUser && !applicationUser.isDeleted)
                                {
                                    model.AcknowledgedByName = generalAcknowledgement.CreatedByName;
                                    model.ReceiverFirstName = applicationUser.FirstName;
                                    model.EmailId = user.Email;
                                }

                                string subject = EmailSubjects.InternshipAcknowledgementSubject(model.AcknowledgedByName, model.CourseName);
                                string emailFeedbackBody = NotificationTemplates.GetAcknowledgementMailBody(model);
                                bool isMailSent = await emailNotificationService.SendEmailAsync(model.EmailId, subject, emailFeedbackBody);
                                logger.LogInformation($"Acknowledgement:{isMailSent}");
                                if (isMailSent)
                                {
                                    generalAcknowledgement.IsNotified = true;
                                    generalInternshipFeedbacks.Add(generalAcknowledgement);
                                }
                            }
                        }
                        dbContext.GeneralInternshipFeedbacks.UpdateRange(generalInternshipFeedbacks);
                        await dbContext.SaveChangesAsync();
                        generalInternshipFeedbacks.Clear();
                        logger.LogInformation($"Acknowledgements updated successfully");


                        //Send Reminder email to the mentor for completing evaluation after 2 days of course end date
                        List<Internship> internshipFinalReminder = internships.Where(i => i.IsEndNotified && !i.IsEvaluated && i.isDismissed == false).ToList();
                        logger.LogInformation($"InternshipFinalReminder:{internshipFinalReminder}");
                        foreach (var internship in internshipEndReminder)
                        {
                            Intern intern = interns.FirstOrDefault(i => i.Id == internship.InternId && !i.IsDeleted);
                            List<string> mentorIds = internship.MentorId.Split(",").ToList();
                            Course course = courses.FirstOrDefault(c => c.Id == internship.CourseId && !c.IsDeleted);
                            if (intern == null || course == null) { continue; }
                            List<string> topicOfCourse = topics.Where(t => t.CourseId == internship.CourseId && !t.IsDeleted).Select(t => t.Id).ToList();
                            List<string> assignmentsOfTopics = assignments.Where(a => topicOfCourse.Contains(a.TopicId) && !a.IsDeleted).Select(a => a.Id).ToList();
                            var assignmentFeedbacks = submissionsFeedback.Where(f => mentorIds.Contains(f.ReviewerId) && f.InternshipId == internship.Id && !f.IsDeleted).GroupBy(f => f.ReviewerId).ToList();
                            List<string> workingDays;
                            if (intern?.BatchId != null)
                            {
                                var batch = batches.FirstOrDefault(b => b.Id == intern.BatchId);
                                workingDays = batch?.WeekdaysNames.ToList() ?? new List<string>();
                            }
                            else
                            {
                                workingDays = new List<string>();
                            }
                            DateTime endDate = CalculateDate(internship.StartDate, course.Duration, workingDays);
                            if (DateTime.UtcNow >= endDate.AddHours(48) && DateTime.UtcNow <= endDate.AddHours(64) && assignmentsOfTopics.Count() != assignmentFeedbacks.Count())
                            {
                                foreach (var group in assignmentFeedbacks)
                                {
                                    if (mentorIds.Contains(group.Key))
                                    {
                                        mentorIds.Remove(group.Key);
                                    }
                                }
                                //Sending mail to all mentors for an internship.
                                bool isAllMailSent = true;
                                foreach (var mentorId in mentorIds)
                                {
                                    NotificationModel mentorEndMailfields = new NotificationModel
                                    {
                                        CourseName = course.Name,
                                        EndDate = endDate,
                                        InternFirstName = intern.FirstName,
                                        InternLastName = intern.LastName,
                                    };
                                    var mentor = users.FirstOrDefault(f => f.Id == mentorId);
                                    if (mentor is ApplicationUser applicationUser && !applicationUser.isDeleted)
                                    {
                                        mentorEndMailfields.EmailId = mentor.Email;
                                        mentorEndMailfields.MentorNames = $"{applicationUser.FirstName} {applicationUser.LastName}";
                                    }
                                    string subject = EmailSubjects.InternshipFinalReminderSubject(course.Name);
                                    string emailMentorInternshipEvaluateBody = NotificationTemplates.GetFinalReminderMailBody(mentorEndMailfields);
                                    bool isMailSent = await emailNotificationService.SendEmailAsync(mentorEndMailfields.EmailId, subject, emailMentorInternshipEvaluateBody);
                                    logger.LogInformation($"Deadline mail status:{isMailSent}");
                                    if (!isMailSent)
                                    {
                                        isAllMailSent = false;
                                    }
                                }
                                if (isAllMailSent)
                                {
                                    internship.IsEvaluated = true;
                                    updatedInternships.Add(internship);
                                }
                            }
                        }
                        dbContext.Internship.UpdateRange(updatedInternships);
                        await dbContext.SaveChangesAsync();
                        updatedInternships.Clear();
                    }
                }
                catch (NullReferenceException nullEx)
                {
                    logger.LogError($"Null reference exception occurred: {nullEx.Message}", nullEx);
                    
                }
                catch (Exception ex)
                {
                    if (ex != null)
                    {
                        logger.LogError($"NotificationService task failed with exception {ex}", ex);
                    }
                    else
                    {
                        logger.LogError("NotificationService task failed with a null exception");
                    }
                }

                logger.LogInformation($"NotificationService task doing background work.");

                await Task.Delay(3000000, stoppingToken);
            }

            logger.LogInformation($"NotificationService background task is stopping.");
        }

        private static DateTime CalculateDate(DateTime startDate, int durationInDays, List<string> workingDays)
        {
            DateTime endDate = startDate;

            while (durationInDays > 1)
            {
                endDate = endDate.AddDays(1);
                if (workingDays.Contains(endDate.DayOfWeek.ToString()))
                {
                    durationInDays--;
                }
            }
            return endDate;
        }


    }
}
