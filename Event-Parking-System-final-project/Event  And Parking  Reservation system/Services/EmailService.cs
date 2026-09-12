using EventParking.API.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Net.Mail;

namespace EventParking.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendVerificationEmailAsync(string email, string token)
        {
            var frontendUrl = _config["EmailSettings:FrontendUrl"];
            var verifyLink = $"{frontendUrl}/verify-email.html?token={token}";
            var subject = "Verify your Event Parking Account";
            var body = $"Welcome! Please click the link below to verify your email address:\n\n{verifyLink}";

            await SendEmailAsync(email, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string email, string token)
        {
            var frontendUrl = _config["EmailSettings:FrontendUrl"];
            var resetLink = $"{frontendUrl}/reset-password.html?token={token}";
            var subject = "Reset your Event Parking Password";
            var body = $"You requested a password reset. Click the link below to create a new password:\n\n{resetLink}\n\nIf you did not request this, please ignore this email.";

            await SendEmailAsync(email, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string plainTextContent)
        {
            var apiKey = _config["EmailSettings:SendGridApiKey"];
            var senderEmail = _config["EmailSettings:SenderEmail"];
            var senderName = _config["EmailSettings:SenderName"];

            var client = new SendGridClient(apiKey);
            var from = new EmailAddress(senderEmail, senderName);
            var to = new EmailAddress(toEmail);

            var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent: null);

            var response = await client.SendEmailAsync(msg);

            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[SUCCESS] SendGrid email sent to {toEmail}");
            }
            else
            {
                Console.WriteLine($"[ERROR] SendGrid failed. Status Code: {response.StatusCode}");
            }
        }
    }
}