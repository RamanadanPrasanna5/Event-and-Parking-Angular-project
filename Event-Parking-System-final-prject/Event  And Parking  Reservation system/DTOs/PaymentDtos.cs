namespace EventParking.API.DTOs
{
    public class PaymentStatusDto
    {
        public int BookingId { get; set; }
        public decimal AmountDue { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public bool IsPaid { get; set; }
    }

    public class PaymentHistoryDto
    {
        public int PaymentId { get; set; }
        public int BookingId { get; set; }
        public string ReceiptNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
    }

    public class ReceiptDto
    {
        public string ReceiptNumber { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public decimal TotalAmountPaid { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
    }
}
