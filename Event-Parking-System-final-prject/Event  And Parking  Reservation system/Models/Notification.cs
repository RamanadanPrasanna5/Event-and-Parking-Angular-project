namespace EventParking.API.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}