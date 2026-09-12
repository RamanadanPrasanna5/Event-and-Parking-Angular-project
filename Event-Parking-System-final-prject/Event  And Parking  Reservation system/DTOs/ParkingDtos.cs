namespace EventParking.API.DTOs
{
    public class ParkingSlotDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string Zone { get; set; } = string.Empty;
        public int SlotNumber { get; set; }
        public decimal Fee { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class GenerateParkingLayoutDto
    {
        public string Zone { get; set; } = "General";
        public int NumberOfSlots { get; set; }
        public decimal DefaultFee { get; set; }
    }

    public class UpdateParkingSlotDto
    {
        public string Zone { get; set; } = string.Empty;
        public int SlotNumber { get; set; }
        public decimal Fee { get; set; }
    }

    public class ReserveParkingDto
    {
        public int ParkingSlotId { get; set; }
    }
}