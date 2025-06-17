using AITrainer.AITrainer.Core.Dto.LeavesApplication;
using AITrainer.AITrainer.Core.Dto.PunchRecords;

namespace AITrainer.AITrainer.Core.Dto.Notification
{
    public class NotificationTemplates
    {

        public static string GetStartInternshipEmailBody(NotificationModel data)
        {
            return $"""

                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Template</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                            <!-- Header -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td >
                                       <p style="margin-bottom: 50px; color: #666;"><strong>Hello {data.InternFirstName}</strong>,</p> 
                                        <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">You have been invited to participate in the <strong>{data.CourseName}</strong> Course.</p>
                                        <p style="color: #666;">The details of the course are mentioned below:</p>
                                     </td>
                                 </tr>
                                 <tr>
                                   <td align="center" style="background-color: #f8f8f8; padding: 20px ;border-radius: 20px;">
                                        <p style="color: #666;">Start Date: {data.StartDate?.Day}/{data.StartDate?.Month}/{data.StartDate?.Year}</p>
                                        <p style="color: #666;">Duration: {data.CourseDuration} Days</p>
                                     <p style="color: #666;">Assigned Mentors: {data.MentorNames} </p> 
                                   </td>
                                 </tr>
                                 <tr >
                                   <td >
                                     <p style="color: #666; padding-top: 20px;">Please click the link below to log in: </p>
                                        <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                       <button style="background-color: #007BFF;color: #fff;padding: 20px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                     </a>
                                     <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                        <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                    </td>
                                 </tr>
                            </table>

                            <!-- Footer -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                            </body>
                            </html> 

                """;
        }
        public static string GetStartInternshipMentorEmailBody(NotificationModel data)
        {
            return $"""
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Email Template</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                        <!-- Header -->
                        <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                            <tr>
                                <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                    <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                </td>
                            </tr>
                        </table>

                        <!-- Content -->
                                <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                        <tr>
                                            <td >
                                               <p style="margin-bottom: 50px; color: #666;"><strong>Hello {data.MentorNames}</strong>,</p> 
                                                <p style="color: #666;">Greetings!</p>
                                               <p style="color: #666;">You have been invited to join in the <strong>{data.CourseName}</strong> course as mentor.</p>
                                                <p style="color: #666;">The details of the course are mentioned below:</p>
                                             </td>
                                         </tr>
                                         <tr>
                                           <td align="center" style="background-color: #f8f8f8; padding: 20px ;border-radius: 20px;">
                                                <p style="color: #666;">Start Date: {data.StartDate?.Day}/{data.StartDate?.Month}/{data.StartDate?.Year}</p>
                                                <p style="color: #666;">Duration: {data.CourseDuration} Days</p>
                                             <p style="color: #666;">Assigned Mentors: Assigned Intern: {data.InternFirstName} {data.InternLastName}  </p> 
                                           </td>
                                         </tr>
                                         <tr >
                                           <td >
                                             <p style="color: #666; padding-top: 20px;">Please click the link below to log in: </p>
                                            <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                               <button style="background-color: #007BFF;color: #fff;padding: 20px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                             </a>
                                             <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                            <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                            </td>
                                         </tr>
                        </table>

                        <!-- Footer -->
                        <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                            <tr>
                                <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                    <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>

                        </body>
                        </html> 
                """;
        }
        public static string GetEndInternshipEmailBody(NotificationModel data)
        {
            return $"""

                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Template</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                            <!-- Header -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 20px;">
                                        <p style="margin-bottom: 20px; color: #666;">Hello <strong>{data.InternFirstName}</strong>,</p>
                                        <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">Your course <strong>{data.CourseName}</strong> concludes on{data.EndDate.Value.ToString("dd/MM/yyyy")}. Kindly finish your course and submit assignments by tomorrow. Access to the course and submissions will cease after the end date.</p>
                                    </td>
                                </tr>
                                <tr >
                                  <td style="padding: 0 20px;">
                                    <p style="color: #666; ">Please click the link below to log in: </p>
                                        <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                      <button style="background-color: #007BFF;color: #fff;padding: 15px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                    </a>
                                    <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                        <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                    </td>

                                </tr>
                            </table>

                            <!-- Footer -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                            </body>
                            </html> 

                """;
        }
        public static string GetEndInternshipMentorEmailBody(NotificationModel data)
        {
            return $"""
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Email Template</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                        <!-- Header -->
                        <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                            <tr>
                                <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                    <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                </td>
                            </tr>
                        </table>

                        <!-- Content -->
                        <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                            <tr>
                                    <td style="padding: 0 20px;">
                                        <p style="margin-bottom: 20px; color: #666;">Hello <strong>{data.MentorNames} </strong>,</p>
                                    <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">This is to inform you that {data.InternFirstName}'s course, " <strong>{data.CourseName}</strong>" is concluding tomorrow. Kindly review his assignments within the next two days following the course {data.EndDate.Value.ToString("dd/MM/yyyy")}.</p>
                                        </td>
                                </tr>
                                <tr >
                                    <td style="padding: 0 20px;">
                                    <p style="color: #666; ">Please click the link below to log in: </p>
                                    <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                        <button style="background-color: #007BFF;color: #fff;padding: 15px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                    </a>
                                    <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                    <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                </td>

                            </tr>
                        </table>

                        <!-- Footer -->
                        <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                            <tr>
                                <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                    <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>

                        </body>
                        </html> 
                """;
        }
        public static string GetSubmissionEmailBody(NotificationModel data)
        {
            return $"""

                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Template</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                            <!-- Header -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 20px;">
                                        <p style="margin-bottom: 20px; color: #666;">Hello <strong>{data.MentorNames} </strong>,</p>
                                        <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">This is to inform you that {data.InternFirstName}  has submitted the {data.SubmissionCount} submissions for \"{data.CourseName}\" on {data.SubmissionDate}.</p>
                                      </td>
                                </tr>
                                <tr >
                                  <td style="padding: 0 20px;">
                                    <p style="color: #666; ">Please click the link below to log in: </p>
                                        <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                      <button style="background-color: #007BFF;color: #fff;padding: 15px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                    </a>
                                    <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                        <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                    </td>

                                </tr>
                            </table>

                            <!-- Footer -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                            </body>
                            </html> 

                """;
        }

        public static string GetFeedbackEmailBody(NotificationModel data, DateTime? date)
        {
            string dateTime = "";
            if (date.HasValue)
            {
                string formattedDate = date.Value.ToString("MMM dd, yyyy");
                string formattedTime = date.Value.ToString("hh:mm tt");
                dateTime = $"{formattedDate}  {formattedTime}";
                Console.WriteLine($"{formattedDate}  {formattedTime}");
            }
            return $$"""

                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Template</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                            <!-- Header -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 20px;">
                                        <p style="margin-bottom: 20px; color: #666;">Hello <strong>{{data.InternFirstName}} </strong>,</p>
                                        <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">Your feedback and scores have been published for “{{data.CourseName}}” by “{{data.MentorNames}}” at {{dateTime}}. Kindly review it and give your acknowledgement by today.</p>
                                      </td>
                                </tr>
                                <tr >
                                  <td style="padding: 0 20px;">
                                    <p style="color: #666; ">Please click the link below to log in: </p>
                                    <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                      <button style="background-color: #007BFF;color: #fff;padding: 15px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                    </a>
                                    <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                    <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                  </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                            </body>
                            </html> 

                """;
        }
        public static string GetAcknowledgementMailBody(AcknowledgmentModel data)
        {
            return $$"""
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Template</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                            <!-- Header -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                    </td>
                                </tr>
                            </table>
                                        
                            <!-- Content -->
                            <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 20px;">
                                        <p style="margin-bottom: 20px; color: #666;">Hello <strong>{{data.ReceiverFirstName}} </strong>,</p>
                                        <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">{{data.AcknowledgedByName}} has provided his feedback for “{{data.CourseName}}” . Kindly review it and give your acknowledgement by today.</p>
                                      </td>
                                </tr>
                                <tr >
                                  <td style="padding: 0 20px;">
                                    <p style="color: #666; ">Please click the link below to log in: </p>
                                    <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                      <button style="background-color: #007BFF;color: #fff;padding: 15px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                    </a>
                                    <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                        <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                            </body>
                            </html> 
                    """;
        }

        public static string GetFinalReminderMailBody(NotificationModel data)
        {
            return $$"""
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                            <meta charset="UTF-8">
                            <meta http-equiv="X-UA-Compatible" content="IE=edge">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Email Template</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

                            <!-- Header -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <img src="../../../assets/Cover Image.png" alt="Company logo" style="width: 100%;">
                                    </td>
                                </tr>
                            </table>

                            <!-- Content -->
                            <table align="center" cellpadding="0" cellspacing="0" width="400" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 20px;">
                                        <p style="margin-bottom: 20px; color: #666;">Hello <strong>{data.MentorNames} </strong>,</p>
                                        <p style="color: #666;">Greetings!</p>
                                        <p style="color: #666;">This is to inform you that {{data.InternFirstName}}'s course "{{data.CourseName}}," has concluded on “{{data.EndDate.Value.ToString("dd/MM/yyyy")}}”. Kindly prioritize reviewing his assignments and providing feedback and scores in Trainer AI . 
                                        </p>
                                        </td>
                                </tr>
                                <tr >
                                    <td style="padding: 0 20px;">
                                    <p style="color: #666; ">Please click the link below to log in: </p>
                                    <a href='https://aitrainer.promactinfo.xyz/#/login' style='text-decoration: none;'>
                                        <button style="background-color: #007BFF;color: #fff;padding: 15px 20px;border: none;border-radius: 50px;cursor: pointer;width: 100%;">Click Here</button>          
                                    </a>
                                    <p style=" padding-top: 20px ;color: #666;"> Regards,</p>
                                    <h3 style="margin-bottom: 20px; color: #666;"> Promact Infotech Private Limited</h3>
                                    </td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <table align="center" cellpadding="0" cellspacing="0" width="600" style="margin: 20px auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="background-color: #f8f8f8; padding: 20px 0;">
                                        <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>

                            </body>
                            </html>

                """;
        }
        public static string GetLeaveApplicationEmailBody(LeaveNotificationModel data)
        {
            string leavetype =  data.leaveType == "Work From Home" ? data.leaveType : "leave";
            return $"""
             <!DOCTYPE html>
             <html lang="en">
             <head>
                 <meta charset="UTF-8">
                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Leave Application</title>
             </head>
             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

             <!-- Main email container -->
             <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">

                 <!-- Header with logo -->
                 <div style="text-align: center; background-color: #fff; padding: 20px; border-radius: 10px;margin: 0; padding: 0; display: flex; justify-content: center; align-items: center;">
                 <div style="font-size: 48px; font-weight: bold; letter-spacing: 1px; color: #333; font-family: Arial, sans-serif; display: inline-block;padding: 10px;margin-bottom:40px">
                     <span>PR</span>
                     <span style="color: #f9c31b;">O</span>
                     <span>MACT</span>
                 </div>
             </div>

                 <!-- Greeting -->
                 <p style="color: #666;">Dear <strong> {data.AdminName},</strong></p>

                 <!-- Main Content -->
                 <p style="color: #666;"><strong>{data.InternFirstName} {data.InternLastName}</strong> has applied for {leavetype}. Below are the details:</p>

                 <!-- Details Table -->
                 <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                     <tr>
                         <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Leave Period</th>
                         <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveStartDate.ToString("MMM dd, yyyy")} - {data.leaveEndDate?.ToString("MMM dd, yyyy")}</strong></td>
                     </tr>
                     <tr>
                         <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Duration</th>
                         <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveDuration} day(s)</strong></td>
                     </tr>
                     <tr>
                         <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Leave Type</th>
                         <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveType}</strong></td>
                     </tr>
                     <tr>
                         <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Reason</th>
                         <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveReason}</strong></td>
                     </tr>
                 </table>

                 <p style="color: #666; padding-top: 20px;">Please approve/ reject the leave request by clicking <a href={data.URL}> here</a>.</p>

                 <!-- Closing Message -->
                 <p style="color: #666; padding-top: 20px;">Best Regards,</p>
                 <p style="color: #666;">The PROMACT INFOTECH PRIVATE LIMITED Team</p>

                 <!-- Footer -->
                 <div style="text-align: center; background-color: #f8f8f8; padding: 20px 0; margin-top: 20px;">
                     <p style="margin: 0; color: #666;">&copy; 2024 PROMACT INFOTECH PRIVATE LIMITED. All rights reserved.</p>
                 </div>

             </div>

             </body>
             </html>
              
             """;
        }
        public static string GetLeaveRequestDeletionEmailBody(LeaveNotificationModel data)
        {
            string leavetype = data.leaveType == "Work From Home" ? data.leaveType : "leave";
            return $"""
             <!DOCTYPE html>
             <html lang="en">
             <head>
                 <meta charset="UTF-8">
                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Leave Request Deletion</title>
             </head>
             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

                 <!-- Main email container -->
                 <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">

                     <!-- Header with logo -->
                     <div style="text-align: center; background-color: #fff; padding: 20px; border-radius: 10px; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center;">
                         <div style="font-size: 48px; font-weight: bold; letter-spacing: 1px; color: #333; font-family: Arial, sans-serif; display: inline-block; padding: 10px; margin-bottom: 40px;">
                             <span>PR</span>
                             <span style="color: #f9c31b;">O</span>
                             <span>MACT</span>
                         </div>
                     </div>

                     <!-- Greeting -->
                     <p style="color: #666;">Dear  <strong>{data.AdminName},</strong></p>

                     <!-- Main Content -->
                     <p style="color: #666;"><strong>{data.InternFirstName} {data.InternLastName}</strong> has deleted for {leavetype}. Below are the details:</p>

                     <!-- Details Table -->
                     <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                         <tr>
                             <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Leave Period</th>
                             <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveStartDate.ToString("MMM dd, yyyy")} - {data.leaveEndDate?.ToString("MMM dd, yyyy")}</strong></td>
                         </tr>
                         <tr>
                             <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Duration</th>
                             <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveDuration} day(s)</strong></td>
                         </tr>
                         <tr>
                             <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Leave Type</th>
                             <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveType}</strong></td>
                         </tr>
                         <tr>
                             <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Reason</th>
                             <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveReason}</strong></td>
                         </tr>
                     </table>

                     <!-- Closing Message -->
                     <p style="color: #666; padding-top: 20px;">Best Regards,</p>
                     <p style="color: #666;">The PROMACT INFOTECH PRIVATE LIMITED Team</p>

                     <!-- Footer -->
                     <div style="text-align: center; background-color: #f8f8f8; padding: 20px 0; margin-top: 20px;">
                         <p style="margin: 0; color: #666;">&copy; 2024 PROMACT INFOTECH PRIVATE LIMITED. All rights reserved.</p>
                     </div>

                 </div>

             </body>
             </html>
                  
             """;
        }
        public static string GetLeaveApprovalEmailBody(LeaveNotificationModel data)
        {
            string leavetype = data.leaveType == "Work From Home" ? data.leaveType : "leave";
            string approvalStatus = data.leaveStatus;
            string actionMessage = data.leaveStatus == "Approved"
                ? "You can proceed with your leave as per the details below."
                : "Unfortunately, your leave request has been rejected.";

            return $"""
             <!DOCTYPE html>
             <html lang="en">
             <head>
               <meta charset="UTF-8">
               <meta http-equiv="X-UA-Compatible" content="IE=edge">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>Leave Request {approvalStatus}</title>
             </head>
             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

               <!-- Main email container -->
               <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">

                 <!-- Header with logo -->
                 <div style="text-align: center; background-color: #fff; padding: 20px; border-radius: 10px;margin: 0; padding: 0; display: flex; justify-content: center; align-items: center;">
                 <div style="font-size: 48px; font-weight: bold; letter-spacing: 1px; color: #333; font-family: Arial, sans-serif; display: inline-block;padding: 10px;margin-bottom:40px">
                     <span>PR</span>
                     <span style="color: #f9c31b;">O</span>
                     <span>MACT</span>
                 </div>
             </div>

                 <!-- Greeting -->
                 <p style="color: #666;">Dear <strong> {data.InternFirstName},</strong></p>

                 <!-- Main Content -->
                 <p style="color: #666;">Your {leavetype} request has been <strong>{approvalStatus}</strong> by <strong>{data.ApprovedBy}</strong>. Please find the details below:</p>

                 <!-- Details Table -->
                 <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Leave Period</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveStartDate.ToString("MMM dd, yyyy")} - {data.leaveEndDate?.ToString("MMM dd, yyyy")}</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Duration</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveDuration} day(s)</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Leave Type</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveType}</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Reason</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.leaveReason}</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested On</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.RequestedOn?.ToString("MMM dd, yyyy")}</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">{approvalStatus} On</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.UpdatedDate?.ToString("MMM dd, yyyy")}</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">{approvalStatus} By</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.ApprovedBy}</strong></td>
                   </tr>
                   <tr>
                     <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Comment</th>
                     <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Comments}</strong></td>
                   </tr>
                 </table>

                 <!-- Closing Message -->
                 <p style="color: #666; padding-top: 20px;">Best Regards,</p>
                 <p style="color: #666;">The PROMACT INFOTECH PRIVATE LIMITED Team</p>

                 <!-- Footer -->
                 <div style="text-align: center; background-color: #f8f8f8; padding: 20px 0; margin-top: 20px;">
                   <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
                 </div>

               </div>

             </body>
             </html>
             
            
             

             """;
        }
        public static string GetPunchRequestEmailBody(PunchRequestNotificationModel data)
        {
            return $"""
             <!DOCTYPE html>
             <html lang="en">
             <head>
                 <meta charset="UTF-8">
                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Punch Request</title>
             </head>
             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

             <!-- Main email container -->
             <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">

               <!-- Header with logo -->
               <div style="text-align: center; background-color: #fff; padding: 20px; border-radius: 10px;margin: 0; padding: 0; display: flex; justify-content: center; align-items: center;">
                 <div style="font-size: 48px; font-weight: bold; letter-spacing: 1px; color: #333; font-family: Arial, sans-serif; display: inline-block;padding: 10px;margin-bottom:40px">
                     <span>PR</span>
                     <span style="color: #f9c31b;">O</span>
                     <span>MACT</span>
                 </div>
             </div>

               <!-- Greeting -->
               <p style="color: #666;">Dear <strong>{data.AdminName},</strong></p>

               <!-- Main Content -->
               <p style="color: #666;"><strong>{data.InternFirstName} {data.InternLastName}</strong> has raised a request for attendance punches. Below are the details:</p>

               <!-- Details Table -->
               <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested For</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.PunchDate.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Punches</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Punches}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Comment</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Comments}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested On</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.RequestedOn.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
               </table>

                <p style="color: #666; padding-top: 20px;">Please approve/ reject the punch request by clicking <a href={data.URL}>here</a>.</p>
                   
               <!-- Closing Message -->
               <p style="color: #666; padding-top: 20px;">Best Regards,</p>
               <p style="color: #666;">The PROMACT INFOTECH PRIVATE LIMITED Team</p>

               <!-- Footer -->
               <div style="text-align: center; background-color: #f8f8f8; padding: 20px 0; margin-top: 20px;">
                 <p style="margin: 0; color: #666;">&copy; 2024 PROMACT INFOTECH PRIVATE LIMITED. All rights reserved.</p>
               </div>

             </div>

             </body>
             </html>
             
             
               

             """;
        }
        public static string GetPunchRequestDeletionEmailBody(PunchRequestNotificationModel data)
        {
            return $"""
             <!DOCTYPE html>
             <html lang="en">
             <head>
                 <meta charset="UTF-8">
                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                 <title>Punch Request</title>
             </head>
             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

             <!-- Main email container -->
             <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">

               <!-- Header with logo -->
               <div style="text-align: center; background-color: #fff; padding: 20px; border-radius: 10px; display: flex; justify-content: center; align-items: center;">
                 <div style="font-size: 48px; font-weight: bold; letter-spacing: 1px; color: #333; font-family: Arial, sans-serif; padding: 10px; margin-bottom: 40px;">
                     <span>PR</span>
                     <span style="color: #f9c31b;">O</span>
                     <span>MACT</span>
                 </div>
               </div>

               <!-- Greeting -->
               <p style="color: #666;">Dear <strong>{data.AdminName},</strong></p>

               <!-- Main Content -->
               <p style="color: #666;"><strong>{data.InternFirstName} {data.InternLastName}</strong> has deleted a request for attendance punches. Below are the details:</p>

               <!-- Details Table -->
               <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested For</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.PunchDate.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Punches</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Punches}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Comment</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Comments}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested On</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.RequestedOn.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
               </table>


               <!-- Closing Message -->
               <p style="color: #666; padding-top: 20px;">Best Regards,</p>
               <p style="color: #666;">The PROMACT INFOTECH PRIVATE LIMITED Team</p>

               <!-- Footer -->
               <div style="text-align: center; background-color: #f8f8f8; padding: 20px 0; margin-top: 20px;">
                 <p style="margin: 0; color: #666;">&copy; 2024 PROMACT INFOTECH PRIVATE LIMITED. All rights reserved.</p>
               </div>

             </div>

             </body>
             </html>
             
             

             """;
        }
        public static string GetPunchRequestApprovalEmailBody(PunchRequestNotificationModel data)
        {
            string approvalStatus = data.RequestStatus;

            return $"""
             <!DOCTYPE html>
             <html lang="en">
             <head>
               <meta charset="UTF-8">
               <meta http-equiv="X-UA-Compatible" content="IE=edge">
               <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <title>Punch Request {approvalStatus}</title>
             </head>
             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">

             <!-- Main email container -->
             <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px;">

               <!-- Header with logo -->
              <div style="text-align: center; background-color: #fff; padding: 20px; border-radius: 10px;margin: 0; padding: 0; display: flex; justify-content: center; align-items: center;">
                 <div style="font-size: 48px; font-weight: bold; letter-spacing: 1px; color: #333; font-family: Arial, sans-serif; display: inline-block;padding: 10px;margin-bottom:40px">
                     <span>PR</span>
                     <span style="color: #f9c31b;">O</span>
                     <span>MACT</span>
                 </div>
             </div>

               <!-- Greeting -->
               <p style="color: #666;">Dear <strong>{data.InternFirstName} {data.InternLastName},</strong></p>

               <!-- Main Content -->
               <p style="color: #666;">Your attendance request has been <strong>{approvalStatus}</strong> by <strong>{data.AdminName}</strong>. Please find the details below:</p>

               <!-- Details Table -->
               <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested For</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.PunchDate.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Punches</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Punches}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Requested On</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.RequestedOn.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">{approvalStatus} On</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.UpdatedDate?.ToString("MMM dd, yyyy")}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">{approvalStatus} By</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.AdminName}</strong></td>
                 </tr>
                 <tr>
                   <th style="padding: 10px; border: 1px solid #ddd; background-color: #f0f0f0;font-weight: normal;">Comment</th>
                   <td style="padding: 10px; border: 1px solid #ddd;"><strong>{data.Comments}</strong></td>
                 </tr>
               </table>

               <!-- Closing Message -->
               <p style="color: #666; padding-top: 20px;">Best Regards,</p>
               <p style="color: #666;">The PROMACT INFOTECH PRIVATE LIMITED Team</p>

               <!-- Footer -->
               <div style="text-align: center; background-color: #f8f8f8; padding: 20px 0; margin-top: 20px;">
                 <p style="margin: 0; color: #666;">&copy; 2024 AI Trainer. All rights reserved.</p>
               </div>

             </div>

             </body>
             </html>
             """;
        }

    }
}
