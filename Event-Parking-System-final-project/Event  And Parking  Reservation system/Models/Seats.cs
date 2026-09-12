namespace EventParking.API.Models
{
    public class Seat
    {
        public int Id { get; set; }

        // Foreign Key to the Event
        public int EventId { get; set; }
        public Event? Event { get; set; }

        public string Row { get; set; } = string.Empty; // e.g., "A", "B", "C"
        public int SeatNumber { get; set; }
        public string Status { get; set; } = "Available"; // Available, Locked, Booked
        public decimal Price { get; set; }
    }
}
