namespace EventParking.API.DTOs
{
    public class AuthDTOs
    {
        public record RegisterDto(string Name, string Email, string Phone, string Password);
        public record LoginDto(string Email, string Password);
        public record ForgotPasswordDto(string Email);
        public record ResetPasswordDto(string Token, string NewPassword);
        public record AuthResponseDto(string Token, string Message);
        public record ResendVerificationDto(string Email);
    }
}
