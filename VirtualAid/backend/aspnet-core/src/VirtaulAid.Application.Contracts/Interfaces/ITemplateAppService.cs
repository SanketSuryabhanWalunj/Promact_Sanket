using Amazon.SimpleEmail.Model;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using VirtaulAid.DTOs.Templates;
using Volo.Abp.Application.Services;

namespace VirtaulAid.Interfaces
{
    public interface ITemplateAppService: IApplicationService
    {
        /// <summary>
        /// Method to create email template in AWS SES.
        /// </summary>
        /// <param name="templateCreationDto">Template details.</param>
        /// <returns>Task.</returns>
        Task CreateEmailTemplateAsync(TemplateCreationDto templateCreationDto);

        /// <summary>
        /// Method to update email template in AWS SES.
        /// </summary>
        /// <param name="templateCreationDto">Template details.</param>
        /// <returns>Task.</returns>
        Task UpdateEmailTemplateAsync(TemplateCreationDto templateCreationDto);

        /// <summary>
        /// Method to delete the email template.
        /// </summary>
        /// <param name="templateName">name of the template.</param>
        /// <returns>Task.</returns>
        Task DeleteEmailTemplateAsync(string templateName);

        /// <summary>
        /// Method to get list of templates.
        /// </summary>
        /// <param name="numberOfTemplates">Number of templates required.</param>
        /// <returns>List of the template.</returns>
        Task<List<TemplateMetadata>> GetEmailTemplateAsync(int numberOfTemplates);

        /// <summary>
        /// Method to get template content by template name.
        /// </summary>
        /// <param name="templateName">Name of the template.</param>
        /// <returns>Content of the template.</returns>
        Task<Template> GetEmailTemplateContentByTemplateNameAsync(string templateName);

        /// <summary>
        /// Method to send email with template. Currently it is not configured from AWS.
        /// </summary>
        /// <param name="templateName">Name of the template.</param>
        /// <param name="toAddress">Recepient address.</param>
        /// <param name="templateData">Template data.</param>
        void SendEmailWithTemplate(string templateName, string toAddress, Dictionary<string, string> templateData);
    }
}
