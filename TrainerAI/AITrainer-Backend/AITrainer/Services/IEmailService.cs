﻿namespace AITrainer.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string recipient, string subject, string body);
    }
}
