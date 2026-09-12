using EventParking.API.DTOs;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static EventParking.API.DTOs.AuthDTOs;

namespace EventParking.API.Services
{
    public class AuthService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService; // Added

        public AuthService(ICustomerRepository customerRepository, IConfiguration config, IEmailService emailService)
        {
            _customerRepository = customerRepository;
            _config = config;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            if (await _customerRepository.GetByEmailAsync(dto.Email) != null)
                throw new Exception("Email is already registered.");

            var plainToken = GenerateSecureToken(); // Generate plain token

            var customer = new Customer
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                EmailVerificationToken = HashToken(plainToken), // STORE HASHED
                EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24),
                EmailVerified = false,
                Status = "Pending"
            };

            await _customerRepository.AddAsync(customer);

            // Send plain token via email
            await _emailService.SendVerificationEmailAsync(customer.Email, plainToken);

            return new AuthResponseDto(string.Empty, "Registration successful. Please verify your email.");
        }

        // LoginAsync remains exactly the same as your code...
        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var customer = await _customerRepository.GetByEmailAsync(dto.Email);
            if (customer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
                throw new Exception("Invalid email or password.");
            if (!customer.EmailVerified)
                throw new Exception("Please verify your email address before logging in.");
            if (customer.Status == "Deactivated")
                throw new Exception("Your account has been deactivated. Please contact support.");

            var token = GenerateJwtToken(customer);
            return new AuthResponseDto(token, customer.Id.ToString());
        }

        public async Task<bool> VerifyEmailAsync(string plainToken)
        {
            var hashedToken = HashToken(plainToken); // Hash to compare with DB
            var customer = await _customerRepository.GetByVerificationTokenAsync(hashedToken);

            if (customer == null || customer.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
                return false;

            customer.EmailVerified = true;
            customer.EmailVerificationToken = null;
            customer.EmailVerificationTokenExpiresAt = null;
            customer.Status = "Active";

            await _customerRepository.UpdateAsync(customer);
            return true;
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var customer = await _customerRepository.GetByEmailAsync(dto.Email);
            if (customer != null)
            {
                var plainToken = GenerateSecureToken();
                customer.PasswordResetToken = HashToken(plainToken); // STORE HASHED
                customer.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(60);

                await _customerRepository.UpdateAsync(customer);

                // Send email
                await _emailService.SendPasswordResetEmailAsync(customer.Email, plainToken);
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var hashedToken = HashToken(dto.Token); // Hash to compare with DB
            var customer = await _customerRepository.GetByResetTokenAsync(hashedToken);

            if (customer == null || customer.PasswordResetTokenExpiresAt < DateTime.UtcNow)
                throw new Exception("Invalid or expired reset token.");

            customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            customer.PasswordResetToken = null;
            customer.PasswordResetTokenExpiresAt = null;

            await _customerRepository.UpdateAsync(customer);
        }

        // --- NEW METHOD FOR MODULE 9 ---
        public async Task<bool> ResendVerificationEmailAsync(ResendVerificationDto dto)
        {
            var customer = await _customerRepository.GetByEmailAsync(dto.Email);
            if (customer == null || customer.EmailVerified)
                return false; // Don't resend if already verified or doesn't exist

            var plainToken = GenerateSecureToken();
            customer.EmailVerificationToken = HashToken(plainToken);
            customer.EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24);

            await _customerRepository.UpdateAsync(customer);
            await _emailService.SendVerificationEmailAsync(customer.Email, plainToken);

            return true;
        }

        private string GenerateSecureToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }

        // --- NEW HELPER FOR SECURITY ---
        private string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hashedBytes);
        }

        private string GenerateJwtToken(Customer customer)
        {
            // Remains exactly the same as your code...
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, customer.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, customer.Email),
                new Claim(ClaimTypes.Role, string.IsNullOrEmpty(customer.Role) ? "Customer" : customer.Role)
            };
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}