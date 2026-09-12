namespace EventParking.API.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string BookingNumber { get; set; } = string.Empty; // e.g., BKG-2026-000123
        public string CustomerEmail { get; set; } = string.Empty;

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
        public decimal TotalPrice { get; set; }

        // NEW MODULE 6 FIELDS
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Expired
        public DateTime HoldExpiresAt { get; set; }
    }
}