using Amazon.SimpleEmail.Model;
using Amazon.SimpleEmail;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using VirtaulAid.Interfaces;
using Volo.Abp.Application.Services;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using VirtaulAid.DTOs.Templates;

namespace VirtaulAid.Services
{

    public class TemplateAppService : ApplicationService, ITemplateAppService
    {
        private readonly IAmazonSimpleEmailService _sesClient;

        public TemplateAppService(IAmazonSimpleEmailService sesClient)
        {
            _sesClient = sesClient;
        }

        /// <summary>
        /// Method to create email template in AWS SES.
        /// </summary>
        /// <param name="templateCreationDto">Template details.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task CreateEmailTemplateAsync(TemplateCreationDto templateCreationDto)
        {
            var createTemplateRequest = new CreateTemplateRequest
            {
                Template = new Template
                {
                    TemplateName = templateCreationDto.TemplateName, // For example : MyTemplate
                    SubjectPart = templateCreationDto.SubjectPart, // For example : Template example
                    HtmlPart = templateCreationDto.HtmlPart, // For example : <!DOCTYPE html> <html> <body><p>Hello,</p></body> </html>
                    TextPart = templateCreationDto.TextPart // For example : This email is for testing purpose.
                }
            };

            try
            {
                var createTemplateResponse = await _sesClient.CreateTemplateAsync(createTemplateRequest);
                // Handle the response if needed
            }
            catch (AmazonSimpleEmailServiceException ex)
            {
                // Handle the exception
                throw ex;
            }
        }

        /// <summary>
        /// Method to get list of templates.
        /// </summary>
        /// <param name="numberOfTemplates">Number of templates required.</param>
        /// <returns>List of the template.</returns>
        [Authorize]
        public async Task<List<TemplateMetadata>> GetEmailTemplateAsync(int numberOfTemplates)
        {
            var listRequest = new ListTemplatesRequest();
            listRequest.MaxItems = numberOfTemplates;

            try
            {
                var createTemplateResponses = await _sesClient.ListTemplatesAsync(listRequest);
                return createTemplateResponses.TemplatesMetadata;
                // Handle the response if needed
            }
            catch (AmazonSimpleEmailServiceException ex)
            {
                // Handle the exception
                throw ex;
            }
        }

        /// <summary>
        /// Method to get template content by template name. We are not authorizing this endpoint because it will used for login endpoint.
        /// </summary>
        /// <param name="templateName">Name of the template.</param>
        /// <returns>Content of the template.</returns>
        public async Task<Template> GetEmailTemplateContentByTemplateNameAsync(string templateName)
        {
            var templateRequest = new GetTemplateRequest
            {
                TemplateName = templateName
            };

            var response = await _sesClient.GetTemplateAsync(templateRequest);

            if (response.Template == null)
            {
                throw new Exception($"SES template '{templateName}' not found.");
            }

            return response.Template; // You can retrieve HTML, text, or subject based on your needs.
        }

        /// <summary>
        /// Method to send email with template. Currently it is not configured from AWS.
        /// </summary>
        /// <param name="templateName">Name of the template.</param>
        /// <param name="toAddress">Recepient address.</param>
        /// <param name="templateData">Template data.</param>
        [Authorize]
        public void SendEmailWithTemplate(string templateName, string toAddress, Dictionary<string, string> templateData)
        {
            var sendTemplatedEmailRequest = new SendTemplatedEmailRequest
            {
                Source = toAddress,
                Destination = new Destination
                {
                    ToAddresses = new List<string> { toAddress }
                },
                Template = templateName,
                TemplateData = JsonSerializer.Serialize(templateData)
            };

            _sesClient.SendTemplatedEmailAsync(sendTemplatedEmailRequest);
        }

        /// <summary>
        /// Method to update email template in AWS SES.
        /// </summary>
        /// <param name="templateCreationDto">Template details.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task UpdateEmailTemplateAsync(TemplateCreationDto templateCreationDto)
        {
            var updateTemplateRequest = new UpdateTemplateRequest
            {
                Template = new Template
                {
                    TemplateName = templateCreationDto.TemplateName, // For example : MyTemplate
                    SubjectPart = templateCreationDto.SubjectPart, // For example : Template example
                    HtmlPart = templateCreationDto.HtmlPart, // For example : <!DOCTYPE html> <html> <body><p>Hello,</p></body> </html>
                    TextPart = templateCreationDto.TextPart // For example : This email is for testing purpose.
                }
            };

            try
            {
                var updateTemplateResponse = await _sesClient.UpdateTemplateAsync(updateTemplateRequest);
                // Handle the response if needed
            }
            catch (AmazonSimpleEmailServiceException ex)
            {
                // Handle the exception
                throw ex;
            }
        }

        /// <summary>
        /// Method to delete the email template.
        /// </summary>
        /// <param name="templateName">name of the template.</param>
        /// <returns>Task.</returns>
        [Authorize]
        public async Task DeleteEmailTemplateAsync(string templateName)
        {
            var deleteTemplateRequest = new DeleteTemplateRequest
            {
                TemplateName = templateName
            };

            try
            {
                var deleteTemplateResponse = await _sesClient.DeleteTemplateAsync(deleteTemplateRequest);
                // Handle the response if needed
            }
            catch (AmazonSimpleEmailServiceException ex)
            {
                // Handle the exception
                throw ex;
            }
        }
    }
}
