namespace EventParking.API.Models
{
    public class ParkingSlot
    {
        public int Id { get; set; }

        public int EventId { get; set; }
        public Event? Event { get; set; }

        public string Zone { get; set; } = string.Empty;
        public int SlotNumber { get; set; }

        public decimal Fee { get; set; }
        public string Status { get; set; } = "Available"; // Available, Reserved
    }
}
