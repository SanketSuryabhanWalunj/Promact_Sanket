namespace AITrainer.AITrainer.Util
{
    public static class EmailTemplates
    {
        public static string GenerateProjectManagerInvitationEmail(string projectManagerName, string mentorName)
        {
            string emailBody = $@"
            <html>
            <head>
            </head>
            <body>
                <div class='container'>
                    <p>Dear {projectManagerName},</p>
                    <p>Greetings!</p>
                    <p>This is to inform you that <strong>{mentorName}</strong> has been invited to join the Internship as <em>Mentor</em>.</p>
                    <p>Please reach out to the internship administrators for further details about the internship.</p>
                    <br/>
                    <p>Best Regards,</p>
                    <p>Promact Infotech Private Limited</p>
                </div>
            </body>
            </html>";

            return emailBody;
        }

        public static string GenerateAdminInvitationEmail(string userFirstName, string userLastName, string createPasswordLink)
        {
            string emailBody = $@"
                 <html>
                 <body>
                 <p>Dear {userFirstName} {userLastName},</p>
                 <p>Greetings!<p>
                 <p>You have been invited to join Trainer AI for the Internship at Promact. You're just one step away from accessing your account.:</p>
                 <p>To get started, kindly click the button below to set your password:</p>
                 <p><a href='{createPasswordLink}' style='text-decoration: none;'>
                 <button style='background-color: #007BFF; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>
                     Click Here
                 </button>
                 </a></p>
                 <p>Regards,</p>
                 <p><strong> Promact Infotech Private Limited</strong></p>
                 </body>
                 </html>
            ";
            return emailBody;
        }
        public static string GenerateResetPasswordEmail(string userFirstName, string userLastName, string forgotPasswordLink)
        {
            string emailBody = $@"
                <html>
                <body>
                    <p>Dear {userFirstName} {userLastName},</p>
                    <p>We received a request to reset your password for your AI Trainer account. To reset your password, please follow the instructions below:</p>
                    <ol>
                        <li>Click the following link to reset your password:</li>
                        <a href=""{forgotPasswordLink}"">Reset Password Link</a>
                    </ol>
                    <p>If you didn't request a password reset, please ignore this email. Your account will remain secure.</p>
                    <p>For security reasons, we recommend choosing a strong and unique password. Be sure to follow these guidelines:</p>
                    <ul>
                        <li>At least 8 characters long</li>
                        <li>Contains a combination of letters (both uppercase and lowercase), numbers, and special characters</li>
                        <li>Avoid using easily guessable information, such as your name or birthdate</li>
                    </ul>
                    
                    <p>Best regards,<br><strong> Promact Infotech Private Limited</strong></p>
                </body>
                </html>
            ";
            return emailBody;
        }
        public static string GenerateCreatePasswordEmail(string userFirstName, string userLastName, string frontendAppUrl)
        {
            string emailBody = $@"
                    <html>
                    <body>
                    <p>Dear {userFirstName} {userLastName},</p>
                    <p>We're delighted to welcome you to the Promact Internship Program. You have been enrolled in Trainer AI for the Internship.</p>
                    <p>To get started, kindly click the button below to login:</p>
 
                    <a href='{frontendAppUrl}/#/login' style='text-decoration: none;'>
                    <button style='background-color: #007BFF; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>
                    Click Here
                    </button>
                    </a>
 
                    <p>Best regards,<br><strong> Promact Infotech Private Limited</strong></p>
                    </body>
                    </html>
                    ";
            return emailBody;

        }

        public static string GenerateCreateInternEmail(string userFirstName, string userLastName, string createPasswordLink)
        {
            string emailBody = $@"
                                    <html>
                                    <body>
                                    <p>Dear {userFirstName} {userLastName},</p>
                                    <p>Greetings!<p>
                                    <p>You have been invited to join Trainer AI for the Internship at Promact. You're just one step away from accessing your account.</p>
                                    <p>To get started, kindly click the button below to set your password:</p>
                                     <p><a href='{createPasswordLink}' style='text-decoration: none;'>
                                    <button style='background-color: #007BFF; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;'>
                                     Click Here
                                    </button>
                                    </a></p>
                                    <p>Regards,</p>
                                    <p><strong>Promact Infotech Private Limited</strong></p>
                                    </body>
                                    </html>
                                     ";
            return emailBody;
        }
    }
}
