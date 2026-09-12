namespace EventParking.API.Models
{
    public class Payment
    {
        public int Id { get; set; }

        public int BookingId { get; set; }
        public Booking? Booking { get; set; }

        public string CustomerEmail { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Completed";
        public string ReceiptNumber { get; set; } = string.Empty;
    }
}
