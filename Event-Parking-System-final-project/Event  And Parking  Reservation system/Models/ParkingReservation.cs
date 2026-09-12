namespace EventParking.API.Models
{
    public class ParkingReservation
    {
        public int Id { get; set; }

        // Link to the user's main order
        public int BookingId { get; set; }
        public Booking? Booking { get; set; }

        // Link to the specific slot
        public int ParkingSlotId { get; set; }
        public ParkingSlot? ParkingSlot { get; set; }

        // BRD Rule: Fee must be fixed at the time of reservation
        public decimal FeeAtReservation { get; set; }
    }
}
