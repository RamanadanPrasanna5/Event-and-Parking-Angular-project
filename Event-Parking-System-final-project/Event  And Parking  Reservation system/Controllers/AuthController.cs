using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.AuthDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try { return Created("", await _authService.RegisterAsync(dto)); }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                // Returning Token and CustomerId to match your vanilla JS frontend script
                return Ok(new { Token = result.Token, CustomerId = result.Message });
            }
            catch (Exception ex) { return Unauthorized(new { Message = ex.Message }); }
        }

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            var success = await _authService.VerifyEmailAsync(token);
            if (!success) return BadRequest(new { Message = "Invalid or expired token." });
            return Ok(new { Message = "Email verified successfully." });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _authService.ForgotPasswordAsync(dto);
            return Ok(new { Message = "If an account exists, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try { await _authService.ResetPasswordAsync(dto); return Ok(new { Message = "Password reset successful." }); }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
        {
            var success = await _authService.ResendVerificationEmailAsync(dto);
            if (!success)
            {
                // Return Ok anyway to prevent email enumeration (Module 9 Business Rule)
                return Ok(new { Message = "If the account exists and is unverified, a new link has been sent." });
            }
            return Ok(new { Message = "A new verification email has been sent." });
        }
    }
}