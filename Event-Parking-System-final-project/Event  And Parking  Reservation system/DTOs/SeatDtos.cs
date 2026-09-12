namespace EventParking.API.DTOs
{
    public class SeatDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string Row { get; set; } = string.Empty;
        public int SeatNumber { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }

    public class UpdateSeatStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}