namespace EventParking.API.DTOs
{
    public class CreateUnifiedBookingDto
    {
        public List<int> SeatIds { get; set; } = new List<int>();
        public int? ParkingSlotId { get; set; } // Optional parking
    }

    public class HoldStatusDto
    {
        public string BookingNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public double RemainingSeconds { get; set; }
    }

    public class CustomerBookingDto
    {
        public int Id { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<string> SeatNumbers { get; set; } = new List<string>();
        public string ParkingDetails { get; set; } = "None";
    }
}