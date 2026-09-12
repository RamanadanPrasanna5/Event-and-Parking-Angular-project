namespace EventParking.API.DTOs
{
    public class CustomerDTOs
    {
        public record CustomerProfileDto(int Id, string Name, string Email, string Phone, string Status);
        public record UpdateProfileDto(string Name, string Phone);
    }
}
